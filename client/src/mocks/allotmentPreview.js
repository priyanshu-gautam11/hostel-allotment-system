// Each id matches the corresponding application ID.
// Only verified applications are included.
// Allocation priority: A → B → C → D → E → F.
// Single-seater hostels are filled before triple-seater Hostel F.

export const allotmentPreview = [
    {
        id: 1,
        studentName: "Rahul Sharma",
        score: 95,
        hostelId: "A",
        bedId: "A-1-1",
        outcome: "allotted",
    },
    {
        id: 3,
        studentName: "Priya Singh",
        score: 89,
        hostelId: "A",
        bedId: "A-2-1",
        outcome: "allotted",
    },
    {
        id: 6,
        studentName: "Vikas Yadav",
        score: 78,
        hostelId: "A",
        bedId: "A-3-1",
        outcome: "allotted",
    },
    {
        id: 9,
        studentName: "Sneha Patel",
        score: 75,
        hostelId: null,
        bedId: null,
        outcome: "waitlisted",
    },
];