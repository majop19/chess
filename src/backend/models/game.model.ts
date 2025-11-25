// @ts-nocheck
import mongoose, { Schema, model } from "mongoose";
import { MoveSchema } from "#back/models/move.model";
import { type IGame } from "#front/utils/types";

export const GameSchema = new Schema<IGame>(
  {
    whiteId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blackId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    winner: { type: String, enum: ["white", "black", "draw", null] },
    timeControl: { type: Number, required: true, enum: [1, 3, 5, 10, 15] },
    timeIncrement: { type: Number, required: true, enum: [0, 1, 3, 10] },
    isRated: { type: Boolean, default: false },
    status: {
      type: String,
      default: "active",
      enum: ["active", "checkmate", "stalemate", "draw", "resigned", "timeout"],
    },
    turn: { type: String, default: "white", enum: ["white", "black"] },
    pgn: { type: String, default: "" },
    boardState: {
      type: String,
      default: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    },
    castlingRights: { type: String, default: "KQkq" },
    takesMoveNumber: { type: Number, default: 0 },
    fullMoveNumber: Number,
    lastUpdateTime: Date,
    whiteTime: { type: Number, required: true },
    blackTime: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    moves: {
      type: [MoveSchema],
      default: () => [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

GameSchema.index({ whiteId: 1 });
GameSchema.index({ blackId: 1 });
GameSchema.index({ status: 1 });

export const Game = mongoose.models?.Game || model<IGame>("Game", GameSchema);
