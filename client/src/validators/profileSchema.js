import { z } from "zod";

const allowedFileTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
];

const profileSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(3, "Name must contain at least 3 characters"),

    rollNo: z
        .string()
        .trim()
        .min(1, "Roll number is required"),

    course: z
        .string()
        .trim()
        .min(1, "Course is required"),

    semester: z
        .number({ error: "Semester is required" })
        .min(1, "Semester must be at least 1")
        .max(8, "Semester cannot exceed 8"),

    cgpa: z
        .number({ error: "CGPA is required" })
        .min(0, "CGPA cannot be negative")
        .max(10, "CGPA cannot exceed 10"),

    distanceKm: z
        .number({ error: "Distance is required" })
        .min(0, "Distance cannot be negative"),

    preference: z.enum(
        ["single-only", "single-preferred", "triple"],
        {
            error: "Please select a room preference",
        }
    ),

    isPhysicallyDisabled: z.boolean().default(false),

    marksheet: z
        .instanceof(FileList)
        .refine(
            (files) => files.length === 1,
            "Please upload your marksheet"
        )
        .refine(
            (files) =>
                files.length === 1 &&
                allowedFileTypes.includes(files[0].type),
            "Only PDF, JPG and PNG files are allowed"
        )
        .refine(
            (files) =>
                files.length === 1 &&
                files[0].size <= 2 * 1024 * 1024,
            "File size cannot exceed 2 MB"
        ),
});

export default profileSchema;