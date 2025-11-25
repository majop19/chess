import mongoose, { ObjectId, Schema, Document } from "mongoose";

export type UserGuardPageContext = {
  id: ObjectId;
  email: string;
  image: string | null;
  name: string;
  isVerified: boolean;
  chessProfile: ChessProfileData;
};

export type TimeControlType = 1 | 3 | 5 | 10 | 15; // in minutes

export type TimeIncrementType = 0 | 1 | 3 | 10; // in seconds

export type ChessGameTimerType = {
  timeControl: TimeControlType;
  timeIncrement: TimeIncrementType;
};

export type CreateChessGameReturnType =
  | { id: ObjectId; timeLeftBeforeTimeout: number }
  | "oppenentInGame";

export type ChessGameTimeoutType = {
  id: ObjectId;
  timeLeftBeforeTimeout: number;
  winner: "white" | "black";
};

export type GameModeType = "rapid" | "blitz" | "bullet";

export type StartChessGameType = {
  whiteId: ObjectId;
  blackId: ObjectId;
  timeControl: number;
  timeIncrement: number;
};

export type UserGameProfileType = {
  id: mongoose.Types.ObjectId;
  name: string;
  image: string | null;
};

export type GameUseDataType = {
  whitePlayer: UserGameProfileType;
  blackPlayer: UserGameProfileType;
  game: GameData;
};

export type MoveDataGameEventType = {
  piece: string;
  fromSquare: string;
  toSquare: string;
  promotion?: string;
  fen: string;
  check: boolean;
  checkmate: boolean;
  castle: "kingside" | "queenside" | null;
  capturedPiece?: string;
  enPassant: boolean;
};

export type ResultChessGameType =
  | "checkmate"
  | "stalemate"
  | "draw"
  | "resigned"
  | "timeout";

export type PuzzleType = {
  FEN: string;
  Moves: string;
  Rating: number;
  RatingDeviation: number;
  Popularity: number;
  Themes: string[];
  startColor: "w" | "b";
  _id: string;
};

export type ColorType = "whiteTime" | "blackTime";

export type UserPageContextType = {
  id: Schema.Types.ObjectId;
  email: string;
  image: string | null;
  name: string;
  isVerified: boolean;
  chessProfile: ChessProfileLean;
};

export interface IMove {
  moveNumber: number;
  color: string;
  piece: string;
  fromSquare: string;
  toSquare: string;
  fen: string;
  capturedPiece?: string;
  promotion?: string;
  check: boolean;
  checkmate: boolean;
  castle?: string;
  timestamp: number; // timer of the player when he play the move (in milliseconds)
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image: string | null;
  isVerified: boolean;
  provider?: string;
  chessProfile: ChessProfileData & IChessProfile;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProblem extends Document {
  FEN: string;
  Moves: string;
  Rating: number;
  RatingDeviation: number;
  Popularity: number;
  Themes: string;
}

export interface GameData {
  whiteId: ObjectId & IUser;
  blackId: ObjectId & IUser;
  winner?: string;
  timeControl: 1 | 3 | 5 | 10 | 15; // in (minutes)
  timeIncrement: 0 | 1 | 3 | 10; // in (seconds)
  isRated: boolean;
  status:
    | "active"
    | "checkmate"
    | "stalemate"
    | "draw"
    | "resigned"
    | "timeout";
  turn: "white" | "black";
  pgn: string;
  boardState: string; // FEN notation
  castlingRights: string;
  takesMoveNumber: number; // number of moves since no one moves a pawn or captures a piece. 50 consecutive moves is Draw
  fullMoveNumber: number;
  lastUpdateTime: Date;
  whiteTime: number; // in (milliseconds)
  blackTime: number; // in (milliseconds)
  createdAt: Date;
  moves: IMove[];
}

export type GameDataLean = GameData &
  Document & {
    _id: ObjectId;
  };

export interface IGame extends GameData, Document {}

export interface IEloRatings {
  bullet: {
    rating: number;
    ratingDeviation: number;
  };
  blitz: {
    rating: number;
    ratingDeviation: number;
  };
  rapid: {
    rating: number;
    ratingDeviation: number;
  };
  problem: {
    rating: number;
    ratingDeviation: number;
  };
}

export interface ChessProfileData {
  games?: (ObjectId | IGame)[];
  elo: IEloRatings;
  createdAt: Date;
}

export type ChessProfileLean = ChessProfileData & {
  _id: ObjectId;
};

interface IChessProfile extends ChessProfileData, Document {}

export type { IChessProfile };
