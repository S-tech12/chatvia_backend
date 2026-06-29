import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    content: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'pdf', 'docx'],
        default: 'text'
    },
    originalName: {
        type: String,
        default: 'Document'
    },
    fileSizeKB: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export const Message = mongoose.model('Message', messageSchema);
