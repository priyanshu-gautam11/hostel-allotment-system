import { useCallback, useEffect, useState } from "react";

import {
    getApplications,
    updateApplicationStatus,
} from "../services/adminApplicationService";

import ApplicationDetail from "../components/ApplicationDetail";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

const VerificationPage = () => {
    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedId, setSelectedId] = useState(null);

    const [saving, setSaving] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    const [updateError, setUpdateError] = useState("");

    const [toast, setToast] = useState({
        message: "",
        type: "success",
    });

    const handleToastClose = useCallback(() => {
        setToast({
            message: "",
            type: "success",
        });
    }, []);

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getApplications();
            setApplications(data);

        } catch (err) {
            console.error("Applications loading error:", err);

            setError(
                import.meta.env.DEV
                    ? err.message
                    : "Unable to load applications. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const selectedApplication = applications.find(
        (app) => app.id === selectedId
    );

    const handleStatusUpdate = async (status, verifiedCgpa) => {
        if (!selectedApplication || saving) return;

        const targetId = selectedId;

        try {
            setSaving(true);
            setUpdatingStatus(status);
            setUpdateError("");

            const updatedApplication = await updateApplicationStatus(
                targetId,
                status,
                verifiedCgpa
            );

            setApplications((prevApplications) =>
                prevApplications.map((app) =>
                    app.id === targetId
                        ? { ...app, ...updatedApplication }
                        : app
                )
            );

            setToast({
                message: `Application ${status} successfully!`,
                type: "success",
            });

        } catch (err) {
            console.error("Application status update error:", err);

            const errorMessage = import.meta.env.DEV
                ? err.message
                : "Unable to update application. Please try again.";

            setUpdateError(errorMessage);

            setToast({
                message: errorMessage,
                type: "error",
            });

        } finally {
            setSaving(false);
            setUpdatingStatus(null);
        }
    };

    if (loading) {
        return <LoadingState message="Loading applications..." />;
    }

    if (error) {
        return (
            <ErrorState
                message={error}
                onRetry={fetchApplications}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <Toast
                message={toast.message}
                type={toast.type}
                onClose={handleToastClose}
            />

            <div className="max-w-7xl mx-auto">

                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Application Verification
                </h1>

                <p className="text-gray-500 mb-8">
                    Review and verify student hostel applications.
                </p>

                {applications.length === 0 ? (
                    <EmptyState
                        title="No Applications Found"
                        description="There are currently no student applications to verify."
                    />
                ) : (

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="bg-white rounded-xl shadow-md p-5">

                            <h2 className="text-xl font-bold mb-5">
                                Applications ({applications.length})
                            </h2>

                            <div className="space-y-3">

                                {applications.map((app) => (

                                    <div
                                        key={app.id}
                                        onClick={() => {
                                            if (saving) return;

                                            setSelectedId(app.id);
                                            setUpdateError("");
                                        }}
                                        className={`border rounded-lg p-4 transition ${
                                            saving
                                                ? "cursor-not-allowed opacity-60"
                                                : "cursor-pointer"
                                        } ${
                                            selectedId === app.id
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >

                                        <div className="flex justify-between items-center">

                                            <h3 className="font-semibold">
                                                {app.studentName}
                                            </h3>

                                            <span className="text-xs text-gray-400">
                                                #{app.id}
                                            </span>

                                        </div>

                                        <span
                                            className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                                                app.status === "verified"
                                                    ? "bg-green-100 text-green-700"
                                                    : app.status === "rejected"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >
                                            {app.status}
                                        </span>

                                    </div>

                                ))}

                            </div>

                        </div>

                        <div className="md:col-span-2">

                            <ApplicationDetail
                                application={selectedApplication}
                                onVerify={(cgpa) =>
                                    handleStatusUpdate("verified", cgpa)
                                }
                                onReject={() =>
                                    handleStatusUpdate("rejected")
                                }
                                saving={saving}
                                updatingStatus={updatingStatus}
                                error={updateError}
                            />

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
};

export default VerificationPage;