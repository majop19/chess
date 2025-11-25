import { useSocket } from "#front/hooks/use-socket";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "#frontx/components/ui/button";
import { ChessGameTimerType, UserGuardPageContext } from "#front/utils/types";
import { useUserWaitingRoom } from "#front/hooks/use-userWaitingRoom";
import { Chessboard } from "react-chessboard";
import {
  BlitzTimerArray,
  BulletTimerArray,
  RapidTimerArray,
  TimersVariant,
} from "./chessGameTimerArray";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "#frontx/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  BlitzIcon,
  BulletIcon,
  RapidIcon,
} from "#frontx/components/icon/GameMode.icon";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "#frontx/components/ui/avatar";

export const Page = () => {
  const pageContext = usePageContext();
  const [currentTimer, setCurrentTimer] = useState<ChessGameTimerType>({
    timeControl: 10,
    timeIncrement: 0,
  });
  const [isTimersOpen, setIsTimersOpen] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  // @ts-expect-error -- fix type
  const user = pageContext.user as UserGuardPageContext;
  const increment =
    currentTimer.timeIncrement != 0
      ? ` | ${currentTimer.timeIncrement}`
      : " min";
  const playerTimer = currentTimer.timeControl.toString() + ":00";

  const socket = useSocket({
    auth: {
      userId: user.id,
      elo: user.chessProfile.elo,
    },
  });

  const handleTimerClick = (timer: ChessGameTimerType) => {
    if (isWaiting) {
      socket.emit("removeUserInWaitingRoom", {
        timeControl: currentTimer.timeControl,
        timeIncrement: currentTimer.timeIncrement,
      });
    } else {
      socket.emit("addUserInWaitingRoom", {
        timeControl: timer.timeControl,
        timeIncrement: timer.timeIncrement,
      });
    }
    setIsWaiting((curr) => !curr);
  };

  const onClick = (timer: ChessGameTimerType) => {
    setCurrentTimer(timer);
    setIsTimersOpen(false);
  };

  useUserWaitingRoom(socket, user, setIsWaiting);
  console.log("mutation", isWaiting);
  return (
    <div className="flex justify-center gap-10 items-center h-full w-full">
      <div>
        <div className="flex flex-items gap-2 w-[800px] items-center h-[70px]">
          <Avatar className="size-13">
            <AvatarImage src="player.png" className="p-1" />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <p className="font-medium text-xl">Opponent</p>
          <div className="w-45 h-12 bg-card flex items-center text-4xl font-semibold justify-end pr-3 relative ml-auto">
            {playerTimer}
          </div>
        </div>
        <Chessboard
          boardWidth={800}
          arePiecesDraggable={false}
          customDarkSquareStyle={{
            backgroundColor: "var(--color-board-black)",
          }}
          customLightSquareStyle={{
            backgroundColor: "var(--color-board-white)",
          }}
          customNotationStyle={{ fontSize: "17px", fontWeight: "600" }}
        />
        <div className="flex flex-items gap-2 w-[800px] items-center h-[70px]">
          <Avatar className="h-11 w-11 rounded-md">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="font-semibold bg-secondary rounded-md text-2xl">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <p className="font-medium text-xl">{user.name}</p>
          <div className="w-45 h-12 bg-card flex items-center text-4xl font-semibold  justify-end pr-3 relative ml-auto">
            {playerTimer}
          </div>
        </div>
      </div>
      <Card className="w-1/4 h-[940px]">
        <CardHeader className="w-full">
          <div className="flex justify-center">
            <Button
              onClick={() => setIsTimersOpen((curr) => !curr)}
              className="w-full m-2 text-xl font-bold h-14 p-4"
              variant="outline"
              disabled={isWaiting}
            >
              <div className="flex justify-center w-full">
                {currentTimer.timeControl >= 10 ? (
                  <RapidIcon />
                ) : currentTimer.timeControl >= 3 ? (
                  <BlitzIcon />
                ) : (
                  <BulletIcon />
                )}
                {currentTimer.timeControl + increment}
              </div>
              {isTimersOpen ? (
                <ChevronUp size={28} className="ml-auto" />
              ) : (
                <ChevronDown size={28} className="ml-auto" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          {isTimersOpen ? (
            <div className="w-full">
              <TimersVariant
                timersArray={BulletTimerArray}
                gameMode="bullet"
                onClick={onClick}
              />
              <TimersVariant
                timersArray={BlitzTimerArray}
                gameMode="blitz"
                onClick={onClick}
              />
              <TimersVariant
                timersArray={RapidTimerArray}
                gameMode="rapid"
                onClick={onClick}
              />
            </div>
          ) : null}
          <div className="flex justify-center">
            <Button
              className="w-full m-2 text-xl font-bold h-14 p-4"
              onClick={() => handleTimerClick(currentTimer)}
            >
              {isWaiting ? "Cancel Search" : "Start Game"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
