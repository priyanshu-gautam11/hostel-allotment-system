import Allotment from "../models/Allotment.js";
import Bed from "../models/Bed.js";
import Hostel from "../models/Hostel.js";
import WaitlistEntry from "../models/WaitlistEntry.js";
import Application from "../models/Application.js";
import AuditLog from "../models/AuditLog.js";
import { env } from "../config/env.js";

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// Promote the next eligible student from the same hostel pool.
export async function promoteNextStudent(
    bedId,
    pool,
    adminId = null
) {
    const bed = await Bed.findById(bedId);

    if (!bed || bed.status !== "available") {
        return null;
    }

    const entries = await WaitlistEntry.find({
        pool,
        status: "waiting",
    }).sort({ rank: 1, score: -1 });

    for (const entry of entries) {
        let claimedBed = null;
        let allotment = null;
        let applicationUpdated = false;
        let waitlistUpdated = false;

        try {
            // Atomically reserve the available bed.
            claimedBed = await Bed.findOneAndUpdate(
                {
                    _id: bedId,
                    status: "available",
                },
                {
                    $set: {
                        status: "offered",
                        currentStudentId: entry.studentId,
                    },
                },
                { returnDocument: "after" }
            );

            if (!claimedBed) {
                return null;
            }

            const now = new Date();

            // Create a new offer.
            allotment = await Allotment.create({
                studentId: entry.studentId,
                bedId,
                status: "offered",
                offeredAt: now,
                respondBy: new Date(
                    now.getTime() +
                    env.OFFER_WINDOW_HOURS * 60 * 60 * 1000
                ),
            });

            // Update application status.
            const updatedApplication =
                await Application.findOneAndUpdate(
                    {
                        _id: entry.applicationId,
                        status: "waitlisted",
                    },
                    {
                        $set: { status: "allotted" },
                    },
                    { returnDocument: "after" }
                );

            if (!updatedApplication) {
                throw new Error(
                    "Application is no longer waitlisted."
                );
            }

            applicationUpdated = true;

            // Atomically update the waitlist entry.
            const updatedEntry = await WaitlistEntry.findOneAndUpdate(
                {
                    _id: entry._id,
                    status: "waiting",
                },
                {
                    $set: { status: "offered" },
                },
                { returnDocument: "after" }
            );

            if (!updatedEntry) {
                throw new Error(
                    "Waitlist entry is no longer available."
                );
            }

            waitlistUpdated = true;

            // Record promotion.
            await AuditLog.create({
                actorId: adminId || null,
                actorType: adminId ? "user" : "system",
                action: "WAITLIST_STUDENT_PROMOTED",
                entityType: "Allotment",
                entityId: allotment._id,
                after: {
                    studentId: entry.studentId,
                    bedId,
                    pool,
                },
            });

            return allotment;

        } catch (error) {
            console.error(
                "Waitlist promotion failed:",
                error.message
            );

            // Restore waitlist entry if promotion failed.
            if (waitlistUpdated) {
                await WaitlistEntry.findOneAndUpdate(
                    {
                        _id: entry._id,
                        status: "offered",
                    },
                    {
                        $set: { status: "waiting" },
                    }
                );
            }

            // Rollback failed allotment creation.
            if (allotment) {
                await Allotment.deleteOne({
                    _id: allotment._id,
                });
            }

            // Release bed reservation.
            if (claimedBed) {
                await Bed.findOneAndUpdate(
                    {
                        _id: bedId,
                        status: "offered",
                        currentStudentId: entry.studentId,
                    },
                    {
                        $set: {
                            status: "available",
                            currentStudentId: null,
                        },
                    }
                );
            }

            // Restore application status.
            if (applicationUpdated) {
                await Application.findOneAndUpdate(
                    {
                        _id: entry.applicationId,
                        status: "allotted",
                    },
                    {
                        $set: { status: "waitlisted" },
                    }
                );
            }

            // Try the next eligible student.
        }
    }

    return null;
}


// Release an expired, declined or cancelled allotment
// and promote the next eligible student.
export async function releaseAndPromote(
    allotment,
    finalStatus,
    fromStatus = "offered",
    actorId = null
) {
    // Change allotment status conditionally.
    const updated = await Allotment.findOneAndUpdate(
        {
            _id: allotment._id,
            status: fromStatus,
        },
        {
            $set: { status: finalStatus },
        },
        { returnDocument: "after" }
    );

    if (!updated) {
        return null;
    }

    // Determine expected current bed status.
    const fromBedStatus =
        fromStatus === "accepted"
            ? "occupied"
            : "offered";

    // Release bed atomically.
    const bed = await Bed.findOneAndUpdate(
        {
            _id: allotment.bedId,
            status: fromBedStatus,
            currentStudentId: allotment.studentId,
        },
        {
            $set: {
                status: "available",
                currentStudentId: null,
            },
        },
        { returnDocument: "after" }
    );

    // Restore allotment if bed release fails.
    if (!bed) {
        await Allotment.findOneAndUpdate(
            {
                _id: allotment._id,
                status: finalStatus,
            },
            {
                $set: { status: fromStatus },
            }
        );

        return null;
    }

    // Remove previous offered waitlist entry.
    const entry = await WaitlistEntry.findOne({
        studentId: allotment.studentId,
        status: "offered",
    });

    if (entry) {
        entry.status = "removed";
        await entry.save();
    }

    // Update previous application.
    await Application.findOneAndUpdate(
        {
            studentId: allotment.studentId,
            status: "allotted",
        },
        {
            $set: { status: "rejected" },
        }
    );

    // Promote next student from the same hostel pool.
    let promoted = null;

    const hostel = await Hostel.findById(bed.hostelId);

    if (hostel) {
        promoted = await promoteNextStudent(
            bed._id,
            hostel.type,
            actorId
        );
    }

    const actionMap = {
        declined: "OFFER_DECLINED",
        expired: "OFFER_EXPIRED",
        cancelled: "BED_RELEASED",
    };

    const isAdminRelease = finalStatus === "cancelled";

    // Record audit event.
    await AuditLog.create({
        actorId: actorId || allotment.studentId,
        actorType: actorId ? "user" : "system",
        action: actionMap[finalStatus],
        entityType: isAdminRelease ? "Bed" : "Allotment",
        entityId: isAdminRelease ? bed._id : allotment._id,
        after: {
            status: finalStatus,
            releasedStudentId: allotment.studentId,
            promotedStudentId: promoted?.studentId || null,
        },
    });

    return {
        updated,
        promoted,
    };
}


// Student views their offer or waitlist position.
export async function getMyOffer(studentId) {
    let offer = await Allotment.findOne({
        studentId,
        status: { $in: ["offered", "accepted"] },
    }).populate({
        path: "bedId",
        populate: [
            { path: "hostelId", select: "name type" },
            { path: "roomId", select: "roomNumber floor capacity" },
        ],
    });

    // Automatically expire overdue offers.
    if (
        offer &&
        offer.status === "offered" &&
        offer.respondBy <= new Date()
    ) {
        await releaseAndPromote(offer, "expired");
        offer = null;
    }

    if (offer) {
        return {
            type: "offer",
            data: offer,
        };
    }

    const waitlist = await WaitlistEntry.findOne({
        studentId,
        status: "waiting",
    });

    return {
        type: waitlist ? "waitlist" : "none",
        data: waitlist,
    };
}


// Student accepts or declines an offer.
export async function respondToOffer(studentId, decision) {
    if (!["accept", "decline"].includes(decision)) {
        throw createError(
            "Decision must be accept or decline."
        );
    }

    const offer = await Allotment.findOne({
        studentId,
        status: "offered",
    });

    if (!offer) {
        throw createError(
            "No active offer found.",
            404
        );
    }

    // Check offer deadline.
    if (offer.respondBy <= new Date()) {
        await releaseAndPromote(offer, "expired");

        throw createError(
            "This offer has expired. The bed has been released.",
            409
        );
    }

    // Decline offer.
    if (decision === "decline") {
        const result = await releaseAndPromote(
            offer,
            "declined"
        );

        if (!result) {
            throw createError(
                "Unable to release this offer. Please refresh and try again.",
                409
            );
        }

        return {
            message: "Offer declined successfully.",
            promotedStudent:
                result.promoted?.studentId || null,
        };
    }

    // Accept offer conditionally.
    const accepted = await Allotment.findOneAndUpdate(
        {
            _id: offer._id,
            status: "offered",
            respondBy: { $gt: new Date() },
        },
        {
            $set: { status: "accepted" },
        },
        { returnDocument: "after" }
    );

    if (!accepted) {
        throw createError(
            "Offer expired or has already been answered.",
            409
        );
    }

    // Confirm bed occupancy.
    const bed = await Bed.findOneAndUpdate(
        {
            _id: offer.bedId,
            status: "offered",
            currentStudentId: studentId,
        },
        {
            $set: { status: "occupied" },
        },
        { returnDocument: "after" }
    );

    if (!bed) {
        // Restore offer if bed confirmation fails.
        await Allotment.findOneAndUpdate(
            {
                _id: accepted._id,
                status: "accepted",
            },
            {
                $set: { status: "offered" },
            }
        );

        throw createError(
            "Bed reservation could not be confirmed.",
            409
        );
    }

    // Mark waitlist entry as promoted.
    await WaitlistEntry.updateOne(
        {
            studentId,
            status: "offered",
        },
        {
            $set: { status: "promoted" },
        }
    );

    // Record acceptance.
    await AuditLog.create({
        actorId: studentId,
        actorType: "user",
        action: "OFFER_ACCEPTED",
        entityType: "Allotment",
        entityId: accepted._id,
        after: {
            status: "accepted",
            bedId: offer.bedId,
        },
    });

    return {
        message: "Offer accepted successfully.",
        allotment: accepted,
    };
}


// Admin expires all overdue offers.
export async function expireOffers() {
    const expiredOffers = await Allotment.find({
        status: "offered",
        respondBy: { $lte: new Date() },
    });

    const results = [];

    for (const offer of expiredOffers) {
        try {
            const result = await releaseAndPromote(
                offer,
                "expired"
            );

            results.push({
                studentId: offer.studentId,
                promoted: Boolean(result?.promoted),
            });

        } catch (error) {
            results.push({
                studentId: offer.studentId,
                error: error.message,
            });
        }
    }

    return results;
}