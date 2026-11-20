import { useEffect, useState } from "react";

const ApplicationDetail = ({
    application,
    onVerify,
    onReject,
    saving,
    updatingStatus,
    error,
}) => {
    const [verifiedCgpa, setVerifiedCgpa] = useState("");
    const [openingMarksheet, setOpeningMarksheet] = useState(false);

    useEffect(() => {
        setVerifiedCgpa(
            application?.verifiedCgpa !== null &&
                application?.verifiedCgpa !== undefined
                ? String(application.verifiedCgpa)
                : application?.claimedCgpa !== null &&
                    application?.claimedCgpa !== undefined
                    ? String(application.claimedCgpa)
                    : ""
        );
    }, [
        application?.id,
        application?.verifiedCgpa,
        application?.claimedCgpa,
    ]);

    if (!application) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <span className="text-4xl block mb-2">📋</span>
                <p className="text-gray-500 font-medium">
                    Select an application from the list to review details.
                </p>
            </div>
        );
    }

    const isSubmitted = application.status === "submitted";

    // OPEN MARKSHEET WITH AUTHENTICATION
    const handleOpenMarksheet = async () => {
        if (openingMarksheet) return;

        const newTab = window.open("about:blank", "_blank");

        if (!newTab) {
            alert("Please allow pop-ups to open the marksheet.");
            return;
        }

        newTab.document.title = "Opening Marksheet...";
        newTab.document.body.innerHTML =
            "<p style='font-family:Arial;padding:20px'>Loading marksheet...</p>";

        setOpeningMarksheet(true);

        let fileURL = null;

        try {
            const token = localStorage.getItem("hostel_token");

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please log in again."
                );
            }

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://127.0.0.1:5000/api";

            const response = await fetch(
                `${API_URL}/applications/${application.id}/marksheet`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    response.status === 401 || response.status === 403
                        ? "You are not authorized to view this marksheet."
                        : "Unable to load marksheet. Please try again."
                );
            }

            const blob = await response.blob();

            if (!blob.size) {
                throw new Error("The marksheet file is empty.");
            }

            fileURL = URL.createObjectURL(blob);

            newTab.location.href = fileURL;

            // Keep URL alive while the document is open.
            setTimeout(() => {
                URL.revokeObjectURL(fileURL);
            }, 5 * 60 * 1000);

        } catch (err) {
            console.error("Marksheet opening error:", err);

            newTab.close();

            alert(err.message || "Failed to open marksheet.");

        } finally {
            setOpeningMarksheet(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">

            {/* APPLICATION HEADER */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {application.studentName}
                    </h2>

                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                        Application #{application.id} •{" "}
                        {application.studentEmail}
                    </p>
                </div>

                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        application.status === "verified"
                            ? "bg-green-100 text-green-700"
                            : application.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : application.status === "allotted"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                    {application.status}
                </span>
            </div>

            {/* STUDENT DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                        Roll Number
                    </p>
                    <p className="font-semibold text-gray-800">
                        {application.rollNo || "N/A"}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                        Course & Semester
                    </p>
                    <p className="font-semibold text-gray-800">
                        {application.course || "N/A"} (Semester{" "}
                        {application.semester || "N/A"})
                    </p>
                </div>

                <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                        Claimed CGPA
                    </p>
                    <p className="font-semibold text-gray-800">
                        {application.claimedCgpa ?? "Not provided"}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                        Home Distance
                    </p>
                    <p className="font-semibold text-gray-800">
                        {application.distanceKm !== null &&
                        application.distanceKm !== undefined
                            ? `${application.distanceKm} KM`
                            : "Not provided"}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                        Room Preference
                    </p>
                    <p className="font-semibold text-gray-800 capitalize">
                        {application.preferences?.[0]?.hostelType || "Single"}{" "}
                        Seater (
                        {application.preferences?.[0]?.mode || "preferred"})
                    </p>
                </div>

                <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">
                        Accessibility Accommodation
                    </p>

                    <p className="font-semibold text-gray-800">
                        {application.isPhysicallyDisabled ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-200">
                                Yes (Ground Floor Guaranteed)
                            </span>
                        ) : (
                            "Standard Room"
                        )}
                    </p>
                </div>
            </div>

            {/* MARKSHEET DOCUMENT */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

                <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>

                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                            Uploaded Marksheet
                        </p>

                        <p className="font-mono text-sm text-gray-800 truncate max-w-xs">
                            {application.marksheetOriginalName ||
                                application.marksheet ||
                                "marksheet.pdf"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleOpenMarksheet}
                    disabled={openingMarksheet}
                    className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-300 font-semibold text-xs px-4 py-2 rounded-lg transition shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {openingMarksheet
                        ? "Opening..."
                        : "Open Document ↗"}
                </button>
            </div>

            {/* VERIFICATION FORM */}
            {isSubmitted && (
                <div className="pt-4 border-t border-gray-100 space-y-4">

                    <h3 className="font-bold text-gray-900 text-sm">
                        Review & Take Action
                    </h3>

                    <div>
                        <label
                            htmlFor="verifiedCgpa"
                            className="block text-xs font-semibold text-gray-600 mb-1"
                        >
                            Verified CGPA (0.00 to 10.00) *
                        </label>

                        <input
                            id="verifiedCgpa"
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={verifiedCgpa}
                            onChange={(e) =>
                                setVerifiedCgpa(e.target.value)
                            }
                            disabled={saving}
                            placeholder="e.g. 8.75"
                            className="border border-gray-300 rounded-lg px-3.5 py-2 w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">

                        <button
                            type="button"
                            onClick={() => onVerify(verifiedCgpa)}
                            disabled={saving || !verifiedCgpa}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {updatingStatus === "verified"
                                ? "Verifying..."
                                : "✓ Approve & Verify"}
                        </button>

                        <button
                            type="button"
                            onClick={onReject}
                            disabled={saving}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {updatingStatus === "rejected"
                                ? "Rejecting..."
                                : "✕ Reject Application"}
                        </button>

                    </div>
                </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* PROCESSED APPLICATION NOTICE */}
            {!isSubmitted && (
                <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                    This application has already been processed and its status
                    is locked as <strong>{application.status}</strong>.
                </div>
            )}

        </div>
    );
};

export default ApplicationDetail;