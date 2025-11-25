import { Schema } from "mongoose";

export const EloRatingsSchema = new Schema(
  {
    bullet: {
      rating: { type: Number, default: 400 },
      ratingDeviation: { type: Number, default: 350 },
    },
    blitz: {
      rating: { type: Number, default: 1000 },
      ratingDeviation: { type: Number, default: 350 },
    },
    rapid: {
      rating: { type: Number, default: 1000 },
      ratingDeviation: { type: Number, default: 350 },
    },
    problem: {
      rating: { type: Number, default: 400 },
      ratingDeviation: { type: Number, default: 350 },
    },
  },
  { _id: false }
);
