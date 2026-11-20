import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student",
        },

        // Student profile information
        rollNo: {
            type: String,
            trim: true,
            sparse: true,
            unique: true,
        },

        course: {
            type: String,
            trim: true,
        },

        semester: {
            type: Number,
            min: 1,
            max: 8,
        },

        distanceKm: {
            type: Number,
            min: 0,
        },
        previousHostel: {
            type: Boolean,
            default: false,
        },
        isPhysicallyDisabled: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;