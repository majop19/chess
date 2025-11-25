import {
  type ServerType,
  type SocketServerType,
} from "#back/socket.io/socket.types";

export const WaitingRoomGameEventHandler = async (
  io: ServerType,
  socket: SocketServerType
) => {
  // const userId = socket.handshake.auth?.userId || socket.data.userId;

  socket.on("register", (data) => {
    // Manually register user data for testing with apidog
    socket.data.userId = data.userId;
    socket.data.elo = data.elo;
    socket.join(`user:${data.userId}`);
    console.log("User registered manually:", socket.data, socket.rooms);
  });

  socket.on("addUserInWaitingRoom", async (timer) => {
    const room = `WaitingRoom:${timer.timeControl}/${timer.timeIncrement}`;
    console.log("room", room);
    if (socket.rooms.has(room)) return;
    const gameMode =
      timer.timeControl == 10 || timer.timeControl == 15
        ? "rapid"
        : timer.timeControl == 1
        ? "bullet"
        : "blitz";
    console.log("game mode", gameMode, socket.handshake.auth?.elo?.[gameMode]);
    io.to(room).emit(
      "newUserInWaitingRoom",
      {
        id: socket.handshake.auth?.userId || socket.data.userId,
        elo: socket.handshake.auth?.elo?.[gameMode].rating || socket.data.elo,
      },
      gameMode
    );

    const sockets = await io.in(room).fetchSockets();

    const UsersInWaitingRoom = sockets.map((socket) => {
      return {
        id: socket.handshake.auth?.userId || socket.data.userId,
        elo: socket.handshake.auth?.elo?.[gameMode].rating || socket.data.elo,
      };
    });
    console.log(
      "users in waiting room",
      UsersInWaitingRoom,
      socket.handshake.auth?.userId || socket.data.userId,
      { userId: socket.handshake.auth?.userId, dataUserId: socket.data.userId }
    );
    io.to(`user:${socket.handshake.auth?.userId || socket.data.userId}`).emit(
      "getUsersInWaitingRoom",
      UsersInWaitingRoom,
      gameMode
    );
    socket.join(room);
  });

  socket.on("removeUserInWaitingRoom", async (timer) => {
    const room = `WaitingRoom:${timer.timeControl}/${timer.timeIncrement}`;

    io.in([
      `user:${socket.handshake.auth?.userId || socket.data.userId}`,
    ]).socketsLeave(room);

    console.log("remove User", socket.rooms);
    io.to([`user:${socket.handshake.auth?.userId || socket.data.userId}`]).emit(
      "deleteUserInWaitingRoom",
      socket.handshake.auth?.userId || socket.data.userId,
      timer.timeControl == 1
        ? "bullet"
        : timer.timeControl == 3
        ? "blitz"
        : "rapid"
    );
  });
};
