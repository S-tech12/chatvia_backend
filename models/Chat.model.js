import mongoose from 'mongoose';

// Placeholder Chat Schema for future features like group chats or chat metadata
const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, { timestamps: true });

export const Chat = mongoose.model('Chat', chatSchema);
