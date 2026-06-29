import { User } from '../models/User.model.js';
import { Message } from '../models/Message.model.js';
import { v2 as cloudinaryModule } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let profileOtpStore = {};

export const checkProfileService = async (userId) => {
    const CheckUser = await User.findById(userId);
    if (!CheckUser) throw new Error('User not found');

    return (CheckUser.nickname && CheckUser.dob && CheckUser.profilePic);
};

export const updateProfileService = async (userId, data, file) => {
    const { nickname, dob, bio } = data;

    const CheckUser = await User.findById(userId);
    if (!CheckUser) throw new Error('User not found');

    CheckUser.nickname = nickname;
    CheckUser.dob = new Date(dob);
    CheckUser.bio = bio;

    if (file) {
        CheckUser.profilePic = file.path; // Set by multer-storage-cloudinary
    } else if (!CheckUser.profilePic) {
        // Only set default if no profile pic exists
        const defaultImagePath = path.join(__dirname, '../../Default_Image.jpeg');
        const result = await cloudinaryModule.uploader.upload(defaultImagePath, {
            folder: 'ChatVia/profile_pictures',
            public_id: userId,
            resource_type: 'image',
            overwrite: true
        });
        CheckUser.profilePic = result.secure_url;
    }

    await CheckUser.save();
};

export const getAllPeopleDataService = async (loggedInUserId) => {
    const data = await User.find();
    const userIdSet = new Set();

    data.forEach(member => {
        if (member._id.toString() !== loggedInUserId) {
            userIdSet.add(member);
        }
    });

    return [...userIdSet];
};

export const deleteAccountService = async (userId) => {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) throw new Error("User not found");

    await Message.deleteMany({
        $or: [
            { sender: userId },
            { receiver: userId }
        ]
    });
};

export const getProfileDataService = async (userId) => {
    const findUser = await User.findById(userId);
    if (!findUser) throw new Error("User not found");
    return findUser;
};

export const updateProfilePicService = async (userId, file) => {
    const CheckUser = await User.findById(userId);
    if (!CheckUser) throw new Error('User not found');

    CheckUser.profilePic = file.path;
    await CheckUser.save();
    return file.path;
};

export const sendProfileUpdateOTPService = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000);
    profileOtpStore[userId] = {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    };

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Profile Update OTP - Chatvia',
        html: `<div style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px;">
                    <h2 style="color: #004080;">Profile Update Request</h2>
                    <p>Your One-Time Password (OTP) for updating your profile is:</p>
                    <div style="font-size: 24px; font-weight: bold; padding: 10px; text-align: center;">${otp}</div>
                    <p style="color: red;">Valid for 10 minutes.</p>
                </div>
               </div>`
    };

    await transporter.sendMail(mailOptions);
};

export const updateProfileDataService = async (userId, data) => {
    const { currentPassword, otp, email, username, bio, newPassword } = data;

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.password !== currentPassword) {
        throw new Error('Incorrect current password');
    }

    if (!profileOtpStore[userId]) {
        throw new Error("No OTP found. Please request again.");
    }

    if (Date.now() > profileOtpStore[userId].expiresAt) {
        delete profileOtpStore[userId];
        throw new Error("OTP expired");
    }

    if (parseInt(otp) !== profileOtpStore[userId].otp) {
        throw new Error("Invalid OTP");
    }

    user.email = email;
    user.username = username;
    user.bio = bio;
    if (newPassword && newPassword.trim() !== '') {
        user.password = newPassword;
    }

    await user.save();
    delete profileOtpStore[userId];
};

