import { Message } from '../models/Message.model.js';
import {
    setOnlineUser,
    getOnlineUserSocketId,
    removeOnlineUserBySocketId,
    getAllOnlineUsers,
    getActiveCall,
    removeActiveCall
} from '../utils/socketStore.js';
import { endCall } from '../services/call.service.js';

export const setupChatSockets = (io) => {
    io.on("connection", (socket) => {

        socket.on("register", (senderId) => {
            setOnlineUser(senderId, socket.id);
            console.log(`Registered: ${senderId} → ${socket.id}`);

            socket.emit("onlineUsersList", getAllOnlineUsers());
            socket.broadcast.emit("userOnline", senderId);
        });

        socket.on("sendMessageFromSender", async ({ senderId, receiverId, message }) => {
            const receiverSocketId = getOnlineUserSocketId(receiverId);

            const messageInstance = new Message({
                sender: senderId,
                receiver: receiverId,
                content: message,
                messageType: "text"
            });

            await messageInstance.save();

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveMessage", {
                    senderId,
                    message
                });
            } else {
                console.log(`User ${receiverId} is not online.`);
            }
        });

        socket.on("sendImageVideoFromSender", async ({ senderId, receiverId, fileUrl, Filetype }) => {
            const receiverSocketId = getOnlineUserSocketId(receiverId);

            const messageInstance = new Message({
                sender: senderId,
                receiver: receiverId,
                content: fileUrl,
                messageType: Filetype
            });

            await messageInstance.save();

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveImageVideo", {
                    senderId,
                    fileUrl,
                    Filetype
                });
            } else {
                console.log(`User ${receiverId} is not online.`);
            }
        });

        socket.on("sendDocxFromSender", async ({ senderId, receiverId, fileUrl, Filetype, originalName, fileSizeKB }) => {
            const receiverSocketId = getOnlineUserSocketId(receiverId);

            const messageInstance = new Message({
                sender: senderId,
                receiver: receiverId,
                content: fileUrl,
                messageType: Filetype,
                originalName: originalName,
                fileSizeKB: fileSizeKB
            });

            await messageInstance.save();

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveDocx", {
                    senderId,
                    fileUrl,
                    Filetype,
                    originalName
                });
            } else {
                console.log(`User ${receiverId} is not online.`);
            }
        });

        socket.on("sendPdfFromSender", async ({ senderId, receiverId, fileUrl, Filetype, originalName, fileSizeKB }) => {
            const receiverSocketId = getOnlineUserSocketId(receiverId);

            const messageInstance = new Message({
                sender: senderId,
                receiver: receiverId,
                content: fileUrl,
                messageType: Filetype,
                originalName: originalName,
                fileSizeKB: fileSizeKB
            });

            await messageInstance.save();

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receivePdf", {
                    senderId,
                    fileUrl,
                    Filetype,
                    originalName
                });
            } else {
                console.log(`User ${receiverId} is not online.`);
            }
        });

        socket.on("disconnect", async () => {
            const disconnectedUserId = removeOnlineUserBySocketId(socket.id);
            if (disconnectedUserId) {
                console.log(`User ${disconnectedUserId} disconnected`);
                io.emit("userOffline", disconnectedUserId);

                // Cleanup active calls
                const activeCallData = getActiveCall(disconnectedUserId);
                if (activeCallData) {
                    removeActiveCall(disconnectedUserId);
                    removeActiveCall(activeCallData.otherUserId);

                    try {
                        await endCall(activeCallData.callId);
                    } catch (e) {
                        console.error("Failed to end call on disconnect", e);
                    }

                    const otherSocketId = getOnlineUserSocketId(activeCallData.otherUserId);
                    if (otherSocketId) {
                        io.to(otherSocketId).emit('call-ended');
                    }
                }
            }
        });
    });
};
