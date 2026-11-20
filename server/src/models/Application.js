import mongoose from "mongoose";

const preferenceSchema = new mongoose.Schema(
    {
        hostelType: {
            type: String,
            enum: ["single", "triple"],
            required: true,
        },

        mode: {
            type: String,
            enum: ["only", "preferred"],
            required: true,
        },
    },
    { _id: false }
);

const applicationSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        claimedCgpa: {
            type: Number,
            required: true,
            min: 0,
            max: 10,
        },

        verifiedCgpa: {
            type: Number,
            default: null,
            min: 0,
            max: 10,
        },

        preferences: {
            type: [preferenceSchema],
            default: [],
            validate: {
                validator: function (preferences) {
                    if (!preferences || preferences.length === 0) {
                        return false;
                    }

                    const hostelTypes = preferences.map(
                        (preference) => preference.hostelType
                    );

                    return new Set(hostelTypes).size === hostelTypes.length;
                },
                message:
                    "At least one preference is required and hostel types cannot be duplicated.",
            },
        },

        status: {
            type: String,
            enum: [
                "submitted",
                "verified",
                "rejected",
                "allotted",
                "waitlisted",
            ],
            default: "submitted",
        },

        marksheet: {
            type: String,
            required: true,
        },

        marksheetOriginalName: {
            type: String,
            default: "",
        },

        isPhysicallyDisabled: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// One application per student.
applicationSchema.index(
    { studentId: 1 },
    { unique: true }
);

const Application = mongoose.model(
    "Application",
    applicationSchema
);

export default Application;