import express from "express";

import Hostel from "../models/Hostel.js";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";

import {
    hostelQuerySchema,
} from "../validators/hostelValidator.js";

const router = express.Router();

router.get(
    "/hostels",
    auth,
    validate(hostelQuerySchema, "query"),
    async (req, res, next) => {
        try {
            const { type } = req.validatedQuery;

            const filter = {};

            if (type) {
                filter.type = type;
            }

            const hostels = await Hostel.find(filter).sort({
                fillOrder: 1,
            });

            return res.status(200).json({
                success: true,
                data: hostels,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;