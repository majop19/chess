import { IProblem } from "#front/utils/types";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios from "axios";
import { Chess } from "chess.js";
import { createContext, use, useRef, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { reload } from "vike/client/router";
import type { PageContextClient } from "vike/types";

type PuzzlesType = {
  puzzle: Chess | null;
  setPuzzle: (puzzle: Chess | null) => void;
  makeAMove: boolean;
  setMakeAMove: React.Dispatch<React.SetStateAction<boolean>>;
  lastsquareMoveRef: React.RefObject<{
    from: string;
    to: string;
    promotion: string;
  }>;
  soluceRef: React.RefObject<{
    soluce: string[];
    firstMoveNumber: number;
    orientation: "white" | "black";
    isProblemFinished: boolean;
    isHintUsed: boolean;
  }>;
  initProblem: (fen: string, moves: string) => void;
  gameStatus: boolean | null;
  setGameStatus: React.Dispatch<React.SetStateAction<boolean | null>>;
  isHint: boolean;
  setHint: React.Dispatch<React.SetStateAction<boolean>>;
  mutation: UseMutationResult<IProblem, Error, void, unknown>;
  elo: number | null;
  setElo: React.Dispatch<React.SetStateAction<number | null>>;
};

export const PuzzlesContext = createContext<PuzzlesType | null>(null);

export const usePuzzlesContext = () => {
  const context = use(PuzzlesContext);

  if (!context)
    throw new Error("PuzzlesContext must be used within PuzzlesProvider");

  return context;
};

export const PuzzlesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pageContext = usePageContext() as PageContextClient;
  const [puzzle, setPuzzle] = useState<Chess | null>(null);
  const lastsquareMoveRef = useRef({ from: "", to: "", promotion: "" });
  const [makeAMove, setMakeAMove] = useState(false);
  const soluceRef = useRef({
    soluce: [] as string[],
    firstMoveNumber: 0,
    orientation: "white" as "white" | "black",
    isProblemFinished: false,
    isHintUsed: false,
  });
  const [gameStatus, setGameStatus] = useState<boolean | null>(null);
  const [isHint, setHint] = useState(false);
  const [elo, setElo] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await axios
        .get(
          `/problems/${
            // @ts-expect-error test error
            pageContext.user?.chessProfile.elo.problem.rating ?? 400
          }`
        )
        .catch(() => {
          return null;
        });
      if (response == null) throw new Error("No puzzle found");
      return response.data as IProblem;
    },
  });
  function initProblem(fen: string, moves: string) {
    if (puzzle) return;
    console.log("initProblem", fen, moves);
    const chessGame = new Chess(fen);

    setPuzzle(chessGame);
    setGameStatus(null);
    console.log(
      "soluce ref data",
      moves.split(" "),
      chessGame.moveNumber(),
      chessGame.turn()
    );
    soluceRef.current = {
      soluce: moves.split(" "),
      firstMoveNumber: chessGame.moveNumber(),
      orientation: chessGame.turn() == "w" ? "black" : "white",
      isProblemFinished: false,
      isHintUsed: false,
    };
    setMakeAMove(true);
    setElo(null);
    console.log("reload", soluceRef.current);
    reload();
  }

  return (
    <PuzzlesContext.Provider
      value={{
        puzzle,
        setPuzzle,
        makeAMove,
        setMakeAMove,
        lastsquareMoveRef,
        soluceRef,
        initProblem,
        gameStatus,
        setGameStatus,
        isHint,
        setHint,
        mutation,
        elo,
        setElo,
      }}
    >
      {children}
    </PuzzlesContext.Provider>
  );
};
