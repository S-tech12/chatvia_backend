import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "Token missing!" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("JWT verification failed:", err);
            return res.status(403).json({ message: "Token invalid!" });
        }
        req.user = user;
        next();
    });
};

