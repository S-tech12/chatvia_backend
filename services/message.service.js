import { Message } from '../models/Message.model.js';

export const getChatHistoryService = async (loggedInUserId, receiverId) => {
    const messages = await Message.find({
        $or: [
            { sender: loggedInUserId, receiver: receiverId },
            { sender: receiverId, receiver: loggedInUserId }
        ]
    }).sort("timestamp");

    return messages;
};
