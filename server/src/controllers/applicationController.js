import path from "node:path";
import fs from "node:fs";
import mongoose from "mongoose";

import User from "../models/User.js";
import Application from "../models/Application.js";
import AuditLog from "../models/AuditLog.js";

// Convert frontend preference into backend format.
const convertPreference = (preference) => {
    const preferenceMap = {
        "single-only": [
            { hostelType: "single", mode: "only" },
        ],

        "single-preferred": [
            { hostelType: "single", mode: "preferred" },
            { hostelType: "triple", mode: "preferred" },
        ],

        triple: [
            { hostelType: "triple", mode: "only" },
        ],
    };

    return preferenceMap[preference] || null;
};

// Safely parse multipart boolean values.
const parseBoolean = (value) => {
    if (value === true || value === "true" || value === "1") return true;
    if (value === false || value === "false" || value === "0") return false;
    return null;
};

// Safely remove an uploaded file.
const removeUploadedFile = (file) => {
    if (file?.path && fs.existsSync(file.path)) {
        try {
            fs.unlinkSync(file.path);
        } catch (error) {
            console.error("Uploaded file cleanup failed:", error.message);
        }
    }
};

// SUBMIT APPLICATION
export const submitApplication = async (req, res, next) => {
    let createdApplication = null;

    try {
        const {
            fullName,
            rollNo,
            course,
            semester,
            cgpa,
            distanceKm,
            preference,
            isPhysicallyDisabled,
        } = req.body;

        // Validate required fields.
        if (
            typeof fullName !== "string" || !fullName.trim() ||
            typeof rollNo !== "string" || !rollNo.trim() ||
            typeof course !== "string" || !course.trim() ||
            semester === undefined ||
            cgpa === undefined ||
            distanceKm === undefined ||
            !preference
        ) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "All required application fields must be provided.",
            });
        }

        // Marksheet is mandatory.
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Marksheet is required.",
            });
        }

        // Validate uploaded file.
        const allowedMimeTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
        ];

        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "Only PDF, JPG and PNG files are allowed.",
            });
        }

        if (req.file.size > 2 * 1024 * 1024) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "File size cannot exceed 2 MB.",
            });
        }

        // Validate numeric fields.
        const numericSemester = Number(semester);
        const numericCgpa = Number(cgpa);
        const numericDistance = Number(distanceKm);

        if (
            !Number.isInteger(numericSemester) ||
            numericSemester < 1 ||
            numericSemester > 8
        ) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "Semester must be between 1 and 8.",
            });
        }

        if (
            !Number.isFinite(numericCgpa) ||
            numericCgpa < 0 ||
            numericCgpa > 10
        ) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "CGPA must be between 0 and 10.",
            });
        }

        if (
            !Number.isFinite(numericDistance) ||
            numericDistance < 0
        ) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "Distance must be a valid non-negative number.",
            });
        }

        // Validate disability status.
        const disabilityStatus = parseBoolean(isPhysicallyDisabled);

        if (disabilityStatus === null) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "Invalid physical disability value.",
            });
        }

        // Validate hostel preference.
        const preferences = convertPreference(preference);

        if (!preferences) {
            removeUploadedFile(req.file);

            return res.status(400).json({
                success: false,
                message: "Invalid hostel preference.",
            });
        }

        // Find student.
        const student = await User.findById(req.user.id);

        if (!student) {
            removeUploadedFile(req.file);

            return res.status(404).json({
                success: false,
                message: "Student account not found.",
            });
        }

        // Prevent duplicate applications.
        const existingApplication = await Application.findOne({
            studentId: student._id,
        });

        if (existingApplication) {
            removeUploadedFile(req.file);

            return res.status(409).json({
                success: false,
                message: "You have already submitted an application.",
            });
        }

        // Prepare marksheet details.
        const marksheet =
            req.file.filename ||
            path.basename(req.file.originalname);

        const marksheetOriginalName =
            req.file.originalname || marksheet;

        // Create application.
        createdApplication = await Application.create({
            studentId: student._id,
            claimedCgpa: numericCgpa,
            verifiedCgpa: null,
            preferences,
            status: "submitted",
            marksheet,
            marksheetOriginalName,
            isPhysicallyDisabled: disabilityStatus,
        });

        // Update student profile.
        student.name = fullName.trim();
        student.rollNo = rollNo.trim();
        student.course = course.trim();
        student.semester = numericSemester;
        student.distanceKm = numericDistance;
        student.isPhysicallyDisabled = disabilityStatus;

        await student.save();

        // Record submission in audit log.
        await AuditLog.create({
            actorId: student._id,
            action: "APPLICATION_SUBMITTED",
            entityType: "Application",
            entityId: createdApplication._id,
            before: null,
            after: {
                status: createdApplication.status,
                claimedCgpa: createdApplication.claimedCgpa,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully.",
            data: {
                id: createdApplication._id,
                studentName: student.name,
                rollNo: student.rollNo,
                course: student.course,
                semester: student.semester,
                distanceKm: student.distanceKm,
                claimedCgpa: createdApplication.claimedCgpa,
                verifiedCgpa: createdApplication.verifiedCgpa,
                preferences: createdApplication.preferences,
                status: createdApplication.status,
                marksheet: createdApplication.marksheet,
                marksheetOriginalName:
                    createdApplication.marksheetOriginalName,
                isPhysicallyDisabled:
                    createdApplication.isPhysicallyDisabled,
            },
        });
    } catch (error) {
        // Clean up only the application created by this request.
        if (createdApplication) {
            await Application.deleteOne({
                _id: createdApplication._id,
                status: "submitted",
            }).catch(() => {});
        }

        removeUploadedFile(req.file);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An application or profile with this unique identifier already exists.",
            });
        }

        next(error);
    }
};

// GET LOGGED-IN STUDENT APPLICATION
export const getMyApplication = async (req, res, next) => {
    try {
        const application = await Application.findOne({
            studentId: req.user.id,
        }).populate(
            "studentId",
            "name email rollNo course semester distanceKm isPhysicallyDisabled"
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "No application found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

// ADMIN: LIST ALL APPLICATIONS
export const listApplications = async (req, res, next) => {
    try {
        const applications = await Application.find()
            .populate(
                "studentId",
                "name email rollNo course semester distanceKm isPhysicallyDisabled"
            )
            .sort({ createdAt: -1 });

        const formattedApplications = applications.map((application) => ({
            id: application._id,
            studentName: application.studentId?.name || "Unknown",
            studentEmail: application.studentId?.email || "",
            rollNo: application.studentId?.rollNo || "",
            claimedCgpa: application.claimedCgpa,
            verifiedCgpa: application.verifiedCgpa,
            preferences: application.preferences,
            status: application.status,
            marksheet: application.marksheet,
            marksheetOriginalName:
                application.marksheetOriginalName || application.marksheet,
            isPhysicallyDisabled:
                application.isPhysicallyDisabled ||
                application.studentId?.isPhysicallyDisabled ||
                false,
            createdAt: application.createdAt,
            course: application.studentId?.course || "",
            semester: application.studentId?.semester || "",
            distanceKm: application.studentId?.distanceKm ?? null,
        }));

        return res.status(200).json({
            success: true,
            count: formattedApplications.length,
            data: formattedApplications,
        });
    } catch (error) {
        next(error);
    }
};

// SECURE MARKSHEET ACCESS
export const getMarksheet = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID.",
            });
        }

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found.",
            });
        }

        // Only admin or application owner can access marksheet.
        if (
            req.user.role !== "admin" &&
            application.studentId.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only view your own marksheet.",
            });
        }

        if (!application.marksheet) {
            return res.status(404).json({
                success: false,
                message: "No marksheet uploaded for this application.",
            });
        }

        const uploadDirectory = path.resolve("uploads/marksheets");
        const filePath = path.resolve(uploadDirectory, application.marksheet);

        // Prevent path traversal.
        if (!filePath.startsWith(uploadDirectory + path.sep)) {
            return res.status(400).json({
                success: false,
                message: "Invalid marksheet path.",
            });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "Marksheet file was not found on server storage.",
            });
        }

        return res.sendFile(filePath);
    } catch (error) {
        next(error);
    }
};

// HELPER: RECORD FAILED BUSINESS ACTION
const recordFailedAction = async ({
    actorId,
    action,
    application,
}) => {
    await AuditLog.create({
        actorId,
        action,
        entityType: "Application",
        entityId: application._id,
        before: {
            status: application.status,
            verifiedCgpa: application.verifiedCgpa,
        },
        after: {
            status: application.status,
            verifiedCgpa: application.verifiedCgpa,
        },
    });
};

// ADMIN: VERIFY APPLICATION
export const verifyApplication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const verifiedCgpa = Number(req.body.verifiedCgpa);

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID.",
            });
        }

        if (
            req.body.verifiedCgpa === undefined ||
            !Number.isFinite(verifiedCgpa) ||
            verifiedCgpa < 0 ||
            verifiedCgpa > 10
        ) {
            return res.status(400).json({
                success: false,
                message: "Verified CGPA must be between 0 and 10.",
            });
        }

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found.",
            });
        }

        if (application.status !== "submitted") {
            await recordFailedAction({
                actorId: req.user.id,
                action: "APPLICATION_VERIFY_DENIED",
                application,
            });

            return res.status(409).json({
                success: false,
                message: "Only submitted applications can be verified.",
            });
        }

        const before = {
            status: application.status,
            verifiedCgpa: application.verifiedCgpa,
        };

        const updatedApplication = await Application.findOneAndUpdate(
            {
                _id: id,
                status: "submitted",
            },
            {
                $set: {
                    status: "verified",
                    verifiedCgpa,
                },
            },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!updatedApplication) {
            return res.status(409).json({
                success: false,
                message: "Application has already been processed.",
            });
        }

        try {
            await AuditLog.create({
                actorId: req.user.id,
                action: "APPLICATION_VERIFIED",
                entityType: "Application",
                entityId: application._id,
                before,
                after: {
                    status: "verified",
                    verifiedCgpa,
                },
            });
        } catch (auditError) {
            await Application.updateOne(
                {
                    _id: id,
                    status: "verified",
                    verifiedCgpa,
                },
                {
                    $set: {
                        status: before.status,
                        verifiedCgpa: before.verifiedCgpa,
                    },
                }
            );

            throw auditError;
        }

        return res.status(200).json({
            success: true,
            message: "Application verified successfully.",
            data: updatedApplication,
        });
    } catch (error) {
        next(error);
    }
};

// ADMIN: REJECT APPLICATION
export const rejectApplication = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID.",
            });
        }

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found.",
            });
        }

        if (application.status !== "submitted") {
            await recordFailedAction({
                actorId: req.user.id,
                action: "APPLICATION_REJECT_DENIED",
                application,
            });

            return res.status(409).json({
                success: false,
                message: "Only submitted applications can be rejected.",
            });
        }

        const before = {
            status: application.status,
            verifiedCgpa: application.verifiedCgpa,
        };

        const updatedApplication = await Application.findOneAndUpdate(
            {
                _id: id,
                status: "submitted",
            },
            {
                $set: {
                    status: "rejected",
                },
            },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!updatedApplication) {
            return res.status(409).json({
                success: false,
                message: "Application has already been processed.",
            });
        }

        try {
            await AuditLog.create({
                actorId: req.user.id,
                action: "APPLICATION_REJECTED",
                entityType: "Application",
                entityId: application._id,
                before,
                after: {
                    status: updatedApplication.status,
                    verifiedCgpa: updatedApplication.verifiedCgpa,
                },
            });
        } catch (auditError) {
            await Application.updateOne(
                {
                    _id: id,
                    status: "rejected",
                },
                {
                    $set: {
                        status: before.status,
                        verifiedCgpa: before.verifiedCgpa,
                    },
                }
            );

            throw auditError;
        }

        return res.status(200).json({
            success: true,
            message: "Application rejected successfully.",
            data: updatedApplication,
        });
    } catch (error) {
        next(error);
    }
};