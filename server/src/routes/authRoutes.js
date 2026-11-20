import express from "express";
import rateLimit from "express-rate-limit";

import {
    register,
    login,
    getMe,
} from "../controllers/authController.js";

import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";

import {
    registerSchema,
    loginSchema,
} from "../validators/authValidator.js";

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
});

router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/login",
    loginLimiter,
    validate(loginSchema),
    login
);

router.get("/me", auth, getMe);

export default router;