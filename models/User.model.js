import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    username: {
        type: String,
        unique: true
    },
    nickname: {
        type: String
    },
    dob: {
        type: Date
    },
    profilePic: {
        type: String
    },
    bio: {
        type: String,
        default: 'Hey there! I am using ChatVia.'
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
