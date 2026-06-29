// Generic validation middleware (placeholder for possible Joi/Zod validation integration)
export const validate = (schema) => (req, res, next) => {
    // Implement validation logic here if needed
    // e.g. const { error } = schema.validate(req.body);
    // if (error) return res.status(400).json({ message: error.details[0].message });
    next();
};
