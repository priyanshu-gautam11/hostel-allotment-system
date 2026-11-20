import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,

    },
    type: {
        type: String,
        enum: ["single", "triple"],
        required: true,
    },
    totalRooms: {
        type: Number,
        required: true,
        min: 1,

    },
    totalBeds: {
        type: Number,
        required: true,
        min: 1,
    },
    fillOrder: {
        type: Number,
        required: true,
        min: 1,
    },
    active: {
        type: Boolean,
        default: true,
    },

});
const Hostel = mongoose.model("Hostel", hostelSchema);
export default Hostel;