import { usePageContext } from "vike-react/usePageContext";
import { PuzzleBoard } from "./puzzleBoard";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#frontx/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { GameStatus } from "./gameStatus";
import {
  PuzzlesProvider,
  usePuzzlesContext,
} from "../../frontend/context/PuzzleContext";
import { Glicko2, Player } from "glicko2";
import { PuzzleType } from "#front/utils/types";
import axios from "axios";
import CountUp from "#frontx/components/CountUp";
import GradientText from "#frontx/components/GradientText";
import { cn } from "../../frontend/lib/utils";
import { SignalHigh } from "lucide-react";

export const Page = () => {
  const pageContext = usePageContext();

  // @ts-expect-error -- fix type
  const userElo = pageContext.user?.chessProfile.elo.problem;

  if (!userElo) return null;
  console.log("render page");
  return (
    <PuzzlesProvider>
      <div className="w-full h-full flex justify-center items-center gap-15">
        <div className="flex items-center">
          <PuzzleBoard />
        </div>
        <Card className="w-1/5 bg-card h-[800px]">
          <CardHeader className="flex justify-center gap-5 mt-3">
            <img
              src="https://www.chess.com/bundles/web/images/color-icons/puzzle-piece.svg"
              height={40}
            ></img>
            <CardTitle className="text-center font-bold text-5xl mt-2">
              Puzzle
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-end items-end w-full">
            <div className="flex font-bold text-2xl mb-auto w-full justify-between">
              <PuzzleTimer />
              <div className="flex">
                <SignalHigh size={30} />
                <p>{userElo?.rating}</p>
              </div>
            </div>
            <UserEloHandler
              userElo={{
                rating: userElo.rating,
                ratingDeviation: userElo.ratingDeviation,
              }}
            />
          </CardContent>
          <CardFooter className="bg-input h-1/7 mt-auto flex flex-col">
            <GameStatus />
          </CardFooter>
        </Card>
      </div>
    </PuzzlesProvider>
  );
};

const PuzzleTimer = () => {
  const [timer, setTimer] = useState(0); // in seconds

  useEffect(() => {
    const interval = setInterval(() => setTimer((curr) => curr + 1), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const hours = Math.floor(timer / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = timer % 60;

  return (
    <div
      className="flex items-baseline"
      style={{
        fontVariantNumeric: "tabular-nums",
        // @ts-expect-error custom class
        "--number-flow-char-height": "0.75em",
      }}
    >
      {hours != 0 ? <p>{hours}:</p> : null}
      <p>{minutes}:</p>
      <p>{seconds < 10 ? "0" + seconds : seconds}</p>
    </div>
  );
};

const UserEloHandler = ({
  userElo,
}: {
  userElo: {
    rating: number;
    ratingDeviation: number;
  };
}) => {
  const { gameStatus, soluceRef, elo, setElo } = usePuzzlesContext();
  const puzzle: PuzzleType = JSON.parse(
    window.localStorage.getItem("puzzle") || "{}"
  );

  const ranking = useMemo(() => {
    return new Glicko2({
      rating: 400,
      rd: 350,
    });
  }, []);

  const userRanking = ranking.makePlayer(
    userElo.rating,
    userElo.ratingDeviation
  );

  const problemRanking = ranking.makePlayer(
    puzzle.Rating,
    puzzle.RatingDeviation
  );

  console.log("render userelohandler", userElo);

  useEffect(() => {
    if (gameStatus != null && !soluceRef.current.isProblemFinished && !elo) {
      console.log("update elo");
      console.log("update elo entered", userElo.rating, elo);
      const matche: [Player, Player, number][] = [];
      const winOrLose = gameStatus === true ? 1 : 0;
      console.log("winOrLose", winOrLose);
      matche.push([userRanking, problemRanking, winOrLose]);

      ranking.updateRatings(matche);
      const newElo = Math.round(userRanking.getRating());
      const newRatingDeviation = Math.round(userRanking.getRd());
      setElo(newElo);
      console.log("set elo");
      axios.post(`/problems/${newElo}/${newRatingDeviation}`);
      soluceRef.current.isProblemFinished = true;
    }
  }, [
    gameStatus,
    puzzle.Rating,
    puzzle.RatingDeviation,
    userRanking,
    problemRanking,
    ranking,
    soluceRef,
    elo,
    setElo,
    userElo.rating,
  ]);

  console.log("elo", elo, gameStatus, soluceRef.current.isProblemFinished);
  if (gameStatus === null && !soluceRef.current.isProblemFinished) return null;
  return (
    <div className="w-full h-full flex justify-center items-center gap-3">
      {elo ? (
        <div className="flex">
          <GradientText
            className="font-black text-6xl"
            colors={[
              "hsl(var(--primary))",
              "hsl(var(--gradient-elo))",
              "hsl(var(--primary))",
              "hsl(var(--gradient-elo))",
              "hsl(var(--primary))",
            ]}
            animationSpeed={11}
          >
            <CountUp
              direction={elo - userElo.rating >= 0 ? "up" : "down"}
              to={elo - userElo.rating >= 0 ? elo : userElo.rating - 1}
              from={elo - userElo.rating >= 0 ? userElo.rating - 1 : elo}
              duration={0.5}
            />
          </GradientText>
          <p
            className={cn(
              "text-xl font-bold",
              elo - userElo.rating >= 0 ? "text-[#79d179]" : "text-[#ff6347]"
            )}
          >
            {elo - userElo.rating >= 0 ? "+" : ""}
            {elo - userElo.rating}
          </p>
        </div>
      ) : null}
    </div>
  );
};
