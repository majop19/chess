import { useEffect, useRef, useState } from "react";
import { GameData } from "./+data";
import { useData } from "vike-react/useData";
import { SocketClientType } from "#back/socket.io/socket.types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "#frontx/components/ui/card";
import { ScrollArea } from "#frontx/components/ui/scroll-area";
import { cn } from "#front/lib/utils";
import { Button } from "#frontx/components/ui/button";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useChessGameContext } from "#frontx/context/ChessGameContext";
import { Chess } from "chess.js";
import { usePageContext } from "vike-react/usePageContext";

import { calculateChessGameElo } from "#front/utils/calculateChessGameElo";
import { reload } from "vike/client/router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#frontx/components/ui/popover";
import { useUserWaitingRoom } from "#front/hooks/use-userWaitingRoom";
import { IMove, UserGuardPageContext } from "#front/utils/types";

export const GameLayout = ({ socket }: { socket: SocketClientType }) => {
  const { game, white, black } = useData<GameData>();
  const [moves, setMoves] = useState<IMove[]>(game.moves);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { chessGame, setChessGame } = useChessGameContext();

  const handleChessPositionChange = (
    position: "start" | "end" | "backward" | "forward"
  ) => {
    const currentPosition = moves.findIndex(
      (value) => value.fen === chessGame.fen()
    );
    switch (position) {
      case "start":
        setChessGame(new Chess());
        break;
      case "end":
        setChessGame(new Chess(moves[moves.length - 1].fen));
        break;
      case "backward":
        if (currentPosition === 0) return;
        setChessGame(new Chess(moves[currentPosition - 1].fen));
        break;
      case "forward":
        if (currentPosition === moves.length - 1) return;
        setChessGame(new Chess(moves[currentPosition + 1].fen));
        break;
    }
  };

  function renderPiece(piece: string) {
    const pieces = {
      p: "♟",
      n: "♞",
      b: "♝",
      r: "♜",
      q: "♛",
      k: "♚",
    };
    return pieces[piece as keyof typeof pieces] || "";
  }

  const formatMove = (move: IMove) => {
    const piece = move.piece === "p" ? "" : renderPiece(move.piece);
    const capture = move.capturedPiece ? "x" : "";
    const check = move.checkmate ? "#" : move.check ? "+" : "";
    const promotion = move.promotion ? `=${move.promotion.toUpperCase()}` : "";
    return `${piece}${capture}${move.toSquare}${promotion}${check}`;
  };

  // Regrouper les moves par numéro
  const movePairs: { number: number; white?: IMove; black?: IMove }[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: moves[i].moveNumber,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  useEffect(() => {
    setMoves(game.moves);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    function onSendChessGameMove(_: string, moveData: IMove) {
      setMoves((prevMoves) => [...prevMoves, moveData]);
    }

    async function endChessGame() {
      console.log("end game received");
      await reload();
      const audio = new Audio(`/sound/game-over.mp3`);
      audio.click();
      audio.play();
    }

    socket.on("sendChessGameMove", onSendChessGameMove);

    socket.on("endChessGame", endChessGame);
    return () => {
      socket.off("sendChessGameMove", onSendChessGameMove);
      socket.off("endChessGame", endChessGame);
    };
  }, [socket, game.moves, white.elo.rating, black.elo.rating]);

  return (
    <div className="w-full h-full">
      <Card className="h-[800px]">
        <CardContent className="h-full p-0">
          <CardHeader></CardHeader>
          <ScrollArea
            className={cn(
              "h-[480px] w-full border-y-4 py-3 border-foreground text-foreground m-auto",
              game.status != "active" ? "h-[310px]" : "h-[480px]"
            )}
            ref={scrollRef}
          >
            <div className="h-1/2 w-full">
              {movePairs.map(({ number, white, black }, index) => (
                <div
                  key={number}
                  className={cn(
                    "flex font-bold text-xl w-full",
                    number % 2 === 0 ? "bg-secondary" : ""
                  )}
                >
                  <span className="ml-4 w-6 text-center">{number}.</span>
                  <span
                    className={cn(
                      "w-15 text-center mr-10 ml-8",
                      index == movePairs.length - 1 &&
                        black == null &&
                        "bg-foreground text-primary-foreground"
                    )}
                  >
                    {white ? formatMove(white) : ""}
                  </span>
                  <span
                    className={cn(
                      "w-15 text-center mr-auto",
                      index == movePairs.length - 1 &&
                        black != null &&
                        "bg-foreground text-primary-foreground"
                    )}
                  >
                    {black ? formatMove(black) : ""}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="w-full flex flex-col justify-evenly mt-2 border-b-2 border-foreground h-1/4 items-center">
            <GameisFinishedButton
              socket={socket}
              ButtonStyle="w-[45%] mx-1 mb-4 h-12"
              ContainerStyle="flex w-full gap-2 justify-center"
            />
            <div className="flex justify-evenly w-full">
              <Button
                className="w-1/5 h-12"
                onClick={() => handleChessPositionChange("start")}
              >
                <ChevronFirst size={36} />
              </Button>
              <Button
                className="w-1/5 h-12"
                onClick={() => handleChessPositionChange("backward")}
              >
                <ChevronLeft size={36} />
              </Button>
              <Button
                className="w-1/5 h-12"
                onClick={() => handleChessPositionChange("forward")}
              >
                <ChevronRight size={36} />
              </Button>
              <Button
                className="w-1/5 h-12"
                onClick={() => handleChessPositionChange("end")}
              >
                <ChevronLast size={36} />
              </Button>
            </div>
          </div>
          <CardFooter>
            <ChessGameEloLayout socket={socket} />
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
};

const ChessGameEloLayout = ({ socket }: { socket: SocketClientType }) => {
  const { game, white, black } = useData<GameData>();
  const pageContext = usePageContext();
  const gameEloBeforeGameEnd = useRef({
    white: {
      rating: 0,
      ratingDeviation: 0,
    },
    black: {
      rating: 0,
      ratingDeviation: 0,
    },
  });

  useEffect(() => {
    if (
      game.status == "active" &&
      gameEloBeforeGameEnd.current.white.rating == 0
    ) {
      gameEloBeforeGameEnd.current.white = white.elo;
      gameEloBeforeGameEnd.current.black = black.elo;
    }

    function sendChessGameId() {
      gameEloBeforeGameEnd.current.white = { rating: 0, ratingDeviation: 0 };
      gameEloBeforeGameEnd.current.black = { rating: 0, ratingDeviation: 0 };
    }

    socket.on("sendChessGameId", sendChessGameId);
    return () => {
      socket.off("sendChessGameId", sendChessGameId);
    };
  }, [socket, black.elo, game.status, white.elo]);

  // @ts-expect-error -- fix type
  const colorPlayer = pageContext.user?.id === game.whiteId ? "white" : "black";
  const colorOpponent = colorPlayer === "white" ? "black" : "white";

  const predictResult = calculateChessGameElo(
    gameEloBeforeGameEnd.current.white,
    gameEloBeforeGameEnd.current.black
  );

  const userNewRating =
    game.timeControl == 10
      ? "rapid"
      : game.timeControl == 5
      ? "blitz"
      : "bullet";

  return (
    <div className="flex gap-5 flex-col justify-end pt-1">
      {gameEloBeforeGameEnd.current.white.rating == 0 ? null : (
        <div>
          <p className="font-extrabold text-xl">NEW GAME</p>
          <p className="font-extrabold pt-1 text-md">
            {white.name}{" "}
            <span className="font-medium">
              ({gameEloBeforeGameEnd.current.white.rating})
            </span>{" "}
            <span className="font-medium">vs.</span> {black.name}{" "}
            <span className="font-medium">
              ({gameEloBeforeGameEnd.current.black.rating})
            </span>{" "}
            <span className="font-medium">({game.timeControl})</span>
          </p>
          <p>
            win +{predictResult[colorPlayer][colorPlayer].eloDiff} / draw{" "}
            {predictResult.draw[colorPlayer].eloDiff >= 0 ? "+" : ""}
            {predictResult.draw[colorPlayer].eloDiff} / lose{" "}
            {predictResult[colorOpponent][colorPlayer].eloDiff}
          </p>
        </div>
      )}

      {game.status != "active" ? (
        <div>
          <p className="font-extrabold text-xl">GAME OVER</p>
          <p>
            {game.winner == "white" ? white.name : black.name} won on{" "}
            {game.status}
          </p>
          <p className="font-medium">
            Your new {userNewRating} rating is{" "}
            <span className="font-extrabold">
              {colorPlayer == "white" ? white.elo.rating : black.elo.rating}{" "}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
};

export const GameisFinishedButton = ({
  socket,
  ButtonStyle,
  ContainerStyle,
  setIsOpen,
}: {
  socket: SocketClientType;
  ButtonStyle?: string;
  ContainerStyle?: string;
  setIsOpen?: (isOpen: boolean) => void;
}) => {
  const [rematchInvitation, setRematchInvitation] = useState<boolean>(false);
  const [rematchProposition, setRematchProposition] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const { game, white, black } = useData<GameData>();

  const pageContext = usePageContext();
  // @ts-expect-error -- fix type
  const user = pageContext.user as UserGuardPageContext;

  useEffect(() => {
    if (game.status !== "active") {
      setRematchInvitation(false);
      setRematchProposition(false);
    }
    async function rematchProposition() {
      if (game.status === "active") {
        socket.emit(
          "declineRematch",
          white.player == "user" ? black.id : white.id
        );
        return;
      }
      setRematchProposition(true);
      if (setIsOpen) setIsOpen(false);
    }
    function opponentHasDeclinedRematch() {
      setRematchInvitation(false);
    }
    socket.on("rematchProposition", rematchProposition);
    socket.on("opponentHasDeclinedRematch", opponentHasDeclinedRematch);
    return () => {
      socket.off("rematchProposition", rematchProposition);
      socket.off("opponentHasDeclinedRematch", opponentHasDeclinedRematch);
    };
  }, [game.status, white.player, black.id, socket, white, setIsOpen]);

  const mutation = useUserWaitingRoom(socket, user, setIsWaiting);

  return (
    <>
      {game.status != "active" ? (
        <>
          {rematchInvitation ? (
            <p className="text-foreground font-bold text-xl text-center">
              Rematch Requested...
            </p>
          ) : null}
          <div className={ContainerStyle}>
            <Button
              className={ButtonStyle}
              onClick={() => {
                if (isWaiting == true) {
                  socket.emit("removeUserInWaitingRoom", {
                    timeControl: game.timeControl,
                    timeIncrement: game.timeIncrement,
                  });
                } else {
                  socket.emit("addUserInWaitingRoom", {
                    timeControl: game.timeControl,
                    timeIncrement: game.timeIncrement,
                  });
                }
              }}
              disabled={mutation.isPending}
            >
              <Plus size={36} />
              New {game.timeControl} min
            </Button>
            <Popover open={rematchProposition}>
              <PopoverTrigger asChild>
                <Button
                  className={ButtonStyle}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    socket.emit("rematchInvitation", {
                      // @ts-expect-error type is good
                      white: { id: white.id, player: white.player },
                      black: black.id,
                      infoGame: {
                        timeControl: game.timeControl,
                        timeIncrement: game.timeIncrement,
                      },
                    });
                    setRematchInvitation(true);
                  }}
                  disabled={
                    rematchInvitation == true || rematchProposition == true
                  }
                >
                  <RotateCcw size={30} />
                  Rematch
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-fit h-fit">
                <p className="text-md font-semibold mb-1">
                  Your Opponent want a rematch.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      socket.emit(
                        "declineRematch",
                        white.player == "user" ? black.id : white.id
                      );
                      setRematchProposition(false);
                    }}
                  >
                    No
                  </Button>
                  <Button
                    onClick={() => {
                      socket.emit("rematchInvitation", {
                        // @ts-expect-error type is good
                        white: { id: white.id, player: white.player },
                        black: black.id,
                        infoGame: {
                          timeControl: game.timeControl,
                          timeIncrement: game.timeIncrement,
                        },
                      });
                    }}
                  >
                    Yes
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </>
      ) : null}
    </>
  );
};
