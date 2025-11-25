import { BoardOrientationContext } from "#front/hooks/use-context";
import { PropsWithChildren, useEffect, useState } from "react";

type OrientationType = "white" | "black";

type CapturedPieces = {
  white: string[];
  black: string[];
};

export type ChessGameContextType = {
  orientation: OrientationType;
  capturedPieces: CapturedPieces;
  changeOrientation: () => void;
  setCapturedPieces: (newCapturedPieces: CapturedPieces) => void;
};

export const BoardOrientationProvider = ({
  initialOrientation,
  children,
}: { initialOrientation: OrientationType } & PropsWithChildren) => {
  const [orientation, setOrientation] = useState<OrientationType>(
    () => initialOrientation
  );
  const [capturedPieces, setCapturedPieces] = useState({
    white: [] as string[],
    black: [] as string[],
  });

  useEffect(() => {
    setOrientation(initialOrientation);
  }, [initialOrientation]);

  const changeOrientation = () => {
    setOrientation((curr) => (curr == "white" ? "black" : "white"));
  };
  const value = {
    orientation,
    capturedPieces,
    changeOrientation,
    setCapturedPieces,
  };

  return (
    <BoardOrientationContext.Provider value={value}>
      {children}
    </BoardOrientationContext.Provider>
  );
};
