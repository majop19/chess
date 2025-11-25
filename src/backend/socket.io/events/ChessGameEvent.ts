import {
  createChessGame,
  EndChessGame,
  UpdateChessGame,
} from "#back/routes/game/game.function";
import mongoose, { ObjectId } from "mongoose";
import {
  type ServerType,
  type SocketServerType,
} from "#back/socket.io/socket.types";
import { type ChessGameTimerType } from "#front/utils/types";
import { gameTimeout } from "#back/socket.io/events/gameTimeout.function";

export const ChessGameEventHandler = (
  io: ServerType,
  socket: SocketServerType,
  rematchInvitation: mongoose.Types.ObjectId[],
  activeGames: Map<ObjectId, NodeJS.Timeout>
) => {
  socket.on("createChessGame", async (user, opponent) => {
    console.log("begin create", user, opponent);
    const waitingRoom = Array.from(socket.rooms)
      .find((room) => room.includes("WaitingRoom:"))
      ?.replace("WaitingRoom:", "")
      .split("/");
    console.log(waitingRoom);
    if (waitingRoom) {
      const chessGame = await createChessGame(user.id, opponent.id, {
        timeControl: Number(waitingRoom[0]),
        timeIncrement: Number(waitingRoom[1]),
      } as ChessGameTimerType);

      if (chessGame == "oppenentInGame") {
        io.to(`user:${user.id}`).emit("researchOpponent");
        return;
      } else {
        console.log(`user:${opponent.id}`, socket.rooms);
        io.to([`user:${user.id}`, `user:${opponent.id}`])
          .timeout(2000)
          .emit("sendChessGameId", chessGame.id, async (err) => {
            if (err) {
              //   console.log("erreur", err);
              //  await Game.findByIdAndDelete(chessGame);
              //  io.to([`user:${socket.handshake.auth?.userId || socket.data.userId}`, `user:${opponent.id}`]).emit(
              //    "researchOpponent"
              //  );
            }
          });
        io.in([`user:${user.id}`, `user:${opponent.id}`]).socketsLeave(
          `WaitingRoom:${Number(waitingRoom[0])}/${Number(waitingRoom[1])}`
        );
        gameTimeout(io, activeGames, { ...chessGame, winner: "black" });
      }
    }
  });
  socket.on("newChessMove", async (gameId, moveData, gameData) => {
    const game = await UpdateChessGame(gameId, moveData, gameData);

    if (activeGames.has(gameId)) {
      clearTimeout(activeGames.get(gameId));
      activeGames.delete(gameId);
    }
    gameTimeout(io, activeGames, {
      id: gameId,
      timeLeftBeforeTimeout: game.beginTimeTurn,
      winner: game.turn === "white" ? "black" : "white",
    });

    io.to([`user:${game.white}`, `user:${game.black}`]).emit(
      "sendChessGameMove",
      game.fen,
      game.move,
      game.endTimeOpponent,
      game.beginTimeTurn,
      game.lastUpdateTime
    );
  });

  socket.on("rematchInvitation", async ({ white, black, infoGame }) => {
    const userId = white.player == "user" ? white.id : black;
    const opponentId = white.player == "opponent" ? white.id : black;
    const opponentRematch = rematchInvitation.indexOf(opponentId);
    console.log(
      "rematch",
      rematchInvitation,
      userId,
      opponentId,
      opponentRematch
    );
    if (opponentRematch == -1) {
      rematchInvitation.push(userId);
      console.log(rematchInvitation);
      io.to([`user:${opponentId}`]).emit("rematchProposition");
    } else {
      rematchInvitation.splice(opponentRematch);

      const chessGame = await createChessGame(
        userId,
        opponentId,
        {
          timeControl: infoGame.timeControl,
          timeIncrement: infoGame.timeIncrement,
        },
        {
          whiteId: white.id,
          blackId: black,
        }
      );
      if (chessGame == "oppenentInGame") return;
      console.log("userid", userId, opponentId);
      io.to([`user:${userId}`, `user:${opponentId}`]).emit(
        "sendChessGameId",
        chessGame.id
      );
      gameTimeout(io, activeGames, { ...chessGame, winner: "black" });
      console.log("rematch array", rematchInvitation);
    }
  });

  socket.on("declineRematch", (opponentId) => {
    const userId = socket.handshake.auth?.userId || socket.data.userId;
    const opponentRematch = rematchInvitation.indexOf(opponentId);
    if (opponentRematch != -1) {
      rematchInvitation.splice(opponentRematch, 1);
    } else {
      console.log("no rematch to decline");
      throw new Error("No rematch invitation to decline");
    }
    io.to([`user:${userId}`]).emit("opponentHasDeclinedRematch");
  });

  socket.on("endChessGame", async (gameId, result, winner) => {
    const game = await EndChessGame(gameId, result, winner);

    if (activeGames.has(gameId)) {
      clearTimeout(activeGames.get(gameId));
      activeGames.delete(gameId);
    }
    io.to([`user:${game.white}`, `user:${game.black}`]).emit("endChessGame");
  });
};
