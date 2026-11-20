import Bed from "../models/Bed.js";
import Allotment from "../models/Allotment.js";
import WaitlistEntry from "../models/WaitlistEntry.js";
import Application from "../models/Application.js";
import AuditLog from "../models/AuditLog.js";

import { env } from "../config/env.js";
import { runPreview } from "./allotmentService.js";

export async function publishAllotment(adminId) {
    // Generate fresh allocation preview.
    const rows = await runPreview();

    const result = {
        allotted: [],
        waitlisted: [],
        skipped: [],
    };

    const now = new Date();

    const respondBy = new Date(
        now.getTime() +
            env.OFFER_WINDOW_HOURS * 60 * 60 * 1000
    );

    // Get existing maximum waitlist ranks.
    const maxSingle = await WaitlistEntry.findOne({
        pool: "single",
        status: "waiting",
    }).sort({ rank: -1 });

    const maxTriple = await WaitlistEntry.findOne({
        pool: "triple",
        status: "waiting",
    }).sort({ rank: -1 });

    const ranks = {
        single: maxSingle?.rank || 0,
        triple: maxTriple?.rank || 0,
    };

    // Process every preview result.
    for (const row of rows) {
        if (row.outcome === "allotted") {
            let bed = null;
            let createdAllotment = null;
            let applicationUpdated = false;

            try {
                // 1. Revalidate actual bed and room.
                const candidateBed = await Bed.findById(row.bedId)
                    .populate("roomId", "floor")
                    .lean();

                if (!candidateBed || !candidateBed.roomId) {
                    throw new Error(
                        "Bed or room record not found"
                    );
                }

                const actualFloor = candidateBed.roomId.floor;

                // 2. Enforce ground-floor requirement.
                if (
                    row.isPhysicallyDisabled &&
                    (
                        actualFloor === undefined ||
                        actualFloor === null ||
                        Number(actualFloor) !== 0
                    )
                ) {
                    throw new Error(
                        "Accessibility violation: ground-floor room required"
                    );
                }

                // 3. Ensure room floor has not changed.
                if (
                    actualFloor === undefined ||
                    actualFloor === null ||
                    Number(actualFloor) !== Number(row.floor)
                ) {
                    throw new Error(
                        "Room floor changed after preview"
                    );
                }

                // 4. Atomically claim the bed.
                bed = await Bed.findOneAndUpdate(
                    {
                        _id: row.bedId,
                        status: "available",
                    },
                    {
                        $set: {
                            status: "offered",
                            currentStudentId: row.studentId,
                        },
                    },
                    {
                        returnDocument: "after",
                    }
                );

                if (!bed) {
                    throw new Error(
                        "Bed is no longer available"
                    );
                }

                // 5. Create student offer.
                createdAllotment = await Allotment.create({
                    studentId: row.studentId,
                    bedId: row.bedId,
                    status: "offered",
                    offeredAt: now,
                    respondBy,
                });

                // 6. Update application status.
                const updatedApplication =
                    await Application.findOneAndUpdate(
                        {
                            _id: row.applicationId,
                            status: "verified",
                        },
                        {
                            $set: {
                                status: "allotted",
                            },
                        },
                        {
                            returnDocument: "after",
                        }
                    );

                if (!updatedApplication) {
                    throw new Error(
                        "Application is no longer verified"
                    );
                }

                applicationUpdated = true;

                // 7. Record successful allotment.
                result.allotted.push({
                    studentId: row.studentId,
                    allotmentId: createdAllotment._id,
                    bedId: row.bedId,
                    respondBy,
                });

            } catch (error) {
                // Compensation: remove newly created offer.
                if (createdAllotment) {
                    await Allotment.deleteOne({
                        _id: createdAllotment._id,
                        status: "offered",
                    });
                }

                // Restore application if it was updated.
                if (applicationUpdated) {
                    await Application.findOneAndUpdate(
                        {
                            _id: row.applicationId,
                            status: "allotted",
                        },
                        {
                            $set: {
                                status: "verified",
                            },
                        }
                    );
                }

                // Release only the bed claimed by this student.
                if (bed) {
                    await Bed.findOneAndUpdate(
                        {
                            _id: row.bedId,
                            status: "offered",
                            currentStudentId: row.studentId,
                        },
                        {
                            $set: {
                                status: "available",
                                currentStudentId: null,
                            },
                        }
                    );
                }

                result.skipped.push({
                    studentId: row.studentId,
                    reason: error.message,
                });
            }

        } else {
            // WAITLIST PROCESSING.
            const pool = row.pool || "single";

            if (!Object.hasOwn(ranks, pool)) {
                result.skipped.push({
                    studentId: row.studentId,
                    reason: "Invalid waitlist pool",
                });

                continue;
            }

            ranks[pool] += 1;

            let entry = null;

            try {
                // 1. Create waitlist entry.
                entry = await WaitlistEntry.create({
                    studentId: row.studentId,
                    applicationId: row.applicationId,
                    pool,
                    score:
                        typeof row.score === "object"
                            ? row.score.total
                            : row.score,
                    rank: ranks[pool],
                    status: "waiting",
                });

                // 2. Update application.
                const updatedApplication =
                    await Application.findOneAndUpdate(
                        {
                            _id: row.applicationId,
                            status: "verified",
                        },
                        {
                            $set: {
                                status: "waitlisted",
                            },
                        },
                        {
                            returnDocument: "after",
                        }
                    );

                if (!updatedApplication) {
                    throw new Error(
                        "Application is no longer verified"
                    );
                }

                result.waitlisted.push({
                    studentId: row.studentId,
                    waitlistEntryId: entry._id,
                    pool,
                    rank: entry.rank,
                });

            } catch (error) {
                // Remove entry if application update failed.
                if (entry) {
                    await WaitlistEntry.deleteOne({
                        _id: entry._id,
                        status: "waiting",
                    });
                }

                ranks[pool] -= 1;

                result.skipped.push({
                    studentId: row.studentId,
                    reason: error.message,
                });
            }
        }
    }

    // Record publishing audit event.
    await AuditLog.create({
        actorId: adminId,
        action: "ALLOTMENT_PUBLISHED",
        entityType: "Allotment",
        entityId:
            result.allotted[0]?.allotmentId || adminId,
        after: {
            allotted: result.allotted.length,
            waitlisted: result.waitlisted.length,
            skipped: result.skipped.length,
        },
    });

    return result;
}