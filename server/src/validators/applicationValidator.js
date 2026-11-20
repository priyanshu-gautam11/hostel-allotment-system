import { z } from "zod";

const semesterSchema = z.preprocess(
    (value) => value === "" ? undefined : value,
    z.coerce.number({ error: "Semester is required." })
        .min(1, "Semester must be at least 1.")
        .max(8, "Semester cannot exceed 8.")
        .int("Semester must be a whole number.")
);

const cgpaSchema = z.preprocess(
    (value) => value === "" ? undefined : value,
    z.coerce.number({ error: "CGPA is required." })
        .min(0, "CGPA cannot be negative.")
        .max(10, "CGPA cannot exceed 10.")
);

const distanceSchema = z.preprocess(
    (value) => value === "" ? undefined : value,
    z.coerce.number({ error: "Distance is required." })
        .min(0, "Distance cannot be negative.")
);

export const applicationSchema = z.object({
    fullName: z.string()
        .trim()
        .min(3, "Name must contain at least 3 characters."),

    rollNo: z.string()
        .trim()
        .min(1, "Roll number is required."),

    course: z.string()
        .trim()
        .min(1, "Course is required."),

    semester: semesterSchema,

    cgpa: cgpaSchema,

    distanceKm: distanceSchema,

    preference: z.enum(
        ["single-only", "single-preferred", "triple"],
        {
            error: "Please select a room preference.",
        }
    ),

    isPhysicallyDisabled: z.preprocess(
        (val) => val === "true" || val === true || val === 1 || val === "1",
        z.boolean()
    ).default(false),
}).strict();

// Admin verification schema
export const verifyApplicationSchema = z.object({
    verifiedCgpa: z.coerce.number({ error: "Verified CGPA is required." })
        .min(0, "Verified CGPA cannot be negative.")
        .max(10, "Verified CGPA cannot exceed 10."),
}).strict();