import mongoose from "mongoose";
import Application from "../models/Application.js";
import Bed from "../models/Bed.js";
import Hostel from "../models/Hostel.js";
import User from "../models/User.js";
import WaitlistEntry from "../models/WaitlistEntry.js";
import AuditLog from "../models/AuditLog.js";
import Allotment from "../models/Allotment.js";
import { env } from "../config/env.js";

// 1. REAL ADMIN DASHBOARD STATISTICS
export const getAdminStats = async (req, res, next) => {
    try {
        const [
            totalApplications,
            verified,
            pending,
            rejected,
            allotted,
            waitlisted,
            totalBeds,
            freeBeds,
            occupiedBeds,
            offeredBeds,
            blockedBeds,
            waitlistCount,
            totalHostels,
        ] = await Promise.all([
            Application.countDocuments(),
            Application.countDocuments({ status: "verified" }),
            Application.countDocuments({ status: "submitted" }),
            Application.countDocuments({ status: "rejected" }),
            Application.countDocuments({ status: "allotted" }),
            Application.countDocuments({ status: "waitlisted" }),
            Bed.countDocuments(),
            Bed.countDocuments({ status: "available" }),
            Bed.countDocuments({ status: "occupied" }),
            Bed.countDocuments({ status: "offered" }),
            Bed.countDocuments({ status: "blocked" }),
            WaitlistEntry.countDocuments({ status: "waiting" }),
            Hostel.countDocuments(),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalApplications,
                verified,
                pending,
                rejected,
                allotted,
                waitlisted,
                totalBeds,
                freeBeds,
                occupiedBeds,
                offeredBeds,
                blockedBeds,
                waitlistCount,
                totalHostels,
            },
        });
    } catch (error) {
        next(error);
    }
};

// 2. FETCH OCCUPIED BEDS FOR VACANCY MANAGEMENT
export const getOccupiedBeds = async (req, res, next) => {
    try {
        const beds = await Bed.find({ status: "occupied" })
            .populate("hostelId", "name type fillOrder")
            .populate("roomId", "roomNumber floor capacity")
            .populate("currentStudentId", "name email rollNo course semester");

        const formattedBeds = beds.map((bed) => ({
            bedId: String(bed._id),
            hostelId: String(bed.hostelId?._id || bed.hostelId),
            hostelName: bed.hostelId?.name || "Hostel",
            hostelType: bed.hostelId?.type || "single",
            roomNumber: bed.roomId?.roomNumber || "N/A",
            floor: bed.roomId?.floor ?? 0,
            bedNumber: bed.bedNumber,
            studentId: bed.currentStudentId?._id ? String(bed.currentStudentId._id) : null,
            studentName: bed.currentStudentId?.name || "Unknown Student",
            studentEmail: bed.currentStudentId?.email || "",
            rollNo: bed.currentStudentId?.rollNo || "",
            status: bed.status,
            updatedAt: bed.updatedAt,
        }));

        return res.status(200).json({
            success: true,
            count: formattedBeds.length,
            data: formattedBeds,
        });
    } catch (error) {
        next(error);
    }
};

// 3. FETCH WAITLIST ENTRIES
export const getWaitlist = async (req, res, next) => {
    try {
        const entries = await WaitlistEntry.find({ status: "waiting" })
            .populate("studentId", "name email rollNo course semester isPhysicallyDisabled")
            .populate("applicationId", "claimedCgpa verifiedCgpa preferences isPhysicallyDisabled")
            .sort({ pool: 1, rank: 1 });

        const formatted = entries.map((entry) => ({
            id: String(entry._id),
            studentId: String(entry.studentId?._id || entry.studentId),
            studentName: entry.studentId?.name || "Unknown",
            studentEmail: entry.studentId?.email || "",
            rollNo: entry.studentId?.rollNo || "",
            course: entry.studentId?.course || "",
            semester: entry.studentId?.semester || "",
            pool: entry.pool,
            rank: entry.rank,
            score: entry.score,
            status: entry.status,
            isPhysicallyDisabled: Boolean(
                entry.studentId?.isPhysicallyDisabled ||
                entry.applicationId?.isPhysicallyDisabled
            ),
            createdAt: entry.createdAt,
        }));

        return res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted,
        });
    } catch (error) {
        next(error);
    }
};

// 4. MANUAL WAITLIST PROMOTION
export const promoteWaitlistEntry = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid waitlist entry ID.",
            });
        }

        const entry = await WaitlistEntry.findById(id)
            .populate("studentId")
            .populate("applicationId");

        if (!entry || entry.status !== "waiting") {
            return res.status(404).json({
                success: false,
                message: "Active waitlist entry not found.",
            });
        }

        // Find hostels for this pool
        const matchingHostels = await Hostel.find({
            type: entry.pool,
            active: true,
        }).sort({ fillOrder: 1 });

        const hostelIds = matchingHostels.map((h) => h._id);

        const isPhysicallyDisabled = Boolean(
            entry.studentId?.isPhysicallyDisabled ||
            entry.applicationId?.isPhysicallyDisabled
        );

        // Find available bed
        const availableBeds = await Bed.find({
            hostelId: { $in: hostelIds },
            status: "available",
        }).populate("roomId");

        // If physically disabled, must be floor 0
        const eligibleBed = availableBeds.find((bed) => {
            if (isPhysicallyDisabled) {
                return (bed.roomId?.floor ?? 0) === 0;
            }
            return true;
        });

        if (!eligibleBed) {
            return res.status(409).json({
                success: false,
                message: isPhysicallyDisabled
                    ? "No ground-floor bed is currently available in the " + entry.pool + " pool."
                    : "No bed is currently available in the " + entry.pool + " pool.",
            });
        }

        // Atomically claim bed
        const claimedBed = await Bed.findOneAndUpdate(
            { _id: eligibleBed._id, status: "available" },
            {
                $set: {
                    status: "offered",
                    currentStudentId: entry.studentId._id,
                },
            },
            { returnDocument: "after"}
        );

        if (!claimedBed) {
            return res.status(409).json({
                success: false,
                message: "Bed was just claimed by another action. Please try again.",
            });
        }

        const now = new Date();
        const respondBy = new Date(
            now.getTime() + env.OFFER_WINDOW_HOURS * 60 * 60 * 1000
        );

        const allotment = await Allotment.create({
            studentId: entry.studentId._id,
            bedId: claimedBed._id,
            status: "offered",
            offeredAt: now,
            respondBy,
        });

        entry.status = "offered";
        await entry.save();

        await Application.findByIdAndUpdate(entry.applicationId._id, {
            $set: { status: "allotted" },
        });

        await AuditLog.create({
            actorId: req.user.id,
            actorType: "user",
            action: "WAITLIST_STUDENT_PROMOTED",
            entityType: "Allotment",
            entityId: allotment._id,
            after: {
                studentId: entry.studentId._id,
                bedId: claimedBed._id,
                pool: entry.pool,
                waitlistEntryId: entry._id,
            },
        });

        return res.status(200).json({
            success: true,
            message: `Student ${entry.studentId.name} promoted successfully.`,
            data: {
                allotmentId: allotment._id,
                studentId: entry.studentId._id,
                studentName: entry.studentId.name,
                bedId: claimedBed._id,
                pool: entry.pool,
                respondBy,
            },
        });
    } catch (error) {
        next(error);
    }
};

// 5. AUDIT HISTORY
export const getAuditLogs = async (req, res, next) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 100, 200);
        const page = Math.max(Number(req.query.page) || 1, 1);
        const skip = (page - 1) * limit;

        const [total, logs] = await Promise.all([
            AuditLog.countDocuments(),
            AuditLog.find()
                .populate("actorId", "name email role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);

        const formatted = logs.map((log) => ({
            id: String(log._id),
            actorId: log.actorId?._id ? String(log.actorId._id) : null,
            actorName: log.actorId?.name || (log.actorType === "system" ? "System" : "Admin"),
            actorEmail: log.actorId?.email || "",
            actorType: log.actorType,
            action: log.action,
            entityType: log.entityType,
            entityId: String(log.entityId),
            before: log.before,
            after: log.after,
            createdAt: log.createdAt,
        }));

        return res.status(200).json({
            success: true,
            total,
            page,
            limit,
            data: formatted,
        });
    } catch (error) {
        next(error);
    }
};
