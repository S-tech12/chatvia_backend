import express from 'express';
import { getUserCallHistory } from '../controllers/call.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all call routes
router.use(authenticateToken);

router.get('/history', getUserCallHistory);

export default router;
