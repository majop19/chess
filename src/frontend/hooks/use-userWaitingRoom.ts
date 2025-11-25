import { SocketClientType } from "#back/socket.io/socket.types";
import EloMatchmaking, { UserEloType } from "#front/utils/EloMatchmaking";
import { sortedIndex } from "#front/utils/searchInsert";
import { GameModeType, UserGuardPageContext } from "#front/utils/types";
import { useMutation } from "@tanstack/react-query";
import mongoose, { ObjectId } from "mongoose";
import { useEffect, useRef } from "react";
import { navigate, prefetch } from "vike/client/router";

export const useUserWaitingRoom = (
  socket: SocketClientType,
  userContext: UserGuardPageContext,
  setIsWaiting: (isWaiting: boolean) => void
) => {
  const usersWaitingRoomRef = useRef<UserEloType[]>([]);
  const eloDiffRef = useRef<number>(5);

  const mutation = useMutation({
    mutationFn: async (userElo: number) => {
      console.log("begin mutation");
      if (usersWaitingRoomRef.current) {
        const findOpponent = await EloMatchmaking(
          userElo,
          usersWaitingRoomRef,
          eloDiffRef
        );
        console.log("opponent", findOpponent);
        socket.emit(
          "createChessGame",
          { id: userContext.id, elo: userElo },
          findOpponent
        );
      }
    },
  });

  useEffect(() => {
    function newUserInWaitingRoom(user: UserEloType, gameMode: GameModeType) {
      console.log("user wi", user);
      if (usersWaitingRoomRef.current.length === 0)
        usersWaitingRoomRef.current = [user];
      else {
        const index = sortedIndex(usersWaitingRoomRef.current, user);
        console.log("index", index, usersWaitingRoomRef.current);
        usersWaitingRoomRef.current.splice(index, 0, user);
        console.log(mutation.isPending, "mutation reset");
      }

      if (!mutation.isPending && usersWaitingRoomRef.current.length >= 1) {
        console.log("userWaitingRoom", mutation.isPending);
        mutation.mutate(userContext.chessProfile.elo[gameMode].rating);
      }
    }
    function deleteUserInWaitingRoom(
      userId: mongoose.Types.ObjectId | ObjectId
    ) {
      const index = usersWaitingRoomRef.current.findIndex(
        (user) => user.id.toString() === userId.toString()
      );
      if (index !== -1) {
        usersWaitingRoomRef.current.splice(index, 1);
        console.log("delete user", usersWaitingRoomRef.current);
        if (usersWaitingRoomRef.current.length <= 1 && !mutation.isPending) {
          mutation.reset();
        }
      }
    }

    function getUsersInWaitingRoom(
      users: UserEloType[],
      gameMode: GameModeType
    ) {
      console.log("user.length", users.length, users);
      if (users.length >= 2) {
        const sortedUsers = users.sort((a, b) => a.elo - b.elo);
        usersWaitingRoomRef.current = sortedUsers;
      } else {
        usersWaitingRoomRef.current = users;
      }
      if (!mutation.isPending && usersWaitingRoomRef.current.length >= 1) {
        console.log("getusersWaitingRoom", mutation.isPending);
        mutation.mutate(userContext.chessProfile.elo[gameMode].rating);
      }
    }
    async function sendChessGameId(gameId: ObjectId) {
      await prefetch(`/game/${gameId}`);
      await navigate(`/game/${gameId}`);
    }
    socket.on("newUserInWaitingRoom", newUserInWaitingRoom);
    socket.on("deleteUserInWaitingRoom", deleteUserInWaitingRoom);
    socket.on("getUsersInWaitingRoom", getUsersInWaitingRoom);

    socket.on("sendChessGameId", sendChessGameId);

    return () => {
      socket.off("newUserInWaitingRoom", newUserInWaitingRoom);
      socket.off("deleteUserInWaitingRoom", deleteUserInWaitingRoom);
      socket.off("getUsersInWaitingRoom", getUsersInWaitingRoom);

      socket.off("sendChessGameId", sendChessGameId);
    };
  }, [mutation, socket, userContext.chessProfile.elo, setIsWaiting]);

  return mutation;
};
