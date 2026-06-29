import { checkProfileService, updateProfileService, getAllPeopleDataService, deleteAccountService, getProfileDataService, updateProfilePicService, sendProfileUpdateOTPService, updateProfileDataService } from '../services/user.service.js';
import { sendResponse } from '../utils/responseHandler.js';

export const verifyToken = (req, res) => {
    sendResponse(res, 200, { user: req.user }, 'Token is valid');
};

export const checkProfile = async (req, res) => {
    const isCompleted = await checkProfileService(req.user.id);
    if (isCompleted) {
        sendResponse(res, 200, null, 'Profile exists');
    } else {
        res.status(204).json({ message: 'Profile is not completed' });
    }
};

export const updateProfile = async (req, res) => {
    const { nickname, dob, bio } = req.body;
    
    if (!nickname || !dob || !bio) {
        return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    await updateProfileService(req.user.id, req.body, req.file);
    sendResponse(res, 200, null, 'Profile updated successfully');
};

export const getAllPeopleData = async (req, res) => {
    const AllPeople = await getAllPeopleDataService(req.user.id);
    sendResponse(res, 200, { AllPeople });
};

export const deleteAccount = async (req, res) => {
    await deleteAccountService(req.user.id);
    sendResponse(res, 200, null, 'Account and related messages deleted successfully');
};

export const getProfileData = async (req, res) => {
    const findUser = await getProfileDataService(req.user.id);
    sendResponse(res, 200, {
        findUser,
        _id: findUser._id,
        username: findUser.username,
        email: findUser.email,
        fullName: findUser.fullName
    });
};

export const updateProfilePic = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
    }
    const profilePicUrl = await updateProfilePicService(req.user.id, req.file);
    sendResponse(res, 200, { profilePic: profilePicUrl }, 'Profile picture updated successfully');
};

export const sendProfileUpdateOTP = async (req, res) => {
    await sendProfileUpdateOTPService(req.user.id);
    sendResponse(res, 200, null, 'OTP sent to your email.');
};

export const updateProfileData = async (req, res) => {
    const { currentPassword, otp, email, username, bio, newPassword } = req.body;
    
    if (!currentPassword || !otp) {
        return res.status(400).json({ message: 'Current password and OTP are required.' });
    }

    await updateProfileDataService(req.user.id, req.body);
    sendResponse(res, 200, null, 'Profile updated successfully.');
};

