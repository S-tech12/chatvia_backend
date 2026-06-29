import { getChatHistoryService } from '../services/message.service.js';
import { sendResponse } from '../utils/responseHandler.js';

export const getChatHistory = async (req, res) => {
    const receiverId = req.params.receiverId;
    const messages = await getChatHistoryService(req.user.id, receiverId);
    sendResponse(res, 200, { messages });
};

export const uploadChatFile = (req, res) => {
    res.json({ url: req.file.path });
};

export const uploadDocxFile = (req, res) => {
    res.json({
        url: req.file.path,
        originalName: req.file.originalname
    });
};

export const uploadPdfFile = (req, res) => {
    res.json({
        url: req.file.path,
        originalName: req.file.originalname
    });
};
