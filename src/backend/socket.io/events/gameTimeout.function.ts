import { EndChessGame } from "#back/routes/game/game.function";
import { type ChessGameTimeoutType } from "#front/utils/types";
import { ObjectId } from "mongoose";
import { type ServerType } from "#back/socket.io/socket.types";

export const gameTimeout = (
  io: ServerType,
  activeGames: Map<ObjectId, NodeJS.Timeout>,
  chessGame: ChessGameTimeoutType
) => {
  if (activeGames.has(chessGame.id)) {
    clearTimeout(activeGames.get(chessGame.id));
    activeGames.delete(chessGame.id);
  }
  const timeout = setTimeout(async () => {
    console.log("end chess game timeout server side");
    const Game = await EndChessGame(chessGame.id, "timeout", chessGame.winner);

    activeGames.delete(chessGame.id);
    console.log(
      "emit end chess game timeout server side",
      Game.white,
      Game.black
    );
    io.to([`user:${Game.white}`, `user:${Game.black}`]).emit("endChessGame");
  }, chessGame.timeLeftBeforeTimeout);

  activeGames.set(chessGame.id, timeout);
};
