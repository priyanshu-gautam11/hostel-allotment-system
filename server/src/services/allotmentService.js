import Application from "../models/Application.js";
import Bed from "../models/Bed.js";
import Hostel from "../models/Hostel.js";
import Allotment from "../models/Allotment.js";

import { calculateScore } from "./scoringService.js";

// A room is considered ground floor ONLY when its floor is explicitly 0.
function isGroundFloor(bed) {
    const floor = bed.roomId?.floor;

    return (
        floor !== undefined &&
        floor !== null &&
        Number(floor) === 0
    );
}

export async function runPreview() {
    // 1. Load verified applications and student profile details.
    const applications = await Application.find({
        status: "verified",
    })
        .populate({
            path: "studentId",
            select: "name email rollNo semester distanceKm previousHostel isPhysicallyDisabled",
        })
        .lean();

    // 2. Find students and beds with existing active allotments.
    const activeAllotments = await Allotment.find({
        status: { $in: ["offered", "accepted"] },
    })
        .select("studentId bedId")
        .lean();

    const activeStudentIds = new Set(
        activeAllotments.map((a) => String(a.studentId))
    );

    const activeBedIds = new Set(
        activeAllotments.map((a) => String(a.bedId))
    );

    // 3. Exclude students who already have active allotments.
    const eligibleApplications = applications.filter(
        (app) =>
            !activeStudentIds.has(
                String(app.studentId?._id || app.studentId)
            )
    );

    // 4. Calculate student scores and accessibility requirements.
    const rankedApplications = eligibleApplications.map((application) => {
        const student = application.studentId;

        if (!student) {
            throw new Error(
                `Student not found for application ${application._id}`
            );
        }

        const score = calculateScore({
            verifiedCgpa: application.verifiedCgpa,
            semester: student.semester,
            distanceKm: student.distanceKm,
            previousHostel: student.previousHostel,
        });

        const isPhysicallyDisabled = Boolean(
            application.isPhysicallyDisabled ||
            student.isPhysicallyDisabled
        );

        return {
            application,
            student,
            score,
            isPhysicallyDisabled,
        };
    });

    // 5. Sort students by allocation priority.
    rankedApplications.sort((a, b) => {
        return (
            b.score.total - a.score.total ||
            (b.application.verifiedCgpa ?? 0) -
                (a.application.verifiedCgpa ?? 0) ||
            (b.application.claimedCgpa ?? 0) -
                (a.application.claimedCgpa ?? 0) ||
            (b.student.distanceKm ?? 0) -
                (a.student.distanceKm ?? 0) ||
            new Date(a.application.createdAt).getTime() -
                new Date(b.application.createdAt).getTime()
        );
    });

    // 6. Load active hostels in configured fill order.
    // Single-seater hostels first, followed by triple-seater hostel.
    const hostels = await Hostel.find({ active: true })
        .sort({ fillOrder: 1 })
        .lean();

    const hostelMap = new Map(
        hostels.map((hostel) => [
            String(hostel._id),
            hostel,
        ])
    );

    // 7. Group hostels according to their type.
    const hostelIdsByType = {
        single: new Set(
            hostels
                .filter((hostel) => hostel.type === "single")
                .map((hostel) => String(hostel._id))
        ),

        triple: new Set(
            hostels
                .filter((hostel) => hostel.type === "triple")
                .map((hostel) => String(hostel._id))
        ),
    };

    // 8. Load available beds with their room information.
    const beds = await Bed.find({
        status: "available",
    })
        .populate({
            path: "roomId",
            select: "roomNumber floor capacity",
        })
        .lean();

    // 9. Exclude beds that are already allocated or have invalid room data.
    // Unknown floor information must NEVER be treated as ground floor.
    const unallocatedBeds = beds.filter((bed) => {
        if (activeBedIds.has(String(bed._id))) return false;

        if (!bed.roomId) return false;

        if (
            bed.roomId.floor === undefined ||
            bed.roomId.floor === null ||
            !Number.isFinite(Number(bed.roomId.floor))
        ) {
            return false;
        }

        return true;
    });

    // 10. Sort beds according to hostel fill order and room location.
    unallocatedBeds.sort((a, b) => {
        const hostelA = hostelMap.get(String(a.hostelId));
        const hostelB = hostelMap.get(String(b.hostelId));

        return (
            (hostelA?.fillOrder ?? Infinity) -
                (hostelB?.fillOrder ?? Infinity) ||
            Number(a.roomId.floor) - Number(b.roomId.floor) ||
            (a.roomId.roomNumber ?? Infinity) -
                (b.roomId.roomNumber ?? Infinity) ||
            a.bedNumber - b.bedNumber
        );
    });

    // 11. Simulate allocation without changing database records.
    const assignedBedIds = new Set();
    const rows = [];

    for (const item of rankedApplications) {
        const {
            application,
            student,
            score,
            isPhysicallyDisabled,
        } = item;

        const preferences = application.preferences ?? [];

        let selectedBed = null;

        // 12. Match available beds against student preferences.
        for (const preference of preferences) {
            const matchingHostelIds =
                hostelIdsByType[preference.hostelType];

            if (!matchingHostelIds) continue;

            selectedBed = unallocatedBeds.find((bed) => {
                // Hostel type must match the preference.
                if (
                    !matchingHostelIds.has(String(bed.hostelId))
                ) {
                    return false;
                }

                // A bed can only be assigned once in this preview.
                if (assignedBedIds.has(String(bed._id))) {
                    return false;
                }

                // HARD ACCESSIBILITY CONSTRAINT:
                // Physically disabled students can ONLY receive
                // explicitly verified ground-floor rooms.
                if (isPhysicallyDisabled) {
                    return isGroundFloor(bed);
                }

                return true;
            });

            if (selectedBed) break;
        }

        // 13. Record successful allocation.
        if (selectedBed) {
            assignedBedIds.add(String(selectedBed._id));

            const selectedHostel = hostelMap.get(
                String(selectedBed.hostelId)
            );

            rows.push({
                applicationId: String(application._id),
                studentId: String(student._id),

                studentName: student.name || "Unknown Student",
                studentEmail: student.email || "",
                rollNo: student.rollNo || "",

                score: score.total,
                scoreBreakdown: score.breakdown,

                hostelId: String(selectedBed.hostelId),
                hostelName: selectedHostel?.name || "Hostel",

                bedId: String(selectedBed._id),
                bedNumber: selectedBed.bedNumber,

                roomNumber: selectedBed.roomId.roomNumber,
                floor: Number(selectedBed.roomId.floor),

                pool: selectedHostel?.type || "single",

                isPhysicallyDisabled,

                outcome: "allotted",
            });
        } else {
            // 14. No suitable bed: student remains waitlisted.
            rows.push({
                applicationId: String(application._id),
                studentId: String(student._id),

                studentName: student.name || "Unknown Student",
                studentEmail: student.email || "",
                rollNo: student.rollNo || "",

                score: score.total,
                scoreBreakdown: score.breakdown,

                hostelId: null,
                hostelName: "-",

                bedId: null,
                bedNumber: null,

                roomNumber: null,
                floor: null,

                pool: preferences[0]?.hostelType || "single",

                isPhysicallyDisabled,

                outcome: "waitlisted",
            });
        }
    }

    return rows;
}