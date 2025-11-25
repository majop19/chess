import { type UserEloType } from "#front/utils/EloMatchmaking";
import {
  type ChessGameTimerType,
  type IMove,
  type MoveDataGameEventType,
  type TimeControlType,
  type TimeIncrementType,
} from "#front/utils/types";
import mongoose, { ObjectId } from "mongoose";
import { Server, Socket } from "socket.io";

export interface ServerToClientEvents {
  newUserInWaitingRoom: (
    user: UserEloType,
    gameMode: "rapid" | "bullet" | "blitz"
  ) => void;
  getUsersInWaitingRoom: (
    users: UserEloType[],
    gameMode: "rapid" | "bullet" | "blitz"
  ) => void;
  deleteUserInWaitingRoom: (
    userId: mongoose.Types.ObjectId | ObjectId,
    gameMode: "rapid" | "bullet" | "blitz"
  ) => void;
  sendChessGameId: (gameId: ObjectId, callback?: (err: Error) => void) => void;
  researchOpponent: () => void;
  gameAbort: () => void;
  beginChessGame: () => void;
  sendChessGameMove: (
    fen: string,
    moveData: IMove,
    playerFinishTime: number,
    beginTimeOpponent: number,
    lastUpdateTime: Date
  ) => void;
  endChessGame: () => void;
  rematchProposition: () => void;
  opponentIsPlaying: () => void;
  opponentHasDeclinedRematch: () => void;
}

export interface ClientToServerEvents {
  connect: () => void;
  register: (data: { userId: mongoose.Types.ObjectId; elo: number }) => void;
  addUserInWaitingRoom: (timer: ChessGameTimerType) => void;
  removeUserInWaitingRoom: (timer: ChessGameTimerType) => void;
  createChessGame: (user: UserEloType, opponent: UserEloType) => void;
  beginChessGame: (gameId: ObjectId) => void;
  newChessMove: (
    gameId: ObjectId,
    moveData: MoveDataGameEventType,
    gameData: {
      fen: string;
      pgn: string;
    }
  ) => void;
  syncTimer: (time: number) => void;
  endChessGame: (
    gameId: ObjectId,
    result: "draw" | "timeout" | "resigned" | "checkmate" | "stalemate",
    winner: "black" | "white" | "draw"
  ) => void;
  rematchInvitation: (data: {
    white: {
      id: mongoose.Types.ObjectId;
      player: "user" | "opponent";
    };
    black: mongoose.Types.ObjectId;
    infoGame: {
      timeControl: TimeControlType;
      timeIncrement: TimeIncrementType;
    };
  }) => void;
  declineRematch: (opponentId: mongoose.Types.ObjectId) => void;
}

export interface InterServerEvents {
  noArg: () => void;
}

export interface SocketData {
  pathName: string;
  userId: mongoose.Types.ObjectId | ObjectId;
  elo: number;
}

export type SocketClientType = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

export type SocketServerType = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type ServerType = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
