import { getOnlineUserSocketId, isUserBusy, setActiveCall, removeActiveCall } from '../utils/socketStore.js';
import { initiateCall, acceptCall, rejectCall, endCall } from '../services/call.service.js';

export const setupCallSockets = (io) => {
    io.on('connection', (socket) => {

        // 1. Initiate a Call
        socket.on('call-user', async ({ callerId, receiverId, callType }) => {
            console.log(`[CALL SIGNAL] call-user: Caller ${callerId} -> Receiver ${receiverId} (${callType})`);
            try {
                // Check if receiver is online
                const receiverSocketId = getOnlineUserSocketId(receiverId);

                if (!receiverSocketId) {
                    console.log(`[CALL SIGNAL] Receiver ${receiverId} is offline.`);
                    socket.emit('user-offline', { receiverId });
                    return;
                }

                if (isUserBusy(receiverId)) {
                    console.log(`[CALL SIGNAL] Receiver ${receiverId} is currently busy.`);
                    socket.emit('user-busy', { receiverId });
                    return;
                }

                // We log the call in DB as 'initiated'
                const call = await initiateCall(callerId, receiverId, callType);

                io.to(receiverSocketId).emit('incoming-call', {
                    callerId,
                    callType,
                    callId: call._id
                });
                console.log(`[CALL SIGNAL] Emitted incoming-call to Receiver ${receiverId}`);

            } catch (error) {
                console.error("Error in call-user:", error);
            }
        });

        // 2. Accept Call
        socket.on('accept-call', async ({ callId, callerId, receiverId }) => {
            console.log(`[CALL SIGNAL] accept-call: Receiver ${receiverId} accepted call from Caller ${callerId}`);
            try {
                await acceptCall(callId);
                const callerSocketId = getOnlineUserSocketId(callerId);

                // Mark both users as busy
                setActiveCall(callerId, { callId, otherUserId: receiverId });
                setActiveCall(receiverId, { callId, otherUserId: callerId });

                if (callerSocketId) {
                    io.to(callerSocketId).emit('call-accepted', { receiverId, callId });
                }
            } catch (error) {
                console.error("Error in accept-call:", error);
            }
        });

        // 3. Reject Call
        socket.on('reject-call', async ({ callId, callerId, receiverId }) => {
            console.log(`[CALL SIGNAL] reject-call: Receiver ${receiverId} rejected call from Caller ${callerId}`);
            try {
                await rejectCall(callId);
                removeActiveCall(callerId);
                removeActiveCall(receiverId);

                const callerSocketId = getOnlineUserSocketId(callerId);

                if (callerSocketId) {
                    io.to(callerSocketId).emit('call-rejected', { receiverId, callId });
                }
            } catch (error) {
                console.error("Error in reject-call:", error);
            }
        });

        // 4. WebRTC Signaling: Offer
        socket.on('offer', ({ receiverId, offer }) => {
            const receiverSocketId = getOnlineUserSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('offer', { offer, senderId: socket.id });
            }
        });

        // 5. WebRTC Signaling: Answer
        socket.on('answer', ({ receiverId, answer }) => {
            const receiverSocketId = getOnlineUserSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('answer', { answer, senderId: socket.id });
            }
        });

        // 6. WebRTC Signaling: ICE Candidate
        socket.on('ice-candidate', ({ receiverId, candidate }) => {
            const receiverSocketId = getOnlineUserSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('ice-candidate', { candidate, senderId: socket.id });
            }
        });

        // 7. End Call
        socket.on('end-call', async ({ callId, otherUserId, userId }) => {
            console.log(`[CALL SIGNAL] end-call: User ${userId} ended call with ${otherUserId}`);
            try {
                if (callId) {
                    await endCall(callId);
                }

                if (userId) removeActiveCall(userId);
                if (otherUserId) removeActiveCall(otherUserId);

                const otherSocketId = getOnlineUserSocketId(otherUserId);
                if (otherSocketId) {
                    io.to(otherSocketId).emit('call-ended');
                }
            } catch (error) {
                console.error("Error in end-call:", error);
            }
        });

        // 8. User Busy (deprecated but kept for fallback)
        socket.on('user-busy', ({ callerId }) => {
            const callerSocketId = getOnlineUserSocketId(callerId);
            if (callerSocketId) {
                io.to(callerSocketId).emit('user-busy');
            }
        });

    });
};
