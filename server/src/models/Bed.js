import mongoose from "mongoose";

const bedSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },

        hostelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hostel",
            required: true,
        },

        bedNumber: {
            type: Number,
            required: true,
            min: 1,
        },

        status: {
            type: String,
            enum: ["available", "offered", "occupied", "blocked"],
            default: "available",
            required: true,
        },

        currentStudentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

// Bed number must be unique within a room.
bedSchema.index(
    { roomId: 1, bedNumber: 1 },
    { unique: true }
);

// Faster vacancy and hostel-wise bed searches.
bedSchema.index({
    hostelId: 1,
    status: 1,
});

// Faster student bed lookup.
bedSchema.index({
    currentStudentId: 1,
    status: 1,
});

const Bed = mongoose.model("Bed", bedSchema);

export default Bed;