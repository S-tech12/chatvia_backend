// Centralized store for online users to share between different socket files
const onlineUsers = new Map();
const activeCalls = new Map();

export const setOnlineUser = (userId, socketId) => {
    onlineUsers.set(userId, socketId);
    console.log(`[ONLINE USERS] User connected. Total online: ${onlineUsers.size}`);
};

export const getOnlineUserSocketId = (userId) => {
    return onlineUsers.get(userId);
};

export const removeOnlineUser = (userId) => {
    if (onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        console.log(`[ONLINE USERS] User disconnected. Total online: ${onlineUsers.size}`);
    }
};

export const removeOnlineUserBySocketId = (socketId) => {
    for (let [userId, storedSocketId] of onlineUsers.entries()) {
        if (storedSocketId === socketId) {
            onlineUsers.delete(userId);
            console.log(`[ONLINE USERS] User ${userId} disconnected. Total online: ${onlineUsers.size}`);
            return userId; // return the userId that was removed
        }
    }
    return null;
};

export const getAllOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
};

// --- Active Calls Management ---

export const setActiveCall = (userId, callData) => {
    activeCalls.set(userId, callData);
    console.log(`[ACTIVE CALLS] User ${userId} added to active call. Total active calls: ${activeCalls.size}`);
};

export const getActiveCall = (userId) => {
    return activeCalls.get(userId);
};

export const isUserBusy = (userId) => {
    return activeCalls.has(userId);
};

export const removeActiveCall = (userId) => {
    if (activeCalls.has(userId)) {
        activeCalls.delete(userId);
        console.log(`[ACTIVE CALLS] User ${userId} removed from active call. Total active calls: ${activeCalls.size}`);
    }
};

export const getAllActiveCalls = () => {
    return Array.from(activeCalls.entries());
};
