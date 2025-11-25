import { SocketClientType } from "#back/socket.io/socket.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "#frontx/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { GameData } from "./+data";
import { useData } from "vike-react/useData";
import { GameisFinishedButton } from "./gameLayout";
import { Button } from "#frontx/components/ui/button";
import { Menu } from "lucide-react";
import { navigate } from "vike/client/router";
export const DialogEndGame = ({
  children,
  socket,
}: {
  children: React.ReactNode;
  socket: SocketClientType;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { game } = useData<GameData>();

  useEffect(() => {
    function sendChessGameId() {
      setIsOpen(false);
    }

    if (game.status != "active") {
      setIsOpen(true);
    }

    socket.on("sendChessGameId", sendChessGameId);
    return () => {
      socket.off("sendChessGameId", sendChessGameId);
    };
  }, [game.status, socket]);

  console.log("render dialog", isOpen);
  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[400px] text-foreground" onClose={setIsOpen}>
        <DialogHeader>
          <DialogTitle className="capitalize font-bold text-3xl">
            {game.winner} Won
          </DialogTitle>
          <DialogDescription className="medium text-xl">
            by {game.status}
          </DialogDescription>
        </DialogHeader>
        <Button
          className="h-12 text-xl"
          variant="secondary"
          onClick={(e) => {
            e.preventDefault();
            throw navigate("/game");
          }}
        >
          <Menu size={32} />
          Game Menu
        </Button>
        <GameisFinishedButton
          socket={socket}
          ButtonStyle="text-md h-12 w-[45%] m-auto"
          ContainerStyle="flex w-full"
          setIsOpen={setIsOpen}
        />
      </DialogContent>
    </Dialog>
  );
};
