import {
  BlitzIcon,
  BulletIcon,
  RapidIcon,
} from "#frontx/components/icon/GameMode.icon";
import { Button } from "#frontx/components/ui/button";
import { ChessGameTimerType, GameModeType } from "#front/utils/types";

export const RapidTimerArray = [
  { timeControl: 10, timeIncrement: 0 },
  { timeControl: 10, timeIncrement: 3 },
  { timeControl: 15, timeIncrement: 10 },
] as ChessGameTimerType[];

export const BulletTimerArray = [
  { timeControl: 1, timeIncrement: 0 },
  { timeControl: 1, timeIncrement: 1 },
  { timeControl: 1, timeIncrement: 2 },
] as ChessGameTimerType[];

export const BlitzTimerArray = [
  { timeControl: 3, timeIncrement: 0 },
  { timeControl: 3, timeIncrement: 2 },
  { timeControl: 5, timeIncrement: 0 },
] as ChessGameTimerType[];

export const TimersVariant = ({
  gameMode,
  timersArray,
  onClick,
}: {
  gameMode: GameModeType;
  timersArray: ChessGameTimerType[];
  onClick: (timer: ChessGameTimerType) => void;
}) => {
  return (
    <div className="mb-2">
      <div className="flex font-bold text-lg items-center gap-1">
        {gameMode == "rapid" ? (
          <RapidIcon />
        ) : gameMode == "blitz" ? (
          <BlitzIcon />
        ) : (
          <BulletIcon />
        )}
        <p className="capitalize pb-1">{gameMode}</p>
      </div>
      <div className="w-full flex items-center gap-2">
        {timersArray.map((timer) => {
          const increment =
            timer.timeIncrement != 0 ? ` | ${timer.timeIncrement}` : " min";
          return (
            <Button
              key={`${timer.timeControl}:${timer.timeIncrement}`}
              className="w-[32%] text-sm"
              onClick={(e) => {
                e.preventDefault();
                onClick(timer);
              }}
              variant="outline"
              size="lg"
            >
              {timer.timeControl + increment}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
