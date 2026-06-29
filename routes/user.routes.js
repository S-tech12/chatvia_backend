import express from 'express';
import { verifyToken, checkProfile, updateProfile, getAllPeopleData, deleteAccount, getProfileData, updateProfilePic, sendProfileUpdateOTP, updateProfileData } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { uploadProfile } from '../middlewares/upload.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/verify-token', authenticateToken, verifyToken);
router.get('/profile-status', authenticateToken, asyncHandler(checkProfile));
router.post('/profile', authenticateToken, uploadProfile.single('profilePic'), asyncHandler(updateProfile));
router.get('/users', authenticateToken, asyncHandler(getAllPeopleData));
router.delete('/', authenticateToken, asyncHandler(deleteAccount));
router.get('/', authenticateToken, asyncHandler(getProfileData));
router.post('/profile-picture', authenticateToken, uploadProfile.single('profilePic'), asyncHandler(updateProfilePic));
router.post('/profile/otp', authenticateToken, asyncHandler(sendProfileUpdateOTP));
router.put('/profile/details', authenticateToken, asyncHandler(updateProfileData));

export default router;