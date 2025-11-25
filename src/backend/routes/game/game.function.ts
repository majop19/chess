import { ChessProfile } from "#back/models/chessProfile/chessProfile.model";
import { Game } from "#back/models/game.model";
import { Move } from "#back/models/move.model";
import { User } from "#back/models/user.model";
import { predictEloChanges } from "#front/utils/calculateChessGameElo";
import type {
  ChessGameTimerType,
  ColorType,
  CreateChessGameReturnType,
  IGame,
  MoveDataGameEventType,
  ResultChessGameType,
  IUser,
  IMove,
} from "#front/utils/types";
import mongoose, { ObjectId } from "mongoose";

export const createChessGame = async (
  userId: mongoose.Types.ObjectId | ObjectId,
  opponentId: mongoose.Types.ObjectId | ObjectId,
  timer: ChessGameTimerType,
  isRematch?: {
    whiteId: mongoose.Types.ObjectId;
    blackId: mongoose.Types.ObjectId;
  }
): Promise<CreateChessGameReturnType> => {
  try {
    const waitingGame: IGame | null = await Game.findOne({
      status: "waiting",
      $or: [
        { whiteId: userId },
        { blackId: userId },
        { whiteId: opponentId },
        { blackId: opponentId },
      ],
    });
    if (waitingGame) {
      if (waitingGame.whiteId == userId || waitingGame.blackId == userId) {
        return {
          id: waitingGame.id,
          timeLeftBeforeTimeout:
            waitingGame.turn == "white"
              ? waitingGame.whiteTime
              : waitingGame.blackTime,
        };
      }
      return "oppenentInGame";
    }
    let assignColor: {
      whiteId: mongoose.Types.ObjectId | ObjectId;
      blackId: mongoose.Types.ObjectId | ObjectId;
    } | null = null;

    if (isRematch) {
      assignColor =
        userId == isRematch.whiteId
          ? { whiteId: opponentId, blackId: userId }
          : { whiteId: userId, blackId: opponentId };
    } else {
      assignColor =
        Math.random() < 0.5
          ? { whiteId: userId, blackId: opponentId }
          : { whiteId: opponentId, blackId: userId };
    }

    const user: IUser | null = await User.findById(userId).populate(
      "chessProfile"
    );
    const opponent: IUser | null = await User.findById(opponentId).populate(
      "chessProfile"
    );
    if (!user || !opponent) throw new Error("User or opponent not found.");

    const newChessGame: IGame = new Game({
      ...assignColor,
      ...timer,
      isRated: true,
      whiteTime: timer.timeControl * 60 * 1000,
      blackTime: timer.timeControl * 60 * 1000,
      fullMoveNumber: 0,
      lastUpdateTime: new Date(Date.now()),
    });

    newChessGame.save();

    await ChessProfile.updateOne(
      { _id: user.chessProfile._id },
      { $push: { games: newChessGame._id } }
    );
    await ChessProfile.updateOne(
      { _id: opponent.chessProfile._id },
      { $push: { games: newChessGame._id } }
    );
    return {
      id: newChessGame.id,
      timeLeftBeforeTimeout: newChessGame.whiteTime,
    };
  } catch {
    throw new Error("Internal Server Error");
  }
};

export const BeginChessGame = async (gameId: ObjectId) => {
  const game: IGame | null = await Game.findById(gameId);
  if (!game) throw new Error("Internal server Error.");

  game.status = "active";
  game.lastUpdateTime = new Date(Date.now());

  await game.save();

  return {
    white: game.whiteId,
    black: game.blackId,
    turn: game.turn,
    timeLeftBeforeTimeout: game.whiteTime,
  };
};

export const UpdateChessGame = async (
  gameId: ObjectId,
  moveData: MoveDataGameEventType,
  gameData: {
    pgn: string;
    fen: string;
  }
) => {
  const game: IGame | null = await Game.findById(gameId);

  if (!game) throw new Error("Internal Server Error");

  const moveNumber =
    game.turn == "white" ? game.fullMoveNumber + 1 : game.fullMoveNumber;
  const playerTimer = game.turn == "white" ? game.whiteTime : game.blackTime;
  const timer = playerTimer - (Date.now() - game.lastUpdateTime.getTime());
  const move: IMove = new Move({
    moveNumber: moveNumber,
    color: game.turn,
    piece: moveData.piece,
    fromSquare: moveData.fromSquare,
    toSquare: moveData.toSquare,
    promotion: moveData.promotion,
    fen: moveData.fen,
    check: moveData.check,
    checkmate: moveData.checkmate,
    capturedPiece: moveData.capturedPiece,
    enPassant: moveData.enPassant,
    timestamp: timer,
  });
  if (game.turn == "white") {
    game.whiteTime = timer;
  } else {
    game.blackTime = timer;
  }
  game.fullMoveNumber = moveNumber;
  game.takesMoveNumber = move.capturedPiece ? 0 : game.takesMoveNumber + 1;
  game.moves.push(move);
  game.turn = game.turn == "white" ? "black" : "white";
  game.pgn = gameData.pgn;
  game.boardState = gameData.fen;
  game.lastUpdateTime = new Date(Date.now());
  await game.save();

  return {
    white: game.whiteId,
    black: game.blackId,
    fen: game.boardState,
    playerFinishTime: timer,
    beginTimeTurn: game.turn == "white" ? game.whiteTime : game.blackTime,
    turn: game.turn,
    endTimeOpponent: game.turn == "white" ? game.blackTime : game.whiteTime,
    move: move,
    lastUpdateTime: game.lastUpdateTime,
  };
};

export const EndChessGame = async (
  gameId: ObjectId,
  result: ResultChessGameType,
  winner: "white" | "black" | "draw"
) => {
  const game: IGame | null = await Game.findById(gameId).populate([
    "whiteId",
    "blackId",
  ]);

  if (!game) throw new Error("Internal Server Error");

  const playerTimer = game.turn == "white" ? game.whiteTime : game.blackTime;
  if (result === "timeout") {
    game[winner == "white" ? "blackTime" : "whiteTime"] = 0;
  } else {
    const timer = playerTimer - (Date.now() - game.lastUpdateTime.getTime());

    if (game.turn == "white") {
      game.whiteTime = timer;
    } else {
      game.blackTime = timer;
    }
  }
  game.status = result;
  game.winner = winner;
  await game.whiteId.populate("chessProfile");
  await game.blackId.populate("chessProfile");
  const timeMode =
    game.timeControl == 10
      ? "rapid"
      : game.timeControl == 5
      ? "blitz"
      : "bullet";
  const calculateChessGame = predictEloChanges(
    game.whiteId.chessProfile.elo[timeMode],
    game.blackId.chessProfile.elo[timeMode],
    game.winner == "white" ? 1 : game.winner == "draw" ? 0.5 : 0
  );
  console.log(
    "calculate elo chessgame",
    calculateChessGame,
    game.whiteId.chessProfile.elo[timeMode],
    game.blackId.chessProfile.elo[timeMode]
  );
  game.whiteId.chessProfile.elo[timeMode].rating =
    calculateChessGame.white.rating;
  game.blackId.chessProfile.elo[timeMode].rating =
    calculateChessGame.black.rating;
  game.whiteId.chessProfile.elo[timeMode].ratingDeviation =
    calculateChessGame.white.ratingDeviation;
  game.blackId.chessProfile.elo[timeMode].ratingDeviation =
    calculateChessGame.black.ratingDeviation;

  await game.whiteId.chessProfile.save();
  await game.blackId.chessProfile.save();
  await game.save();

  return {
    white: game.whiteId.id,
    black: game.blackId.id,
  };
};

export const UpdateTimer = async (gameId: ObjectId) => {
  const game: IGame | null = await Game.findById(gameId);

  if (!game) throw new Error("Internal Server Error");

  const playerTimer = game.turn == "white" ? "whiteTime" : "blackTime";
  game[playerTimer] =
    game[playerTimer] - (Date.now() - game.lastUpdateTime.getTime());
  game.lastUpdateTime = new Date(Date.now());
  if (game[playerTimer] < 0) {
    game[playerTimer] = 0;
    game.status = "timeout";
    game.winner = game.turn == "white" ? "black" : "white";
  }
  await game.save();

  return {
    color: playerTimer as ColorType,
    timeLeft: game[playerTimer],
    status: game.status,
  };
};
