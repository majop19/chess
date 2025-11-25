import { type IUser } from "#front/utils/types";
import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    image: { type: String, default: null },
    isVerified: {
      type: Boolean,
      default: false,
    },
    provider: { type: String, enum: ["Google"] },
    chessProfile: { type: Schema.Types.ObjectId, ref: "ChessProfile" },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

export const User = mongoose.models?.User || model<IUser>("User", userSchema);
