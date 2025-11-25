import { Chess } from "chess.js";
import { createContext, use, useEffect, useState } from "react";

type ChessGameType = {
  chessGame: Chess;
  setChessGame: (chessGame: Chess) => void;
};
export const ChessGameContext = createContext<ChessGameType | null>(null);

export const useChessGameContext = () => {
  const context = use(ChessGameContext);

  if (!context)
    throw new Error("ChessGameContext must be used within ChessGameProvider");

  return context;
};

export const ChessGameProvider = ({
  children,
  initialBoardState,
}: {
  children: React.ReactNode;
  initialBoardState: string;
}) => {
  const [chessGame, setChessGame] = useState<Chess>(
    new Chess(initialBoardState)
  );

  useEffect(() => {
    setChessGame(new Chess(initialBoardState));
  }, [initialBoardState]);

  return (
    <ChessGameContext.Provider value={{ chessGame, setChessGame }}>
      {children}
    </ChessGameContext.Provider>
  );
};
