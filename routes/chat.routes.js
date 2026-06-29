import express from 'express';
import { getUserData } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/users', authenticateToken, asyncHandler(getUserData));

export default router;
