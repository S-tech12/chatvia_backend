import { Message } from '../models/Message.model.js';
import { User } from '../models/User.model.js';

export const getUserDataService = async (loggedInUserId) => {
    const messages = await Message.find({
        $or: [
            { sender: loggedInUserId },
            { receiver: loggedInUserId }
        ]
    }).select('sender receiver');

    const userIdSet = new Set();

    messages.forEach(msg => {
        const senderId = msg.sender.toString();
        const receiverId = msg.receiver.toString();

        if (senderId !== loggedInUserId) userIdSet.add(senderId);
        if (receiverId !== loggedInUserId) userIdSet.add(receiverId);
    });

    const chatUserIds = [...userIdSet];

    const users = await User.find(
        { _id: { $in: chatUserIds } },
        { fullName: 1, profilePic: 1 }
    );

    return users;
};
