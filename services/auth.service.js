import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
import { User } from '../models/User.model.js';
import { generateToken } from '../utils/generateToken.js';

let otpStore = {};
let forgotPasswordOtpStore = {};

export const signupService = async (data) => {
    const { email, fullName, mobileNumber, username, Password } = data;

    // Check if user already exists
    const existingUserEmailId = await User.findOne({ email });
    if (existingUserEmailId) throw new Error('E-mail already exists');

    const existingUserMobileNumber = await User.findOne({ mobileNumber });
    if (existingUserMobileNumber) throw new Error('Mobile Number already exists');

    const existingUserName = await User.findOne({ username });
    if (existingUserName) throw new Error('Username already exists');

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP

    otpStore[email] = {
        otp,
        data: { email, fullName, mobileNumber, username, Password },
        expiresAt: Date.now() + 10 * 60 * 100 // valid for short time
    };

    const mailOptions = {
        from: process.env.SENDGRID_SENDER_EMAIL,
        to: email,
        subject: 'Sign Up Confirmation',
        html: `<div style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #004080;">Welcome to ChatVia Application!</h2>
                    <p>Thank you for creating an account with us.</p>
                    <p>Your One-Time Password (OTP) is:</p>
                    <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #333; background: #f0f0f0; padding: 10px 20px; border-radius: 8px; text-align: center; width: fit-content; margin: 20px auto;">
                    ${otp}
                    </div>
                    <p style="color : red ; font-size : 22px"><b>This OTP is valid for the next 1 minutes</b>. Please do not share it with anyone.</p>
                    <p style="margin-top: 30px;">Best regards,<br><strong>ChatVia Team</strong></p>
                </div>
                </div>`
    };

    await sgMail.send(mailOptions);
};

export const validateOtpService = async (email, Enteredotp) => {
    if (!otpStore[email]) {
        throw new Error("No OTP found. Please sign up again.");
    }

    const { otp, data } = otpStore[email];

    if (Date.now() > otpStore[email].expiresAt) {
        delete otpStore[email];
        throw new Error("OTP expired");
    }

    if (parseInt(Enteredotp) !== otp) {
        throw new Error("Invalid OTP");
    }

    // Create a new user with the validated data
    const newUser = new User({
        email: data.email,
        fullName: data.fullName,
        mobileNumber: data.mobileNumber,
        username: data.username,
        password: data.Password
    });

    await newUser.save();
    delete otpStore[email];
};

export const loginService = async (username, password) => {
    const usernameCheck = await User.findOne({ username });
    if (!usernameCheck) {
        throw new Error('No any type of username check once more time');
    }

    const passwordCheck = await User.findOne({ username, password });
    if (!passwordCheck) {
        throw new Error('Wrong password');
    }

    const token = generateToken({
        id: passwordCheck._id,
        username: passwordCheck.username,
        userEmailid: passwordCheck.email
    });

    return token;
};

export const forgotPasswordOTPService = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("No account found with that email");

    const otp = Math.floor(100000 + Math.random() * 900000);
    forgotPasswordOtpStore[email] = {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    };

    const mailOptions = {
        from: process.env.SENDGRID_SENDER_EMAIL,
        to: email,
        subject: 'Password Recovery OTP - Chatvia',
        html: `<div style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px;">
                    <h2 style="color: #004080;">Password Recovery</h2>
                    <p>Your One-Time Password (OTP) for recovering your password is:</p>
                    <div style="font-size: 24px; font-weight: bold; padding: 10px; text-align: center;">${otp}</div>
                    <p style="color: red;">Valid for 10 minutes.</p>
                </div>
               </div>`
    };

    await sgMail.send(mailOptions);
};

export const verifyForgotPasswordOTPService = async (email, Enteredotp) => {
    if (!forgotPasswordOtpStore[email]) {
        throw new Error("No OTP found. Please request again.");
    }

    if (Date.now() > forgotPasswordOtpStore[email].expiresAt) {
        delete forgotPasswordOtpStore[email];
        throw new Error("OTP expired");
    }

    if (parseInt(Enteredotp) !== forgotPasswordOtpStore[email].otp) {
        throw new Error("Invalid OTP");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }

    const mailOptions = {
        from: process.env.SENDGRID_SENDER_EMAIL,
        to: email,
        subject: 'Your Password - Chatvia',
        html: `<div style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px;">
                <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px;">
                    <h2 style="color: #004080;">Password Recovery Successful</h2>
                    <p>As requested, here is your current password:</p>
                    <div style="font-size: 20px; font-weight: bold; padding: 10px; text-align: center; background: #f0f0f0; border-radius: 8px;">
                        ${user.password}
                    </div>
                    <p style="margin-top: 20px;">If you did not request this, please secure your account immediately.</p>
                </div>
               </div>`
    };

    await sgMail.send(mailOptions);
    delete forgotPasswordOtpStore[email];
};
