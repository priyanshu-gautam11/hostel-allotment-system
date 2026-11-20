import { useState } from "react";

import {
    runAllotmentPreview,
    publishAllotment,
} from "../services/adminService";

import AllotmentSummary from "../components/AllotmentSummary";

const AllotmentPage = () => {
    const [status, setStatus] = useState("idle");
    const [previewRows, setPreviewRows] = useState([]);
    const [error, setError] = useState("");
    const [publishResult, setPublishResult] = useState(null);

    // ==========================================
    // RUN REAL PREVIEW
    // ==========================================

    const handlePreview = async () => {
        if (status === "previewing" || status === "publishing") {
            return;
        }

        try {
            setStatus("previewing");
            setError("");
            setPreviewRows([]);
            setPublishResult(null);

            const data = await runAllotmentPreview();

            setPreviewRows(data);
            setStatus("previewed");

        } catch (err) {
            setError(err.message || "Failed to generate preview");
            setStatus("idle");
        }
    };

    // ==========================================
    // OPEN PUBLISH CONFIRMATION
    // ==========================================

    const handlePublishClick = () => {
        if (status !== "previewed") return;

        setStatus("confirming");
    };

    // ==========================================
    // PUBLISH REAL ALLOTMENT
    // ==========================================

    const handleConfirmPublish = async () => {
        if (status !== "confirming") return;

        try {
            setStatus("publishing");
            setError("");

            const result = await publishAllotment();

            setPublishResult(result);
            setStatus("published");

        } catch (err) {
            setError(err.message || "Failed to publish allotment");
            setStatus("previewed");
        }
    };

    // ==========================================
    // CANCEL CONFIRMATION
    // ==========================================

    const handleCancelPublish = () => {
        if (status !== "confirming") return;

        setStatus("previewed");
    };

    // ==========================================
    // RESET PREVIEW
    // ==========================================

    const handleReset = () => {
        if (
            status === "previewing" ||
            status === "publishing" ||
            status === "published"
        ) {
            return;
        }

        setPreviewRows([]);
        setPublishResult(null);
        setError("");
        setStatus("idle");
    };

    const allottedCount = previewRows.filter(
        (row) => row.outcome === "allotted"
    ).length;

    const waitlistedCount = previewRows.filter(
        (row) => row.outcome === "waitlisted"
    ).length;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Hostel Allotment
                    </h1>

                    <p className="text-gray-500">
                        Preview and publish student hostel allotments.
                    </p>
                </div>

                {/* NOTICE */}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 font-semibold">
                        Important Notice
                    </p>

                    <p className="text-blue-700 text-sm mt-1">
                        Preview does not modify the database.
                        Publishing creates actual allotment offers.
                    </p>
                </div>

                {/* BUTTONS */}

                <div className="flex flex-wrap gap-4 mb-6">

                    <button
                        onClick={handlePreview}
                        disabled={
                            status === "previewing" ||
                            status === "publishing" ||
                            status === "published"
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                    >
                        {status === "previewing"
                            ? "Generating Preview..."
                            : "Run Preview"}
                    </button>

                    <button
                        onClick={handlePublishClick}
                        disabled={status !== "previewed"}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                    >
                        Publish Allotment
                    </button>

                    {(status === "previewed" ||
                        status === "confirming") && (
                        <button
                            onClick={handleReset}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
                        >
                            Reset Preview
                        </button>
                    )}

                </div>

                {/* ERROR */}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* PREVIEW RESULTS */}

                {previewRows.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6">

                        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Allotment Preview
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Results from the actual backend allocation algorithm.
                                </p>
                            </div>

                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                DRY RUN
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">

                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-gray-500">
                                    Total Allotted
                                </p>
                                <h3 className="text-3xl font-bold text-green-600">
                                    {allottedCount}
                                </h3>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <p className="text-gray-500">
                                    Total Waitlisted
                                </p>
                                <h3 className="text-3xl font-bold text-yellow-600">
                                    {waitlistedCount}
                                </h3>
                            </div>

                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">

                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3">Student</th>
                                        <th className="p-3">Score</th>
                                        <th className="p-3">Accessibility</th>
                                        <th className="p-3">Hostel</th>
                                        <th className="p-3">Room & Floor</th>
                                        <th className="p-3">Bed #</th>
                                        <th className="p-3">Outcome</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {previewRows.map((row, index) => (
                                        <tr
                                            key={row.id || row.studentId || index}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="p-3 font-medium">
                                                <span className="block font-semibold text-gray-900">
                                                    {row.studentName || "N/A"}
                                                </span>
                                                <span className="text-xs text-gray-400 block font-mono">
                                                    {row.rollNo || row.studentEmail || ""}
                                                </span>
                                            </td>

                                            <td className="p-3 font-mono font-bold text-gray-800">
                                                {row.score ?? "N/A"} pts
                                            </td>

                                            <td className="p-3">
                                                {row.isPhysicallyDisabled ? (
                                                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                                                        Ground Floor Required
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Standard</span>
                                                )}
                                            </td>

                                            <td className="p-3 font-medium text-gray-800">
                                                {row.hostelName || row.hostelId || "—"}
                                            </td>

                                            <td className="p-3 text-gray-800">
                                                {row.roomNumber !== null && row.roomNumber !== undefined ? (
                                                    <span>
                                                        Room {row.roomNumber} (Floor {row.floor ?? 0})
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>

                                            <td className="p-3 font-mono">
                                                {row.bedNumber ? `Bed #${row.bedNumber}` : (row.bedId || "—")}
                                            </td>

                                            <td className="p-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                                                        row.outcome === "allotted"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                                >
                                                    {row.outcome}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>

                    </div>
                )}

                {previewRows.length > 0 && (
                    <AllotmentSummary rows={previewRows} />
                )}

                {/* STALE PREVIEW */}

                {status === "previewed" && (
                    <p className="text-sm text-gray-500 mt-4">
                        If application or bed data changes, reset and run Preview again before publishing.
                    </p>
                )}

                {/* CONFIRMATION */}

                {status === "confirming" && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mt-6">

                        <h2 className="text-xl font-bold text-yellow-800 mb-3">
                            Confirm Final Allotment
                        </h2>

                        <p className="text-gray-700 mb-4">
                            Are you sure you want to publish the allotment?
                        </p>

                        <p className="font-semibold text-gray-800 mb-5">
                            This will create real offers for {allottedCount} students.
                        </p>

                        <div className="flex flex-wrap gap-4">

                            <button
                                onClick={handleConfirmPublish}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
                            >
                                Confirm Publish
                            </button>

                            <button
                                onClick={handleCancelPublish}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg"
                            >
                                Cancel
                            </button>

                        </div>
                    </div>
                )}

                {/* PUBLISHING */}

                {status === "publishing" && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mt-6">
                        Publishing real allotments... Please wait.
                    </div>
                )}

                {/* SUCCESS */}

                {status === "published" && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-6">

                        <h2 className="text-2xl font-bold text-green-700 mb-2">
                            Allotment Published Successfully!
                        </h2>

                        <p className="text-green-700">
                            The backend has processed the allotment publication.
                        </p>

                        <p className="text-sm text-green-600 mt-2">
                            Allotment offers and waitlist records have been processed.
                        </p>

                    </div>
                )}

            </div>
        </div>
    );
};

export default AllotmentPage;