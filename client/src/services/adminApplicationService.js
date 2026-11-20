import { apiRequest } from "./apiClient";

// Fetch real applications from MongoDB
export async function getApplications() {
    const response = await apiRequest("/admin/applications");
    return response.data;
}

// Verify or reject an application
export async function updateApplicationStatus(id, status, verifiedCgpa) {
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

    throw new Error("Invalid application status.");
}