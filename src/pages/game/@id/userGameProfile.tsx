import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "#frontx/components/ui/avatar";
import { useTimersContext } from "#front/hooks/use-context";
import { IMove, UserGameProfileType } from "#front/utils/types";
import { AlarmClock } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useData } from "vike-react/useData";
import { GameData } from "./+data";
import { SocketClientType } from "#back/socket.io/socket.types";
import { render } from "vike/abort";
import { ObjectId } from "mongoose";
import { useChessGameContext } from "#frontx/context/ChessGameContext";
import { cn } from "../../../frontend/lib/utils";

function renderPiece(piece: string) {
  const pieces = {
    p: "♙",
    n: "♞",
    b: "♝",
    r: "♜",
    q: "♛",
    k: "♚",
  };
  return pieces[piece as keyof typeof pieces] || "";
}

export const UserGameProfile = ({
  user,
  children,
  player,
}: {
  user: UserGameProfileType;
  children: ReactNode;
  player: "whiteTime" | "blackTime";
}) => {
  const { chessGame } = useChessGameContext();

  // Count captured pieces
  const fen = chessGame.fen();
  const pieces = {
    p: 8,
    n: 2,
    b: 2,
    r: 2,
    q: 1,
    k: 1, // black pieces
    P: 8,
    N: 2,
    B: 2,
    R: 2,
    Q: 1,
    K: 1, // white pieces
  };

  for (const char of fen.split(" ")[0]) {
    if (pieces[char as keyof typeof pieces] !== undefined) {
      pieces[char as keyof typeof pieces]--;
    }
  }
  const capturedArrays = { w: [] as string[], b: [] as string[] };

  for (const [piece, count] of Object.entries(pieces)) {
    const colorOfPieceInMap = piece === piece.toLowerCase() ? "b" : "w";
    const pieceType = piece.toLowerCase();

    // If count > 0 that means these pieces are missing from the board => captured.
    for (let i = 0; i < count; i++) {
      capturedArrays[colorOfPieceInMap].push(pieceType);
    }
  }
  const grouped = (arr: string[]) =>
    arr.reduce<Record<string, number>>((acc, p) => {
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});

  const capturedCounts = grouped(
    capturedArrays[player === "whiteTime" ? "b" : "w"]
  );

  const renderCapturedGroup = (counts: Record<string, number>) => {
    return Object.entries(counts).map(([pieceType, count]) => {
      return (
        <div key={pieceType} className="flex items-center mr-3">
          <div
            className="flex items-center"
            style={{ height: 28, lineHeight: "28px" }}
            aria-hidden
          >
            {Array.from({ length: count }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "text-2xl select-none inline-block ml-[-13px]",
                  `z-[${100 - i}]`
                )}
              >
                {renderPiece(pieceType)}
              </span>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex gap-3 w-[800px] items-center h-[80px]">
      <Avatar className="size-11 rounded-md">
        <AvatarImage src={user.image ?? undefined} />
        <AvatarFallback className="bg-secondary text-2xl font-semibold rounded-md capitalize">
          {user.name[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <p className="font-medium text-xl">{user.name}</p>
        <div className="text-foreground flex items-center ml-2">
          {renderCapturedGroup(capturedCounts)}
        </div>
      </div>
      {children}
    </div>
  );
};

export const GameTimer = ({
  player,
  socket,
}: {
  player: "whiteTime" | "blackTime";
  socket: SocketClientType;
}) => {
  const { game } = useData<GameData>();
  const {
    timersState,
    lastUpdateTimeRef,
    switchPlayerTurn,
    putTimerSync,
    endGame,
  } = useTimersContext();

  const isRunning =
    timersState.isRunning[player == "whiteTime" ? "white" : "black"];
  const playerTime = game[player];

  function formatTime(ms: number) {
    // Calculer les minutes, secondes et dixièmes de seconde
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const tenths = Math.floor((totalSeconds * 10) % 10);

    return { minutes: minutes, seconds: seconds, tenths: tenths };
  }

  const time = formatTime(timersState[player]);

  useEffect(() => {
    const intervalTime = timersState[player] > 20000 ? 1000 : 100;

    const interval = setInterval(() => {
      if (isRunning) {
        putTimerSync(player);
        if (timersState[player] <= 100) {
          endGame();
        }
      }
    }, intervalTime);

    async function NewMove(
      _: string,
      __: IMove,
      playerFinishTime: number,
      beginTimeTurn: number,
      lastUpdateTime: Date
    ) {
      console.log("new move event");
      if (!isRunning) return;
      lastUpdateTimeRef.current.timeCurrentPlayer = beginTimeTurn;
      lastUpdateTimeRef.current.lastUpdateTime = new Date(
        lastUpdateTime
      ).getTime();
      console.log("switch player", lastUpdateTimeRef.current);
      switchPlayerTurn(playerFinishTime);
    }
    async function sendChessGameId(gameId: ObjectId) {
      console.log("navigate to game id");
      await render(`/game/${gameId}`);
      lastUpdateTimeRef.current.newGame = true;

      console.log("after render", game._id);
    }
    socket.on("sendChessGameMove", NewMove);
    socket.on("sendChessGameId", sendChessGameId);
    return () => {
      socket.off("sendChessGameMove", NewMove);
      socket.off("sendChessGameId", sendChessGameId);
      clearInterval(interval);
    };
  }, [
    time,
    timersState,
    putTimerSync,
    endGame,
    isRunning,
    player,
    playerTime,
    socket,
    game,
    game._id,
    game.status,
    game.blackTime,
    game.lastUpdateTime,
    game.turn,
    game.whiteTime,
    switchPlayerTurn,
    lastUpdateTimeRef,
  ]);

  return (
    <div className="w-45 h-12 bg-board-black flex items-center text-4xl font-semibold text-foreground pr-2 justify-end relative ml-auto">
      {timersState.isRunning[player == "whiteTime" ? "white" : "black"] ? (
        <AlarmClock size={45} className="absolute left-0 p-2" />
      ) : null}
      <Coutdown {...time} />
    </div>
  );
};

const Coutdown = ({
  minutes,
  seconds,
  tenths,
}: {
  minutes: number;
  seconds: number;
  tenths: number;
}) => {
  return (
    <div
      className="flex items-baseline"
      style={{
        fontVariantNumeric: "tabular-nums",
        // @ts-expect-error custom class
        "--number-flow-char-height": "0.75em",
      }}
    >
      <p>{minutes}:</p>
      <p>{seconds < 10 ? "0" + seconds : seconds}</p>
      {minutes == 0 && seconds < 20 ? <p>.{tenths}</p> : null}
    </div>
  );
};
