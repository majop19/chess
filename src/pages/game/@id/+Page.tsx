import { useSocket } from "#front/hooks/use-socket";
import { UserGuardPageContext } from "#front/utils/types";
import { usePageContext } from "vike-react/usePageContext";
import { useData } from "vike-react/useData";
import { GameTimer, UserGameProfile } from "./userGameProfile";
import { GameData } from "./+data";
import { ChessGame } from "./chessGame";
import { GameLayout } from "./gameLayout";
import { DialogEndGame } from "./DialogEndGame";

export const Page = () => {
  const pageContext = usePageContext();
  const { white, black, game } = useData<GameData>();
  // @ts-expect-error -- fix type
  const user = pageContext.user as UserGuardPageContext;

  console.log("render page game");
  const socket = useSocket({
    auth: {
      userId: user.id,
      elo: user.chessProfile.elo,
    },
  });

  const opponentSide = white.player == "user" ? "blackTime" : "whiteTime";

  const userSide = white.player == "user" ? "whiteTime" : "blackTime";

  console.log(userSide, opponentSide);
  return (
    <div className="flex justify-center gap-10 items-center h-full w-full">
      <div className="flex flex-col mb-auto justify-end m-0">
        <UserGameProfile
          user={opponentSide == "whiteTime" ? white : black}
          player={opponentSide}
        >
          <GameTimer socket={socket} player={opponentSide} />
        </UserGameProfile>
        <DialogEndGame socket={socket}>
          {/* @ts-expect-error type is correct */}
          <ChessGame socket={socket} gameId={game._id} />
        </DialogEndGame>
        <UserGameProfile
          user={userSide == "whiteTime" ? white : black}
          player={userSide}
        >
          <GameTimer socket={socket} player={userSide} />
        </UserGameProfile>
      </div>
      <div className="w-1/4 ml-10">
        <GameLayout socket={socket} />
      </div>
    </div>
  );
};
