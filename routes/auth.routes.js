import express from 'express';
import { signup, validateOtp, login, logout, forgotPasswordOTP, verifyForgotPasswordOTP } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/register', asyncHandler(signup));
router.post('/verify-otp', asyncHandler(validateOtp));
router.post('/login', asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/password-reset/request-otp', asyncHandler(forgotPasswordOTP));
router.post('/password-reset/verify-otp', asyncHandler(verifyForgotPasswordOTP));

export default router;
