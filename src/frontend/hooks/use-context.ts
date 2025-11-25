import { ChessGameContextType } from "#frontx/context/board-orientation";
import { TimersContextType } from "#frontx/context/timers";
import { createContext, use } from "react";

export const BoardOrientationContext =
  createContext<ChessGameContextType | null>(null);

export const TimersContext = createContext<TimersContextType | null>(null);

export const useTimersContext = () => {
  const context = use(TimersContext);

  if (!context)
    throw new Error("TimersContext must be used within TimersProvider");

  return context;
};

export const useBoardOrientationProvider = () => {
  const context = use(BoardOrientationContext);

  if (!context) {
    throw new Error("ChessGameContext must be used within ChessGameProvider");
  }

  return context;
};
