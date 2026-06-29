export const sendResponse = (res, statusCode, data, message = "Success") => {
    return res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        message,
        ...data
    });
};

export const sendError = (res, statusCode, message, error = null) => {
    const response = {
        success: false,
        message
    };
    if (error) {
        response.error = error.message || error;
    }
    return res.status(statusCode).json(response);
};
