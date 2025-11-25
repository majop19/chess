import { Button } from "#frontx/components/ui/button";
import { ChevronRight } from "lucide-react";
import { usePuzzlesContext } from "../../frontend/context/PuzzleContext";
import { Chess } from "chess.js";
import { PuzzleType } from "#front/utils/types";

export const GameStatus = () => {
  const {
    setPuzzle,
    lastsquareMoveRef,
    initProblem,
    soluceRef,
    gameStatus,
    setGameStatus,
    setMakeAMove,
    setHint,
    mutation,
  } = usePuzzlesContext();

  const RestartPuzzles = () => {
    const puzzle: PuzzleType = JSON.parse(
      window.localStorage.getItem("puzzle") || "{}"
    );
    console.log("puzzle", puzzle);
    setPuzzle(new Chess(puzzle.FEN));
    lastsquareMoveRef.current = { from: "", to: "", promotion: "" };
    setGameStatus(null);
  };

  const NewPuzzles = () => {
    if (mutation.isSuccess) {
      const chessGame = new Chess(mutation.data.FEN);
      window.localStorage.setItem(
        "puzzle",
        JSON.stringify({ ...mutation.data, startColor: chessGame.turn() })
      );
      const puzzle: PuzzleType = JSON.parse(
        window.localStorage.getItem("puzzle") || "{}"
      );
      setPuzzle(new Chess(puzzle.FEN));
      lastsquareMoveRef.current = { from: "", to: "", promotion: "" };
    }
    const puzzle: PuzzleType = JSON.parse(
      window.localStorage.getItem("puzzle") || ""
    );
    lastsquareMoveRef.current = { from: "", to: "", promotion: "" };
    setPuzzle(null);

    initProblem(puzzle.FEN, puzzle.Moves);
    mutation.reset();
  };

  const ShowSolution = async () => {
    const puzzle = JSON.parse(window.localStorage.getItem("puzzle") || "{}");
    setPuzzle(new Chess(puzzle.FEN));
    lastsquareMoveRef.current = { from: "", to: "", promotion: "" };
    soluceRef.current.isProblemFinished = false;
    const soluce = soluceRef.current.soluce;
    for (let i = 0; i < soluce.length + 1; i++) {
      console.log("timeout", i);

      await new Promise((resolve) =>
        setTimeout(() => {
          setMakeAMove(true);
          resolve(true);
        }, 1500)
      );
    }
    soluceRef.current.isProblemFinished = true;
  };

  if (gameStatus == null)
    return (
      <Button
        className="w-full font-bold text-2xl h-12 mt-5"
        onClick={() => {
          setHint(true);
          soluceRef.current.isHintUsed = true;
        }}
        variant="outline"
        disabled={soluceRef.current.isHintUsed}
      >
        <svg
          viewBox="0 0 32 32"
          height="35"
          width="35"
          aria-hidden="true"
          data-glyph="device-bulb-glow"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary-foreground hover:text-accent"
          fill="currentColor"
        >
          <path
            className="text-primary hover:text-primary-foreground"
            xmlns="http://www.w3.org/2000/svg"
            d="M12.333 22.233V24h7.334v-1.767c0-2.2 3.066-3.766 3.066-7.666C22.733 10.767 19.8 8 16 8s-6.733 2.767-6.733 6.567c0 3.9 3.066 5.466 3.066 7.666M7.567 12.7c.3-.767-.1-1.633-.9-1.9-.767-.3-1.634.1-1.9.9-.3.767.1 1.633.9 1.9.766.3 1.633-.1 1.9-.9m2.866-4.6c.7-.5.867-1.433.367-2.1-.467-.7-1.4-.833-2.067-.367-.7.467-.866 1.4-.366 2.1.466.667 1.4.834 2.066.367M16 6.333c.833 0 1.5-.666 1.5-1.5 0-.833-.667-1.5-1.5-1.5s-1.5.667-1.5 1.5c0 .834.667 1.5 1.5 1.5m8.4 6.367c.3.8 1.133 1.2 1.933.9a1.536 1.536 0 0 0 .9-1.933 1.55 1.55 0 0 0-1.933-.9c-.8.3-1.2 1.166-.9 1.933m-2.867-4.6c.7.467 1.6.3 2.1-.367.467-.7.3-1.633-.366-2.1-.7-.466-1.634-.3-2.1.367-.467.7-.3 1.6.366 2.1M18.8 26h-5.533c.333 1.5 1.7 2.1 2.766 2.1s2.434-.6 2.767-2.1"
          ></path>
        </svg>
        Hint
      </Button>
    );

  if (gameStatus == false)
    return (
      <div className="w-full flex justify-evenly mt-3 gap-3">
        <Button
          className="w-2/7 bg-green-500"
          variant="ghost"
          onClick={RestartPuzzles}
        >
          <svg
            viewBox="0 0 32 32"
            height="28.75"
            width="28.75"
            aria-hidden="true"
            data-glyph="arrow-spin-undo"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="cursor-pointer"
          >
            <path
              className="text-white cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              d="M16 26.467c6.067 0 10.5-4.867 10.5-10.467 0-5.933-4.8-10.5-10.5-10.5-2.7 0-5.367 1.033-7.433 3.067L7.1 10.033l2.133 2.134L10.7 10.7A7.5 7.5 0 0 1 16 8.5c4.133 0 7.5 3.367 7.5 7.5s-3.367 7.5-7.5 7.5c-2.533 0-4.5-1.167-6-2.967-.633-.866-1.2-.966-2.1-.333-.867.667-.967 1.2-.333 2.1C9.6 24.867 12.4 26.467 16 26.467M4.533 16.133l6.3-.833c.9-.133 1.034-.6.4-1.233L5.3 8.133c-.633-.633-1.1-.5-1.233.434l-.834 6.266c-.133 1.1.2 1.434 1.3 1.3"
            ></path>
          </svg>
        </Button>
        <Button className="w-2/7" variant="secondary" onClick={ShowSolution}>
          <svg
            viewBox="0 0 32 32"
            height="28.75"
            width="28.75"
            aria-hidden="true"
            data-glyph="tool-magnifier-check"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path
              xmlns="http://www.w3.org/2000/svg"
              d="M15 22c-3.952 0-7-3.048-7-7s3.048-7 7-7 7 3.048 7 7-3.048 7-7 7m0 2c5.048 0 9-3.952 9-9s-3.952-9-9-9-9 3.952-9 9 3.952 9 9 9m10 2.9a1.92 1.92 0 0 0 1.9-1.9c0-.533-.2-1.067-1.133-1.867l-4.1-3.6-2.134 2.134 3.667 4.166c.733.867 1.267 1.067 1.8 1.067m-10.4-8.4 5-5.033c.533-.534.533-.934 0-1.467-.533-.567-.933-.567-1.5 0l-4.233 4.233-1.834-1.8c-.533-.533-.933-.533-1.466 0-.567.567-.567.934 0 1.5l2.566 2.567c.534.533.934.533 1.467 0"
            ></path>
          </svg>
        </Button>
        <Button
          className="w-2/7"
          variant="secondary"
          onClick={NewPuzzles}
          disabled={mutation.isPending}
        >
          <ChevronRight size={36} />
        </Button>
      </div>
    );

  return (
    <div className="w-full flex justify-evenly mt-3">
      <Button className="w-1/3" variant="secondary" onClick={RestartPuzzles}>
        <svg
          viewBox="0 0 32 32"
          height="28.75"
          width="28.75"
          aria-hidden="true"
          data-glyph="arrow-spin-undo"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            xmlns="http://www.w3.org/2000/svg"
            d="M16 26.467c6.067 0 10.5-4.867 10.5-10.467 0-5.933-4.8-10.5-10.5-10.5-2.7 0-5.367 1.033-7.433 3.067L7.1 10.033l2.133 2.134L10.7 10.7A7.5 7.5 0 0 1 16 8.5c4.133 0 7.5 3.367 7.5 7.5s-3.367 7.5-7.5 7.5c-2.533 0-4.5-1.167-6-2.967-.633-.866-1.2-.966-2.1-.333-.867.667-.967 1.2-.333 2.1C9.6 24.867 12.4 26.467 16 26.467M4.533 16.133l6.3-.833c.9-.133 1.034-.6.4-1.233L5.3 8.133c-.633-.633-1.1-.5-1.233.434l-.834 6.266c-.133 1.1.2 1.434 1.3 1.3"
          ></path>
        </svg>
      </Button>
      <Button
        className="w-1/2 bg-green-500"
        onClick={NewPuzzles}
        disabled={mutation.isPending}
      >
        <ChevronRight size={44} />
      </Button>
    </div>
  );
};
