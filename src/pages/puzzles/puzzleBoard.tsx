import axios from "axios";
import { Chess, Square } from "chess.js";
import { useEffect } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { usePuzzlesContext } from "../../frontend/context/PuzzleContext";
import { Chessboard } from "react-chessboard";
import { PuzzleType } from "#front/utils/types";

export const PuzzleBoard = () => {
  const {
    puzzle,
    setPuzzle,
    makeAMove,
    setMakeAMove,
    lastsquareMoveRef,
    initProblem,
    soluceRef,
    gameStatus,
    setGameStatus,
    isHint,
    setHint,
    mutation,
  } = usePuzzlesContext();

  const pageContext = usePageContext();

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: string) {
    if (!puzzle) return false;

    const index = soluceRef.current.soluce.indexOf(
      lastsquareMoveRef.current.from +
        lastsquareMoveRef.current.to +
        lastsquareMoveRef.current.promotion
    );
    const promotion =
      soluceRef.current.soluce[index + 1].length === 5
        ? piece[1].toLowerCase()
        : "";
    const isCorrect =
      soluceRef.current.soluce[index + 1] ==
      sourceSquare + targetSquare + promotion;

    const move = puzzle.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: promotion,
    });

    if (move == null) return false;

    lastsquareMoveRef.current = {
      from: sourceSquare,
      to: targetSquare,
      promotion: promotion,
    };
    setHint(false);
    if (!isCorrect) {
      console.log("pas corecte");
      setGameStatus(false);
      if (!mutation.isSuccess) mutation.mutate();
    }

    if (
      lastsquareMoveRef.current.from +
        lastsquareMoveRef.current.to +
        promotion ===
      soluceRef.current.soluce[soluceRef.current.soluce.length - 1]
    ) {
      setGameStatus(true);
    }
    setPuzzle(new Chess(move.after));

    const moveType =
      move.isKingsideCastle() || move.isQueensideCastle()
        ? "castle.mp3"
        : puzzle.isCheck()
        ? "move-check.mp3"
        : move.captured
        ? "capture.mp3"
        : "move-self.mp3";
    const audio = new Audio(`/sound/${moveType}`);

    audio.play();

    setMakeAMove(true);
    return true;
  }

  useEffect(() => {
    console.log("render board");

    function handleBeforeUnload() {
      if (mutation.isSuccess) {
        window.localStorage.setItem("puzzle", JSON.stringify(mutation.data));
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    const storagePuzzle = window.localStorage.getItem("puzzle");

    if (!storagePuzzle) {
      axios
        .get(
          `/problems/${
            // @ts-expect-error -- fix type
            pageContext.user?.chessProfile.elo.problem.rating ?? 400
          }`
        )
        .then((res) => {
          const chessGame = new Chess(res.data.FEN);
          window.localStorage.setItem(
            "puzzle",
            JSON.stringify({ ...res.data, startColor: chessGame.turn() })
          );
          initProblem(res.data.FEN, res.data.Moves);
        });
      return;
    }
    const puzzleParse: PuzzleType = JSON.parse(storagePuzzle);
    console.log("init puzzle");
    initProblem(puzzleParse.FEN, puzzleParse.Moves);

    function delayMove() {
      console.log("start delay move", makeAMove);
      if (!makeAMove || !puzzle) return;

      const index = soluceRef.current.soluce.indexOf(
        lastsquareMoveRef.current.from +
          lastsquareMoveRef.current.to +
          lastsquareMoveRef.current.promotion
      );
      const chars = soluceRef.current.soluce[index + 1];
      console.log("chars", chars);
      if (!chars && !mutation.isPending && !mutation.isSuccess) {
        mutation.mutate();

        console.log("mutation", mutation);
        return;
      }
      const from = chars[0] + chars[1];
      const to = chars[2] + chars[3];
      const promotion = chars.length === 5 ? chars[4] : "";

      const move = puzzle.move({
        from: from,
        to: to,
        promotion: promotion,
      });

      console.log("move", move.captured);
      const moveType =
        move.isKingsideCastle() || move.isQueensideCastle()
          ? "castle.mp3"
          : puzzle.isCheck()
          ? "move-check.mp3"
          : move.captured
          ? "capture.mp3"
          : "move-self.mp3";
      const audio = new Audio(`/sound/${moveType}`);
      audio.click(); // need to click to make the sound on chrome
      audio.play();

      lastsquareMoveRef.current = {
        from: move.from,
        to: move.to,
        promotion: promotion,
      };
      setMakeAMove(false);
      console.log("end delay move");
    }

    const move = setTimeout(delayMove, 800);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearTimeout(move);
    };
  }, [
    lastsquareMoveRef,
    setMakeAMove,
    makeAMove,
    puzzle,
    soluceRef,
    pageContext,
    setHint,
    setPuzzle,
    initProblem,
    mutation,
  ]);

  const customSquareStyles = () => {
    const column = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const line = ["1", "2", "3", "4", "5", "6", "7", "8"];
    let result = {};
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = column[i] + line[j];
        if (lastsquareMoveRef.current.from == square) {
          if (gameStatus == false && soluceRef.current.isProblemFinished) {
            result = {
              ...result,
              [square]: { backgroundColor: "Tomato", opacity: 0.33 },
            };
          } else {
            result = {
              ...result,
              [square]: { backgroundColor: "PaleGreen", opacity: 0.33 },
            };
          }
        } else if (lastsquareMoveRef.current.to == square) {
          console.log("status", gameStatus);
          if (gameStatus == false && soluceRef.current.isProblemFinished) {
            console.log("red");
            result = {
              ...result,
              [square]: {
                backgroundColor: "Tomato",
              },
            };
          } else {
            console.log("green");
            result = {
              ...result,
              [square]: {
                backgroundColor: "LightGreen",
                filter: "saturate(1)",
              },
            };
          }
        }
      }
    }
    if (isHint) {
      const index = soluceRef.current.soluce.indexOf(
        lastsquareMoveRef.current.from + lastsquareMoveRef.current.to
      );
      const square = soluceRef.current.soluce[index + 1];
      result = {
        ...result,
        [square[0] + square[1]]: {
          backgroundColor: "MediumSeaGreen",
        },
      };
    }

    return result;
  };

  const squareStyles = customSquareStyles();

  return (
    <div>
      <Chessboard
        customSquareStyles={squareStyles}
        position={puzzle?.fen() ?? undefined}
        onPieceDrop={onDrop}
        boardWidth={800}
        boardOrientation={soluceRef.current.orientation}
        customDarkSquareStyle={{
          backgroundColor: "var(--color-board-black)",
        }}
        customLightSquareStyle={{
          backgroundColor: "var(--color-board-white)",
        }}
        customNotationStyle={{ fontSize: "17px", fontWeight: "600" }}
      />
    </div>
  );
};
