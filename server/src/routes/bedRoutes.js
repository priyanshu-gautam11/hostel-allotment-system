import express from "express";
import mongoose from "mongoose";
import { z } from "zod";

import Bed from "../models/Bed.js";
import Hostel from "../models/Hostel.js";
import Room from "../models/Room.js";

import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// BED QUERY VALIDATION
const bedQuerySchema = z.object({
    hostelId: z
        .string()
        .trim()
        .min(1, "Hostel ID cannot be empty.")
        .optional(),
}).strict();

// GET BEDS
router.get(
    "/beds",
    auth,
    validate(bedQuerySchema, "query"),
    async (req, res, next) => {
        try {
            const { hostelId } = req.validatedQuery;

            const filter = {};

            if (hostelId) {
                let hostel;

                // Support MongoDB ObjectId.
                if (mongoose.isValidObjectId(hostelId)) {
                    hostel = await Hostel.findById(hostelId);
                } else {
                    // Frontend sends A, B, C, D, E or F.
                    // Database stores Hostel A, Hostel B, etc.
                    const hostelCode = hostelId
                        .replace(/^Hostel\s+/i, "")
                        .trim()
                        .toUpperCase();

                    hostel = await Hostel.findOne({
                        name: `Hostel ${hostelCode}`,
                    });
                }

                if (!hostel) {
                    return res.status(404).json({
                        success: false,
                        message: "Hostel not found.",
                    });
                }

                filter.hostelId = hostel._id;
            }

            const beds = await Bed.find(filter)
                .populate("hostelId", "name type")
                .populate("roomId", "roomNumber floor capacity");

            return res.status(200).json({
                success: true,
                count: beds.length,
                data: beds,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;