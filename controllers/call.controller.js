import { getCallHistory } from '../services/call.service.js';

export const getUserCallHistory = async (req, res, next) => {
    try {
        const userId = req.user._id; // Assuming authMiddleware sets req.user
        const history = await getCallHistory(userId);
        res.status(200).json({
            success: true,
            history
        });
    } catch (error) {
        next(error);
    }
};
