import { type IMove } from "#front/utils/types";
import mongoose, { Schema } from "mongoose";

export const MoveSchema = new Schema<IMove>(
  {
    moveNumber: { type: Number, required: true },
    color: { type: String, required: true, enum: ["white", "black"] },
    piece: { type: String, required: true },
    fromSquare: { type: String, required: true },
    toSquare: { type: String, required: true },
    fen: { type: String, required: true },
    capturedPiece: { type: String, default: null },
    promotion: { type: String, default: null },
    check: { type: Boolean, default: false },
    checkmate: { type: Boolean, default: false },
    castle: {
      type: String,
      default: null,
      enum: ["kingside", "queenside", null],
    },
    timestamp: { type: Number, required: true },
  },
  { _id: false }
);

export const Move = mongoose.models?.Move || mongoose.model("Move", MoveSchema);
