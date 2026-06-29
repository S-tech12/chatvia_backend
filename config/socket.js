import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { setupChatSockets } from '../sockets/chat.socket.js';
import { setupCallSockets } from '../sockets/call.socket.js';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: true,
            credentials: true
        }
    });

    // Authentication middleware for Socket.IO
    io.use((socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || '');
            const token = cookies.token;
            if (!token) {
                return next(new Error("Authentication error: Token missing"));
            }
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    return next(new Error("Authentication error: Token invalid"));
                }
                socket.user = user;
                next();
            });
        } catch (err) {
            next(new Error("Authentication error"));
        }
    });

    // Setup events
    setupChatSockets(io);
    setupCallSockets(io);

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
