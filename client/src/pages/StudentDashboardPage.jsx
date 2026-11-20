import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getHostels } from "../services/hostelService";
import { getMyApplication } from "../services/applicationService";
import {
    getMyOffer,
    getMyWaitlistPosition,
} from "../services/offerService";

import StatusTracker from "../components/StatusTracker";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

function StudentDashboardPage() {
    const { user } = useAuth();

    const [hostels, setHostels] = useState([]);
    const [application, setApplication] = useState(null);
    const [offer, setOffer] = useState(null);
    const [waitlistRank, setWaitlistRank] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [hostelData, appData, offerData, rankData] =
                await Promise.all([
                    getHostels().catch(() => []),
                    getMyApplication().catch(() => null),
                    getMyOffer().catch(() => null),
                    getMyWaitlistPosition().catch(() => null),
                ]);

            setHostels(hostelData);
            setApplication(appData);
            setOffer(offerData);
            setWaitlistRank(rankData);
        } catch (err) {
            console.error("Dashboard error:", err);
            setError(
                err.message || "Unable to load dashboard details."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    if (loading) {
        return (
            <LoadingState message="Loading your student dashboard..." />
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <ErrorState
                    message={error}
                    onRetry={loadDashboardData}
                />
            </div>
        );
    }

    // Offer data is returned as a flat object by offerService.js.
    const hostelName = offer?.hostelName || "Hostel";
    const roomNumber = offer?.roomNumber ?? "N/A";
    const bedNumber = offer?.bedNumber ?? "N/A";
    const floor = offer?.floor;

    const offerStatus = offer?.status;

    const hasPendingOffer = offerStatus === "pending";
    const hasAcceptedOffer = offerStatus === "accepted";

    const deadline = offer?.respondBy
        ? new Date(offer.respondBy)
        : null;

    const deadlineText =
        deadline && !Number.isNaN(deadline.getTime())
            ? deadline.toLocaleString()
            : "Not available";

    const normalizedRank =
        typeof waitlistRank === "number"
            ? waitlistRank
            : waitlistRank?.rank ?? waitlistRank?.position ?? null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Greeting Card */}

                <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                    <div>
                        <h1 className="text-3xl font-extrabold">
                            Welcome back, {user?.name || "Student"}!
                        </h1>

                        <p className="mt-1 text-blue-100 text-sm">
                            Roll No:{" "}
                            {user?.rollNo ||
                                application?.studentId?.rollNo ||
                                "Registered Student"}{" "}
                            • {user?.email}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            to="/student/profile"
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition"
                        >
                            {application ? "View Profile" : "Apply Now"}
                        </Link>

                        <Link
                            to="/student/beds"
                            className="bg-white text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                        >
                            Explore Beds
                        </Link>
                    </div>
                </div>

                {/* Pending Offer */}

                {hasPendingOffer && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">

                            <div className="flex items-center gap-4">
                                <span className="text-4xl">🎉</span>

                                <div>
                                    <h3 className="text-lg font-bold text-amber-900">
                                        Hostel Allotment Offer Available!
                                    </h3>

                                    <p className="text-sm text-amber-800 mt-1">
                                        You have received an allotment offer for{" "}
                                        <strong>{hostelName}</strong>, Room{" "}
                                        <strong>{roomNumber}</strong>.
                                    </p>

                                    <p className="text-sm text-amber-800 mt-1">
                                        Bed: {bedNumber} | Floor:{" "}
                                        {floor === 0
                                            ? "Ground Floor"
                                            : floor ?? "N/A"}
                                    </p>

                                    <p className="text-sm font-semibold text-red-700 mt-2">
                                        Respond before: {deadlineText}
                                    </p>
                                </div>
                            </div>

                            <Link
                                to="/student/offer"
                                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm shadow-sm transition whitespace-nowrap"
                            >
                                Review Offer →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Accepted Offer */}

                {hasAcceptedOffer && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">

                            <div className="flex items-center gap-4">
                                <span className="text-3xl">✅</span>

                                <div>
                                    <h3 className="text-lg font-bold text-green-900">
                                        Hostel Allotment Confirmed!
                                    </h3>

                                    <p className="text-sm text-green-800 mt-1">
                                        Your allotment has been accepted.
                                    </p>
                                </div>
                            </div>

                            <span className="bg-green-200 text-green-900 px-4 py-2 rounded-full text-xs font-bold uppercase">
                                Accepted
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">

                            <div className="bg-white rounded-xl p-4 border border-green-100">
                                <p className="text-xs text-gray-500">
                                    Hostel
                                </p>
                                <p className="font-bold text-gray-900 mt-1">
                                    {hostelName}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-green-100">
                                <p className="text-xs text-gray-500">
                                    Room
                                </p>
                                <p className="font-bold text-gray-900 mt-1">
                                    {roomNumber}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-green-100">
                                <p className="text-xs text-gray-500">
                                    Bed Number
                                </p>
                                <p className="font-bold text-gray-900 mt-1">
                                    {bedNumber}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-green-100">
                                <p className="text-xs text-gray-500">
                                    Floor
                                </p>
                                <p className="font-bold text-gray-900 mt-1">
                                    {floor === 0
                                        ? "Ground Floor"
                                        : floor ?? "N/A"}
                                </p>
                            </div>

                        </div>

                        <div className="mt-5">
                            <Link
                                to="/student/offer"
                                className="inline-block text-green-700 hover:text-green-900 font-semibold text-sm underline"
                            >
                                View Allotment Details →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Declined / Expired Offer */}

                {(offerStatus === "declined" ||
                    offerStatus === "expired") && (
                    <div className="bg-gray-100 border border-gray-300 rounded-2xl p-6">

                        <h3 className="font-bold text-gray-800">
                            Offer{" "}
                            {offerStatus === "expired"
                                ? "Expired"
                                : "Declined"}
                        </h3>

                        <p className="text-sm text-gray-600 mt-1">
                            This offer is no longer active. Check your
                            application and waitlist status for updates.
                        </p>
                    </div>
                )}

                {/* Waitlist Banner */}

                {!offer && normalizedRank !== null && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                        <div className="flex items-center gap-4">
                            <span className="text-3xl">⏳</span>

                            <div>
                                <h3 className="text-lg font-bold text-blue-900">
                                    Waitlist Position: #{normalizedRank}
                                </h3>

                                <p className="text-sm text-blue-700">
                                    You are currently on the waiting list.
                                    If a suitable vacancy arises, you may
                                    be promoted automatically.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/student/offer"
                            className="text-blue-700 hover:text-blue-900 font-semibold text-sm underline"
                        >
                            View Waitlist Details →
                        </Link>
                    </div>
                )}

                {/* Application Status */}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Hostel Application Status
                        </h2>

                        {application && (
                            <Link
                                to="/student/profile"
                                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                                Application Details →
                            </Link>
                        )}
                    </div>

                    {!application ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">

                            <h3 className="text-lg font-semibold text-gray-800">
                                No Application Submitted Yet
                            </h3>

                            <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                                You haven't submitted your hostel admission
                                form. Complete your profile and submit room
                                preferences to participate in allotment.
                            </p>

                            <Link
                                to="/student/profile"
                                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm shadow-sm transition"
                            >
                                Start Application Form
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <StatusTracker status={application.status} />

                            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm">

                                <div>
                                    <span className="text-xs text-gray-500 font-semibold uppercase block">
                                        Claimed CGPA
                                    </span>
                                    <span className="text-base font-bold text-gray-800">
                                        {application.claimedCgpa ?? "N/A"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-500 font-semibold uppercase block">
                                        Verified CGPA
                                    </span>
                                    <span className="text-base font-bold text-gray-800">
                                        {application.verifiedCgpa ?? "Under Review"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-500 font-semibold uppercase block">
                                        Preference
                                    </span>
                                    <span className="text-base font-bold text-gray-800 capitalize">
                                        {application.preferences?.[0]?.hostelType || "N/A"} Seater
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-500 font-semibold uppercase block">
                                        Accessibility
                                    </span>
                                    <span className="text-base font-bold text-gray-800">
                                        {application.isPhysicallyDisabled
                                            ? "Ground Floor Room"
                                            : "Standard"}
                                    </span>
                                </div>

                            </div>
                        </div>
                    )}
                </div>

                {/* Available Hostels */}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">

                    <div className="flex justify-between items-center mb-6">

                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Campus Hostels & Capacity
                            </h2>

                            <p className="text-sm text-gray-500 mt-0.5">
                                Explore available hostel blocks and occupancy
                                across campus
                            </p>
                        </div>

                        <Link
                            to="/student/beds"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                            Open Interactive Bed Map →
                        </Link>
                    </div>

                    {hostels.length === 0 ? (
                        <EmptyState
                            title="No Hostels Available"
                            description="Hostel information is currently being updated. Please check again later."
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                            {hostels.map((hostel) => (
                                <div
                                    key={hostel._id}
                                    className="border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition bg-linear-to-br from-white to-gray-50/50 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-2">

                                            <h3 className="text-lg font-bold text-gray-900">
                                                {hostel.name}
                                            </h3>

                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                                    hostel.type === "single"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-purple-100 text-purple-800"
                                                }`}
                                            >
                                                {hostel.type === "single"
                                                    ? "Single Seater"
                                                    : "Triple Seater"}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5 text-sm text-gray-600 mt-3">

                                            <p className="flex justify-between">
                                                <span>Total Rooms:</span>
                                                <strong className="text-gray-900">
                                                    {hostel.totalRooms} rooms
                                                </strong>
                                            </p>

                                            <p className="flex justify-between">
                                                <span>Total Capacity:</span>
                                                <strong className="text-gray-900">
                                                    {hostel.totalBeds} beds
                                                </strong>
                                            </p>

                                            <p className="flex justify-between">
                                                <span>Allocation Order:</span>
                                                <span className="text-gray-700 font-medium">
                                                    Phase #{hostel.fillOrder}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-100">
                                        <Link
                                            to="/student/beds"
                                            className="w-full inline-block text-center bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-800 text-xs font-semibold py-2 px-3 rounded-lg transition"
                                        >
                                            View Room & Bed Grid
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default StudentDashboardPage;