import express from 'express';
import { getChatHistory, uploadChatFile, uploadDocxFile, uploadPdfFile } from '../controllers/message.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { uploadPhoto, uploadDocx, uploadPdf } from '../middlewares/upload.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/:receiverId', authenticateToken, asyncHandler(getChatHistory));
router.post('/files/images', authenticateToken, uploadPhoto.single('chatFile'), uploadChatFile);
router.post('/files/documents', authenticateToken, uploadDocx.single('chatFile'), uploadDocxFile);
router.post('/files/pdfs', authenticateToken, uploadPdf.single('chatFile'), uploadPdfFile);

export default router;
