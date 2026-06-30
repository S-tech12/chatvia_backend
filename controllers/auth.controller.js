import { signupService, validateOtpService, loginService, forgotPasswordOTPService, verifyForgotPasswordOTPService } from '../services/auth.service.js';
import { sendResponse } from '../utils/responseHandler.js';
import { isValidEmail, isValidMobile } from '../utils/validators.js';

export const signup = async (req, res) => {
    const { email, fullName, mobileNumber, username, Password } = req.body;

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!isValidMobile(mobileNumber)) {
        return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    await signupService(req.body);
    sendResponse(res, 201, null, 'OTP sent to email For Validation.');
};

export const validateOtp = async (req, res) => {
    const { email, Enteredotp } = req.body;
    await validateOtpService(email, Enteredotp);
    sendResponse(res, 200, null, 'Account created successfully!');
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const token = await loginService(username, password);
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax"
    });
    
    sendResponse(res, 200, null, 'Login Successfully!!');
};

export const logout = async (req, res) => {
    res.clearCookie("token");
    sendResponse(res, 200, null, 'Logged out successfully!');
};

export const forgotPasswordOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    await forgotPasswordOTPService(email);
    sendResponse(res, 200, null, 'OTP sent to email.');
};

export const verifyForgotPasswordOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });
    await verifyForgotPasswordOTPService(email, otp);
    sendResponse(res, 200, null, 'Password sent to your email.');
};
