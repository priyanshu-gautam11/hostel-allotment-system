import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        hostelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hostel",
            required: true,
        },

        roomNumber: {
            type: Number,
            required: true,
            min: 1,
        },

        floor: {
            type: Number,
            required: true,
            min: 0,
        },

        capacity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { timestamps: true }
);

// Room number must be unique within a hostel.
roomSchema.index(
    { hostelId: 1, roomNumber: 1 },
    { unique: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;