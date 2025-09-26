import { io } from "socket.io-client";

const ENDPOINT = import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:3000";

const nalawadeSocket = io(ENDPOINT, { autoConnect: false });

export default nalawadeSocket;