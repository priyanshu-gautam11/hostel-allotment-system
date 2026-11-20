import { apiRequest } from "./apiClient";

// 1. ADMIN DASHBOARD REAL STATISTICS
export const getAdminStats = async () => {
    const response = await apiRequest("/admin/stats");
    return response.data;
};

// 2. FETCH ALL REAL APPLICATIONS
export const getApplications = async () => {
    const response = await apiRequest("/admin/applications");
    return response.data;
};

// 3. VERIFY OR REJECT APPLICATION
export const updateApplicationStatus = async (id, status, verifiedCgpa) => {
    if (status === "verified") {
        if (
            verifiedCgpa === "" ||
            verifiedCgpa === null ||
            verifiedCgpa === undefined
        ) {
            throw new Error("Enter the verified CGPA before verifying.");
        }

        const cgpa = Number(verifiedCgpa);
        if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
            throw new Error("Verified CGPA must be between 0 and 10.");
        }

        const response = await apiRequest(
            `/admin/applications/${id}/verify`,
            {
                method: "PATCH",
                body: { verifiedCgpa: cgpa },
            }
        );

        return {
            id: response.data._id,
            status: response.data.status,
            verifiedCgpa: response.data.verifiedCgpa,
        };
    }

    if (status === "rejected") {
        const response = await apiRequest(
            `/admin/applications/${id}/reject`,
            {
                method: "PATCH",
            }
        );

        return {
            id: response.data._id,
            status: response.data.status,
            verifiedCgpa: response.data.verifiedCgpa,
        };
    }

    throw new Error("Invalid application status. Must be verified or rejected.");
};

// 4. REAL ALLOTMENT PREVIEW
export const runAllotmentPreview = async () => {
    const response = await apiRequest("/admin/allotment/preview");
    return response.data;
};

// 5. REAL ALLOTMENT PUBLISH
export const publishAllotment = async () => {
    const response = await apiRequest("/admin/allotment/publish", {
        method: "POST",
    });
    return response.data;
};

// 6. REAL OCCUPIED BEDS FOR VACANCY MANAGEMENT
export const getOccupiedBeds = async () => {
    const response = await apiRequest("/admin/vacancies");
    return response.data;
};

// 7. REAL WAITLIST
export const getWaitlist = async () => {
    const response = await apiRequest("/admin/waitlist");
    return response.data;
};

// 8. RELEASE BED
export const releaseBed = async (bedId) => {
    const response = await apiRequest(
        `/admin/vacancies/${bedId}/release`,
        {
            method: "POST",
        }
    );
    return response.data;
};

// 9. MANUAL WAITLIST PROMOTION
export const promoteWaitlistStudent = async (waitlistEntryId) => {
    const response = await apiRequest(
        `/admin/waitlist/${waitlistEntryId}/promote`,
        {
            method: "POST",
        }
    );
    return response.data;
};

// 10. REAL AUDIT HISTORY
export const getAuditLogs = async (page = 1, limit = 50) => {
    const response = await apiRequest(
        `/admin/audit-logs?page=${page}&limit=${limit}`
    );
    return response;
};
