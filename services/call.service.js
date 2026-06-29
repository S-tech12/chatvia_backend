import { Call } from '../models/Call.model.js';

export const initiateCall = async (callerId, receiverId, callType) => {
    try {
        const call = new Call({
            caller: callerId,
            receiver: receiverId,
            callType,
            status: 'initiated'
        });
        await call.save();
        return call;
    } catch (error) {
        console.error('Error in initiateCall:', error);
        throw error;
    }
};

export const acceptCall = async (callId) => {
    try {
        return await Call.findByIdAndUpdate(callId, {
            status: 'accepted',
            startTime: new Date()
        }, { new: true });
    } catch (error) {
        console.error('Error in acceptCall:', error);
        throw error;
    }
};

export const rejectCall = async (callId) => {
    try {
        return await Call.findByIdAndUpdate(callId, {
            status: 'rejected',
            endTime: new Date()
        }, { new: true });
    } catch (error) {
        console.error('Error in rejectCall:', error);
        throw error;
    }
};

export const endCall = async (callId) => {
    try {
        return await Call.findByIdAndUpdate(callId, {
            status: 'ended',
            endTime: new Date()
        }, { new: true });
    } catch (error) {
        console.error('Error in endCall:', error);
        throw error;
    }
};

export const getCallHistory = async (userId) => {
    try {
        return await Call.find({
            $or: [{ caller: userId }, { receiver: userId }]
        })
        .populate('caller', 'fullName profilePic')
        .populate('receiver', 'fullName profilePic')
        .sort({ createdAt: -1 });
    } catch (error) {
        console.error('Error in getCallHistory:', error);
        throw error;
    }
};
