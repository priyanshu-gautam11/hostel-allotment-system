import mongoose from "mongoose";

const allotmentSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        bedId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bed",
            required: true,
        },

        status: {
            type: String,
            enum: [
                "offered",
                "accepted",
                "declined",
                "expired",
                "cancelled",
            ],
            required: true,
        },

        offeredAt: {
            type: Date,
            required: true,
        },

        respondBy: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

const activeStatuses = ["offered", "accepted"];

// One active allotment per student.
allotmentSchema.index(
    { studentId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: activeStatuses },
        },
    }
);

// One active allotment per bed.
allotmentSchema.index(
    { bedId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: activeStatuses },
        },
    }
);

// Faster student allotment history lookup.
allotmentSchema.index({
    studentId: 1,
    createdAt: -1,
});

const Allotment = mongoose.model(
    "Allotment",
    allotmentSchema
);

export default Allotment;