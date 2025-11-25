import { TimersContext } from "#front/hooks/use-context";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

type Increment = 0 | 1000 | 3000 | 10000;

type TimersState = {
  whiteTime: number; // in milliseconds
  blackTime: number;
  isRunning: { white: boolean; black: boolean };
  increment: Increment;
};

type TimersAction = {
  lastUpdateTimeRef: React.RefObject<{
    timeCurrentPlayer: number;
    lastUpdateTime: number;
    newGame: boolean;
  }>;
  switchPlayerTurn: (time: number) => void;
  putTimerSync: (player: "whiteTime" | "blackTime") => void;
  endGame: () => void;
  newGame: () => void;
};
function formatTime(ms: number) {
  // Calculer les minutes, secondes et dixièmes de seconde
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((totalSeconds * 10) % 10);

  return { minutes: minutes, seconds: seconds, tenths: tenths };
}
export type TimersContextType = { timersState: TimersState } & TimersAction;

export const TimersProvider = ({
  timer,
  lastUpdateTime,
  children,
}: {
  timer: {
    whiteTime: number;
    blackTime: number;
    timeIncrement: 0 | 1 | 3 | 10;
    timeCurrentPlayer: number;
    isRunning: {
      white: boolean;
      black: boolean;
    };
  };
  lastUpdateTime: Date;
  children: ReactNode;
}) => {
  const [timersState, setTimersState] = useState({
    whiteTime: timer.whiteTime >= 0 ? timer.whiteTime : 0,
    blackTime: timer.blackTime >= 0 ? timer.blackTime : 0,
    isRunning: timer.isRunning,
    increment: (timer.timeIncrement * 1000) as Increment,
  });
  const lastUpdateTimeRef = useRef({
    timeCurrentPlayer: timer.timeCurrentPlayer,
    lastUpdateTime: new Date(lastUpdateTime).getTime(),
    newGame: false,
  });

  console.log(
    "timer render",
    formatTime(
      lastUpdateTimeRef.current.timeCurrentPlayer -
        (Date.now() - lastUpdateTimeRef.current.lastUpdateTime)
    ),
    timersState,
    lastUpdateTimeRef.current.timeCurrentPlayer,
    lastUpdateTimeRef.current.lastUpdateTime
  );
  const switchPlayerTurn = useCallback(
    (time: number) => {
      const playerTurn = timersState.isRunning.white ? false : true;
      const player = timersState.isRunning.white ? "whiteTime" : "blackTime";
      setTimersState((curr) => ({
        ...curr,
        isRunning: { white: playerTurn, black: !playerTurn },
        [player]: time,
      }));
      console.log("switch player turn", playerTurn);
    },
    [timersState.isRunning.white]
  );
  const putTimerSync = (player: "whiteTime" | "blackTime") => {
    const timerSynchro =
      lastUpdateTimeRef.current.timeCurrentPlayer -
      (Date.now() - lastUpdateTimeRef.current.lastUpdateTime);
    console.log(
      "sync timer",
      formatTime(
        lastUpdateTimeRef.current.timeCurrentPlayer -
          (Date.now() - lastUpdateTimeRef.current.lastUpdateTime)
      ),
      timersState,
      lastUpdateTimeRef.current.timeCurrentPlayer,
      lastUpdateTimeRef.current.lastUpdateTime
    );
    setTimersState((curr) => ({
      ...curr,
      [player]: timerSynchro,
    }));
  };

  const endGame = () => {
    const player = timersState.isRunning.white ? "whiteTime" : "blackTime";
    setTimersState((curr) => ({
      ...curr,
      [player]: 0,
      isRunning: { white: false, black: false },
    }));
  };

  const newGame = useCallback(() => {
    setTimersState(() => ({
      whiteTime: timer.whiteTime >= 0 ? timer.whiteTime : 0,
      blackTime: timer.blackTime >= 0 ? timer.blackTime : 0,
      isRunning: { white: timer.isRunning.white, black: timer.isRunning.black },
      increment: (timer.timeIncrement * 1000) as Increment,
    }));
    lastUpdateTimeRef.current = {
      timeCurrentPlayer: timer.whiteTime >= 0 ? timer.whiteTime : 0,
      lastUpdateTime: new Date(lastUpdateTime).getTime(),
      newGame: false,
    };
  }, [
    timer.whiteTime,
    timer.blackTime,
    timer.timeIncrement,
    lastUpdateTime,
    timer.isRunning,
  ]);

  useEffect(() => {
    if (lastUpdateTimeRef.current.newGame) {
      newGame();
    }
  }, [newGame]);

  const value = {
    timersState,
    lastUpdateTimeRef,
    switchPlayerTurn,
    putTimerSync,
    endGame,
    newGame,
  };

  return (
    <TimersContext.Provider value={value}>{children}</TimersContext.Provider>
  );
};
