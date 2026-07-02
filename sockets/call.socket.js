import { getOnlineUserSocketId, isUserBusy, setActiveCall, removeActiveCall } from '../utils/socketStore.js';
import { initiateCall, acceptCall, rejectCall, endCall } from '../services/call.service.js';

export const setupCallSockets = (io) => {
    io.on('connection', (socket) => {

        // 1. Initiate a Call
        socket.on('call-user', async ({ callerId, receiverId, callType }) => {
            const callerIdToCheck = callerId || (socket.user && socket.user.id);
            console.log(`[CALL SIGNAL] call-user: Caller ${callerIdToCheck} -> Receiver ${receiverId} (${callType})`);
            try {
                // Check if receiver is online
                const receiverSocketId = getOnlineUserSocketId(receiverId);

                if (!receiverSocketId) {
                    console.log(`[CALL SIGNAL] Receiver ${receiverId} is offline.`);
                    socket.emit('user-offline', { receiverId });
                    return;
                }

                // Check if either caller or receiver is busy to prevent race conditions / double calls
                if (isUserBusy(callerIdToCheck) || isUserBusy(receiverId)) {
                    console.log(`[CALL SIGNAL] Caller ${callerIdToCheck} or receiver ${receiverId} is busy.`);
                    socket.emit('user-busy', { receiverId });
                    return;
                }

                // Mark both users as busy synchronously with a pending call status
                setActiveCall(callerIdToCheck, { callId: 'pending', otherUserId: receiverId });
                setActiveCall(receiverId, { callId: 'pending', otherUserId: callerIdToCheck });

                // We log the call in DB as 'initiated'
                const call = await initiateCall(callerIdToCheck, receiverId, callType);

                // Update active call metadata with the saved call record ID
                setActiveCall(callerIdToCheck, { callId: call._id, otherUserId: receiverId });
                setActiveCall(receiverId, { callId: call._id, otherUserId: callerIdToCheck });

                // Emit confirmation to caller so they can record the call ID locally
                socket.emit('call-initiated', {
                    callId: call._id,
                    receiverId
                });

                io.to(receiverSocketId).emit('incoming-call', {
                    callerId: callerIdToCheck,
                    callType,
                    callId: call._id
                });
                console.log(`[CALL SIGNAL] Emitted incoming-call to Receiver ${receiverId}`);

            } catch (error) {
                console.error("Error in call-user:", error);
                const callerIdToCheck = callerId || (socket.user && socket.user.id);
                removeActiveCall(callerIdToCheck);
                removeActiveCall(receiverId);
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
            const currentUserId = userId || (socket.user && socket.user.id);
            console.log(`[CALL SIGNAL] end-call: User ${currentUserId} ended call with ${otherUserId}`);
            try {
                if (callId && callId !== 'pending') {
                    await endCall(callId);
                }

                if (currentUserId) removeActiveCall(currentUserId);
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
