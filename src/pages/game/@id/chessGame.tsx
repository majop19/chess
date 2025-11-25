import { useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { SocketClientType } from "#back/socket.io/socket.types";
import { ObjectId } from "mongoose";
import { useBoardOrientationProvider } from "#front/hooks/use-context";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "#frontx/components/ui/tooltip";
import { Repeat2 } from "lucide-react";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { useData } from "vike-react/useData";
import { GameData } from "./+data";
import { useChessGameContext } from "#frontx/context/ChessGameContext";
import { IMove } from "#front/utils/types";

export const ChessGame = ({
  gameId,
  socket,
}: {
  gameId: ObjectId;
  socket: SocketClientType;
}) => {
  const { orientation, changeOrientation } = useBoardOrientationProvider();
  const { white } = useData<GameData>();
  const { chessGame, setChessGame } = useChessGameContext();

  useEffect(() => {
    function NewMove(fen: string, moveData: IMove) {
      setChessGame(new Chess(fen));
      const moveType = moveData.castle
        ? "castle.mp3"
        : chessGame.isCheck()
        ? "move-check.mp3"
        : moveData.capturedPiece
        ? "capture.mp3"
        : "move-self.mp3";
      const audio = new Audio(`/sound/${moveType}`);
      audio.click(); // need to click to make the sound on chrome
      audio.play();
    }
    socket.on("sendChessGameMove", NewMove);

    return () => {
      socket.off("sendChessGameMove", NewMove);
    };
  }, [socket, chessGame, setChessGame]);

  function onDrop(sourceSquare: string, targetSquare: string, piece: string) {
    try {
      const move = chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1]?.toLowerCase(),
      });

      const playerColor = white.player == "user" ? "w" : "b";
      if (move === null) return false;

      if (move.color != playerColor) {
        setChessGame(new Chess(move.before));
        return false;
      }

      const bite = {
        piece: move.piece,
        fromSquare: move.from,
        toSquare: move.to,
        capturedPiece: move.captured,
        fen: chessGame.fen(),
        promotion: move.promotion,
        check: chessGame.isCheck(),
        checkmate: chessGame.isCheckmate(),
        castle: move.isKingsideCastle()
          ? "kingside"
          : move.isQueensideCastle()
          ? "queenside"
          : null,
        enPassant: move.isEnPassant(),
      };
      const caca = { fen: chessGame.fen(), pgn: chessGame.pgn() };
      console.log("emitting new chessMove", bite, caca);
      socket.emit(
        "newChessMove",
        gameId,
        {
          piece: move.piece,
          fromSquare: move.from,
          toSquare: move.to,
          capturedPiece: move.captured,
          fen: chessGame.fen(),
          promotion: move.promotion,
          check: chessGame.isCheck(),
          checkmate: chessGame.isCheckmate(),
          castle: move.isKingsideCastle()
            ? "kingside"
            : move.isQueensideCastle()
            ? "queenside"
            : null,
          enPassant: move.isEnPassant(),
        },
        { fen: chessGame.fen(), pgn: chessGame.pgn() }
      );

      if (chessGame.isGameOver()) {
        const result = chessGame.isDraw()
          ? "draw"
          : chessGame.isCheckmate()
          ? "checkmate"
          : "stalemate";

        socket.emit(
          "endChessGame",
          gameId,
          result,
          result != "checkmate"
            ? "draw"
            : chessGame.turn() == "w"
            ? "black"
            : "white"
        );
        const audioEnd = new Audio(`/sound/game-end.mp3`);
        audioEnd.click();
        audioEnd.play();
      }
      setChessGame(new Chess(move.after));
      const moveType =
        move.isKingsideCastle() || move.isQueensideCastle()
          ? "castle.mp3"
          : chessGame.isCheck()
          ? "move-check.mp3"
          : move.captured
          ? "capture.mp3"
          : "move-self.mp3";
      const audio = new Audio(`/sound/${moveType}`);
      audio.click(); // need to click to make the sound on chrome
      audio.play();
      return true;
    } catch {
      return false;
    }
  }

  return (
    <div className="flex">
      <Chessboard
        position={chessGame.fen()}
        onPieceDrop={onDrop}
        boardWidth={800}
        boardOrientation={orientation}
        customDarkSquareStyle={{
          backgroundColor: "var(--color-board-black)",
        }}
        customLightSquareStyle={{
          backgroundColor: "var(--color-board-white)",
        }}
        customNotationStyle={{ fontSize: "17px", fontWeight: "600" }}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className="mb-auto cursor-pointer"
            onClick={() => changeOrientation()}
          >
            <Repeat2 />
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="bg-board-black/80 text-background font-semibold p-1 mr-1">
              Flip Board
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
