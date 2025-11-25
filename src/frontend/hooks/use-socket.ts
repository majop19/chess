import { SocketClientType } from "#back/socket.io/socket.types";
import { useEffect, useRef } from "react";
import { io, ManagerOptions, SocketOptions } from "socket.io-client";

export const useSocket = (
  options?: Partial<ManagerOptions & SocketOptions> | undefined
): SocketClientType => {
  const { current: socket } = useRef(io(options));

  useEffect(() => {
    socket.connect();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return socket as unknown as SocketClientType;
};
