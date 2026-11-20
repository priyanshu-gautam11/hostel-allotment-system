import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in.",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
        }

        const decoded = jwt.verify(token, env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (env.NODE_ENV !== "production") {
            console.error("Authentication error:", error.message);
        }

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};

export default auth;