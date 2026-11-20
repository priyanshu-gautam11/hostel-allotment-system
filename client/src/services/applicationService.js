import { apiRequest } from "./apiClient";

// Submit student application with marksheet
export const submitApplication = async (applicationData) => {
    const formData = new FormData();

    formData.append("fullName", applicationData.fullName);
    formData.append("rollNo", applicationData.rollNo);
    formData.append("course", applicationData.course);
    formData.append("semester", applicationData.semester);
    formData.append("cgpa", applicationData.cgpa);
    formData.append("distanceKm", applicationData.distanceKm);
    formData.append("preference", applicationData.preference);
    formData.append("isPhysicallyDisabled", Boolean(applicationData.isPhysicallyDisabled));
    formData.append("marksheet", applicationData.marksheet);

    const response = await apiRequest("/applications", {
        method: "POST",
        body: formData,
    });

    return response.data;
};

// Get logged-in student's application
export const getMyApplication = async () => {
    const response = await apiRequest("/applications/me");
    return response.data;
};

// Get application status for dashboard
export const getApplicationStatus = async () => {
    try {
        const application = await getMyApplication();
        return application.status;
    } catch (error) {
        if (error.status === 404) {
            return null;
        }

        throw error;
    }
};