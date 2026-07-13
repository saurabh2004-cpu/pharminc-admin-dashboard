import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
    if (socket) return socket;

    // Derive Socket URL from API base URL
    const backendUrl = import.meta.env.VITE_BASE_BACKEND_URL || "http://localhost:3001/api/v1/";
    const SOCKET_URL = backendUrl.replace('/api/v1/', '').replace('/api/v1', '');

    socket = io(SOCKET_URL, {
        auth: {
            token,
        },
        transports: ["websocket"],
        reconnection: true,
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
