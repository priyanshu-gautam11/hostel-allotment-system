import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { env } from "../config/env.js";

// GENERATE JWT TOKEN
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role,
        },
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN,
        }
    );
};

// REGISTER
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Zod has already validated and trimmed these fields.
        const normalizedEmail = email.toLowerCase();

        // Check whether email already exists.
        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered.",
            });
        }

        // Hash password before saving.
        const passwordHash = await bcrypt.hash(password, 12);

        // Public registration always creates a student.
        const user = await User.create({
            name,
            email: normalizedEmail,
            passwordHash,
            role: "student",
        });

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered.",
            });
        }

        next(error);
    }
};

// LOGIN
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Zod has already validated the input.
        const user = await User.findOne({
            email: email.toLowerCase(),
        }).select("+passwordHash");

        if (
            !user ||
            !(await bcrypt.compare(password, user.passwordHash))
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET CURRENT USER
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-passwordHash");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};