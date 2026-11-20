import { useCallback, useEffect, useState } from "react";

import {
    getOccupiedBeds,
    getWaitlist,
    releaseBed,
    promoteWaitlistStudent,
} from "../services/adminService";

import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

const VacancyPage = () => {
    const [occupied, setOccupied] = useState([]);
    const [waitingStudents, setWaitingStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [releasingId, setReleasingId] = useState(null);
    const [promotingId, setPromotingId] = useState(null);

    const [toast, setToast] = useState({
        message: "",
        type: "success",
    });

    // Close toast
    const handleToastClose = useCallback(() => {
        setToast({
            message: "",
            type: "success",
        });
    }, []);

    // Load real occupied beds and real waitlist from backend
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [beds, students] = await Promise.all([
                getOccupiedBeds(),
                getWaitlist(),
            ]);

            setOccupied(beds);
            setWaitingStudents(students);
        } catch (err) {
            console.error("Vacancy loading error:", err);
            setError(
                import.meta.env.DEV
                    ? err.message
                    : "Unable to load vacancy information. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Release occupied bed
    const handleRelease = async (bedId) => {
        if (releasingId !== null) return;

        try {
            setReleasingId(bedId);
            setError("");

            const result = await releaseBed(bedId);

            setToast({
                message: `Bed ${result.releasedBedId} released successfully. ${
                    result.promotedStudentId
                        ? "Promoted student ID: " + result.promotedStudentId
                        : "No eligible student was waiting for promotion."
                }`,
                type: "success",
            });

            // Reload fresh data from database
            await loadData();
        } catch (err) {
            console.error("Bed release error:", err);
            setToast({
                message: err.message || "Unable to release bed. Please try again.",
                type: "error",
            });
        } finally {
            setReleasingId(null);
        }
    };

    // Manual waitlist promotion
    const handlePromote = async (waitlistEntryId, studentName) => {
        if (promotingId !== null) return;

        try {
            setPromotingId(waitlistEntryId);
            setError("");

            const result = await promoteWaitlistStudent(waitlistEntryId);

            setToast({
                message: `${studentName} promoted successfully to an available bed! Offer sent.`,
                type: "success",
            });

            await loadData();
        } catch (err) {
            console.error("Waitlist promotion error:", err);
            setToast({
                message: err.message || "Failed to promote student from waitlist.",
                type: "error",
            });
        } finally {
            setPromotingId(null);
        }
    };

    if (loading) {
        return <LoadingState message="Loading live occupancy and waitlist data..." />;
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <ErrorState message={error} onRetry={loadData} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={handleToastClose}
            />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Vacancy & Waitlist Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Release occupied beds and promote students from the active waitlist pool.
                        </p>
                    </div>

                    <button
                        onClick={loadData}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm transition shadow-sm"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* Occupied Beds Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Occupied Beds ({occupied.length})
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Releasing an occupied bed makes it available and triggers automatic waitlist promotion.
                            </p>
                        </div>
                    </div>

                    {occupied.length === 0 ? (
                        <EmptyState
                            title="No Occupied Beds"
                            description="There are currently no occupied beds on record."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="p-3">Hostel</th>
                                        <th className="p-3">Room & Floor</th>
                                        <th className="p-3">Bed #</th>
                                        <th className="p-3">Occupant Name</th>
                                        <th className="p-3">Roll No</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {occupied.map((bed) => (
                                        <tr key={bed.bedId} className="hover:bg-gray-50 transition">
                                            <td className="p-3 font-semibold text-gray-900">
                                                {bed.hostelName}
                                                <span className="text-xs text-gray-400 block font-normal capitalize">
                                                    {bed.hostelType} seater
                                                </span>
                                            </td>

                                            <td className="p-3 text-gray-800">
                                                Room {bed.roomNumber}{" "}
                                                <span className="text-xs text-gray-500 block">
                                                    Floor {bed.floor}
                                                </span>
                                            </td>

                                            <td className="p-3 font-mono font-bold text-indigo-600">
                                                Bed #{bed.bedNumber}
                                            </td>

                                            <td className="p-3">
                                                <span className="font-medium text-gray-900 block">
                                                    {bed.studentName}
                                                </span>
                                                <span className="text-xs text-gray-400 block">
                                                    {bed.studentEmail}
                                                </span>
                                            </td>

                                            <td className="p-3 text-gray-700 font-mono text-xs">
                                                {bed.rollNo || "—"}
                                            </td>

                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleRelease(bed.bedId)}
                                                    disabled={releasingId !== null}
                                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                >
                                                    {releasingId === bed.bedId
                                                        ? "Releasing..."
                                                        : "Release Vacancy"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Waitlist Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Live Student Waitlist ({waitingStudents.length})
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Students ranked in priority order. You can promote them when beds in their pool are free.
                            </p>
                        </div>
                    </div>

                    {waitingStudents.length === 0 ? (
                        <EmptyState
                            title="Waitlist is Empty"
                            description="There are currently no students waiting for hostel placement."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="p-3">Rank</th>
                                        <th className="p-3">Student</th>
                                        <th className="p-3">Pool</th>
                                        <th className="p-3">Merit Score</th>
                                        <th className="p-3">Accessibility</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {waitingStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition">
                                            <td className="p-3">
                                                <span className="font-extrabold text-blue-600 text-base">
                                                    #{student.rank}
                                                </span>
                                            </td>

                                            <td className="p-3">
                                                <p className="font-semibold text-gray-900">
                                                    {student.studentName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Roll: {student.rollNo || "N/A"} • {student.studentEmail}
                                                </p>
                                            </td>

                                            <td className="p-3">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-blue-100 text-blue-800">
                                                    {student.pool}
                                                </span>
                                            </td>

                                            <td className="p-3 font-mono font-bold text-gray-800">
                                                {student.score} pts
                                            </td>

                                            <td className="p-3">
                                                {student.isPhysicallyDisabled ? (
                                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                                                        Ground Floor Required
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Standard</span>
                                                )}
                                            </td>

                                            <td className="p-3">
                                                <button
                                                    onClick={() => handlePromote(student.id, student.studentName)}
                                                    disabled={promotingId !== null}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                >
                                                    {promotingId === student.id ? "Promoting..." : "Promote Student"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VacancyPage;
