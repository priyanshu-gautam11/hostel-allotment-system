import Bed from "../models/Bed.js";
import Allotment from "../models/Allotment.js";
import { releaseAndPromote } from "./offerService.js";

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

export async function releaseBed(adminId, bedId) {
    const bed = await Bed.findById(bedId);

    if (!bed) {
        throw createError("Bed not found.", 404);
    }

    if (bed.status !== "occupied") {
        throw createError(
            "Only occupied beds can be released.",
            409
        );
    }

    const allotment = await Allotment.findOne({
        bedId: bed._id,
        status: "accepted",
    });

    if (!allotment) {
        throw createError(
            "No active accepted allotment found.",
            409
        );
    }

    const result = await releaseAndPromote(
        allotment,
        "cancelled",
        "accepted",
        adminId
    );

    if (!result) {
        throw createError(
            "Bed was changed by another request or could not be released.",
            409
        );
    }

    return {
        releasedBedId: String(bed._id),
        promotedStudentId:
            result.promoted?.studentId?.toString() || null,
    };
}