import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000";

// One shared socket connection for the whole app, created lazily so we
// don't open a connection before anything actually needs live updates.
let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: true });
  }
  return socket;
};
