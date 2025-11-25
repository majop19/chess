// @ts-nocheck
import { Problem } from "#back/models/problems.model";
import { User } from "#back/models/user.model";
import type { IProblem, IUser } from "#front/utils/types";
import express, { type Request, type Response } from "express";

const router = express.Router();

router.get("/:elo", async (req: Request, res: Response) => {
  const userElo = Number(req.params.elo);
  console.log(userElo);
  try {
    const problem: IProblem[] = await Problem.aggregate([
      {
        $match: {
          Rating: { $gte: userElo - 50, $lte: userElo + 50 },
        },
      },
      {
        $sample: {
          size: 1,
        },
      },
    ]);
    console.log("problem", problem);
    res.json(problem[0]);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post(
  "/:rating/:ratingDeviation",
  async (req: Request, res: Response) => {
    const rating = Number(req.params.rating);
    const ratingDeviation = Number(req.params.ratingDeviation);
    console.log("userElo", { rating, ratingDeviation });
    try {
      // @ts-expect-error user has id
      const user: IUser | null = await User.findById(req.user.id).populate(
        "chessProfile"
      );

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.chessProfile.elo.problem = { rating, ratingDeviation };
      await user.chessProfile.save();
      await user.save();
      res.json({ rating });
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);

export default router;
