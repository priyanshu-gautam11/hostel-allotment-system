
export function calculateScore(student) {
    const {
        verifiedCgpa,
        semester,
        distanceKm,
        previousHostel,
    } = student;

    // Validate CGPA.
    if (
        verifiedCgpa === null ||
        verifiedCgpa === undefined ||
        !Number.isFinite(Number(verifiedCgpa)) ||
        Number(verifiedCgpa) < 0 ||
        Number(verifiedCgpa) > 10
    ) {
        throw new Error("Verified CGPA must be between 0 and 10.");
    }

    // Validate semester.
    if (
        !Number.isFinite(Number(semester)) ||
        Number(semester) < 1 ||
        Number(semester) > 8
    ) {
        throw new Error("Semester must be between 1 and 8.");
    }

    // CGPA: maximum 40 points.
    const cgpa = Number(
        ((Number(verifiedCgpa) / 10) * 40).toFixed(2)
    );

    // Higher semester receives higher priority.
    const semesterPoints = Number(
        ((Math.min(Number(semester), 8) / 8) * 25).toFixed(2)
    );

    // Distance boundaries:
    // Below 50 km = 0; 50–200 km inclusive = 8; above 200 km = 15.
    let distance = 0;

    if (Number(distanceKm) < 50) {
        distance = 0;
    } else if (Number(distanceKm) <= 200) {
        distance = 8;
    } else {
        distance = 15;
    }

    // Previous hostel: 10 points if true.
    const previousHostelPoints = previousHostel === true ? 10 : 0;

    const total = Number(
        (
            cgpa +
            semesterPoints +
            distance +
            previousHostelPoints
        ).toFixed(2)
    );

    return {
        total,
        breakdown: {
            cgpa,
            semester: semesterPoints,
            distance,
            previousHostel: previousHostelPoints,
        },
    };
}
