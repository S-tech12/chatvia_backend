import { getUserDataService } from '../services/chat.service.js';
import { sendResponse } from '../utils/responseHandler.js';

export const getUserData = async (req, res) => {
    const result = await getUserDataService(req.user.id);
    sendResponse(res, 200, { result });
};
