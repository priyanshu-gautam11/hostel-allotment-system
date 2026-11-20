import { useCallback, useEffect, useState } from "react";

import OfferCountdown from "../components/OfferCountdown";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

import {
    getMyOffer,
    getMyWaitlistPosition,
    respondToOffer,
} from "../services/offerService";

const StudentOfferPage = () => {
    const [offer, setOffer] = useState(null);
    const [waitlistPosition, setWaitlistPosition] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Load offer and waitlist details
    const loadData = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);

            setError("");

            const [myOffer, position] = await Promise.all([
                getMyOffer(),
                getMyWaitlistPosition(),
            ]);

            setOffer(myOffer);
            setWaitlistPosition(position ?? null);

            // Handle an offer whose deadline has passed.
            if (
                myOffer?.status === "pending" &&
                myOffer.expiresAt &&
                Date.now() >= myOffer.expiresAt
            ) {
                setOffer((previous) => ({
                    ...previous,
                    status: "expired",
                }));
            }
        } catch (err) {
            console.error("Offer loading error:", err);

            setError(
                import.meta.env.DEV
                    ? err.message
                    : "Unable to load your offer details. Please try again."
            );
        } finally {
            if (showLoader) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Accept or decline an offer
    const handleResponse = async (decision) => {
        if (
            submitting ||
            !offer ||
            offer.status !== "pending"
        ) {
            return;
        }

        if (
            offer.expiresAt &&
            Date.now() >= offer.expiresAt
        ) {
            setOffer((previous) => ({
                ...previous,
                status: "expired",
            }));

            setError("This offer has expired. You can no longer respond.");
            return;
        }

        // Confirm before declining
        if (decision === "decline") {
            const confirmed = window.confirm(
                "Are you sure you want to decline this hostel allotment offer? This action may release your allotted bed and affect your waitlist status."
            );

            if (!confirmed) return;
        }

        try {
            setSubmitting(true);
            setError("");

            await respondToOffer(decision);

            // Fetch the latest backend state instead of replacing
            // the existing offer with the small response object.
            await loadData(false);

        } catch (err) {
            console.error("Offer response error:", err);

            setError(
                import.meta.env.DEV
                    ? err.message
                    : "Unable to respond to the offer. Please try again."
            );

            // Refresh backend state in case the operation succeeded
            // but the response was interrupted.
            await loadData(false);

        } finally {
            setSubmitting(false);
        }
    };

    // Handle countdown expiry
    const handleExpire = () => {
        setOffer((previous) => {
            if (!previous || previous.status !== "pending") {
                return previous;
            }

            return {
                ...previous,
                status: "expired",
            };
        });
    };

    // Loading state
    if (loading) {
        return <LoadingState message="Loading your offer..." />;
    }

    // Error state with retry
    if (error && !offer) {
        return (
            <div className="mx-auto max-w-3xl p-6 md:p-10">
                <ErrorState
                    message={error}
                    onRetry={() => loadData(true)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-10">
            <div className="mx-auto max-w-3xl">

                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    My Hostel Offer
                </h1>

                <p className="mb-8 text-gray-600">
                    Check your waitlist position and hostel allotment offer.
                </p>

                {/* Inline error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
                    >
                        {error}
                    </div>
                )}

                {/* No active offer */}
                {!offer && (
                    <div className="rounded-xl bg-white p-8 shadow">

                        <h2 className="mb-3 text-xl font-semibold">
                            Waitlist Status
                        </h2>

                        {waitlistPosition !== null ? (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
                                <p className="text-lg font-semibold text-blue-900">
                                    Waitlist Position: #{waitlistPosition}
                                </p>

                                <p className="mt-2 text-sm text-blue-800">
                                    You are currently on the waiting list.
                                    If a suitable vacancy arises, you may
                                    be promoted automatically.
                                </p>
                            </div>
                        ) : (
                            <EmptyState
                                title="No Active Offer"
                                description="You currently have no hostel allotment offer or waitlist position."
                            />
                        )}

                        <button
                            onClick={() => loadData(true)}
                            className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Refresh Status
                        </button>
                    </div>
                )}

                {/* Offer details */}
                {offer && (
                    <div className="rounded-xl bg-white p-8 shadow">

                        <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                            Hostel Allotment Offer
                        </h2>

                        {/* Offer information */}
                        <div className="mb-6 grid gap-4 sm:grid-cols-2">

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Hostel
                                </p>

                                <p className="text-lg font-semibold">
                                    {offer.hostelName || "Hostel"}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Room & Floor
                                </p>

                                <p className="text-lg font-semibold">
                                    Room {offer.roomNumber} (
                                    {offer.floor === 0
                                        ? "Ground Floor"
                                        : `Floor ${offer.floor ?? "N/A"}`}
                                    )
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Bed Number
                                </p>

                                <p className="text-lg font-semibold">
                                    Bed #{offer.bedNumber ?? "N/A"}
                                </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Hostel Type
                                </p>

                                <p className="text-lg font-semibold capitalize">
                                    {offer.hostelType === "single"
                                        ? "Single Seater"
                                        : "Triple Seater"}
                                </p>
                            </div>

                        </div>

                        {/* Pending offer */}
                        {offer.status === "pending" && (
                            <>
                                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-5">

                                    <p className="mb-2 font-medium text-gray-700">
                                        Time remaining to respond
                                    </p>

                                    {offer.expiresAt ? (
                                        <OfferCountdown
                                            expiresAt={offer.expiresAt}
                                            onExpire={handleExpire}
                                        />
                                    ) : (
                                        <p className="text-sm text-red-700">
                                            Response deadline unavailable.
                                        </p>
                                    )}

                                    <p className="mt-2 text-sm text-gray-600">
                                        Respond within the 48-hour offer
                                        window.
                                    </p>

                                    {offer.respondBy && (
                                        <p className="mt-2 text-sm font-semibold text-gray-700">
                                            Deadline:{" "}
                                            {new Date(
                                                offer.respondBy
                                            ).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4">

                                    <button
                                        onClick={() => handleResponse("accept")}
                                        disabled={submitting}
                                        className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {submitting
                                            ? "Processing..."
                                            : "Accept Offer"}
                                    </button>

                                    <button
                                        onClick={() => handleResponse("decline")}
                                        disabled={submitting}
                                        className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {submitting
                                            ? "Processing..."
                                            : "Decline Offer"}
                                    </button>

                                </div>
                            </>
                        )}

                        {/* Accepted */}
                        {offer.status === "accepted" && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-5">

                                <h3 className="text-lg font-bold text-green-800">
                                    ✓ Offer Accepted!
                                </h3>

                                <p className="mt-2 text-sm text-green-700">
                                    Your hostel allotment has been confirmed.
                                    Your allocated hostel and bed details
                                    are displayed above.
                                </p>
                            </div>
                        )}

                        {/* Declined */}
                        {offer.status === "declined" && (
                            <div className="rounded-lg border border-gray-200 bg-gray-100 p-5">

                                <h3 className="text-lg font-bold text-gray-800">
                                    Offer Declined
                                </h3>

                                <p className="mt-2 text-sm text-gray-600">
                                    You declined this hostel allotment offer.
                                    Check your updated waitlist status.
                                </p>

                                {waitlistPosition !== null && (
                                    <p className="mt-3 font-semibold text-blue-700">
                                        Waitlist Position: #{waitlistPosition}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Expired */}
                        {offer.status === "expired" && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-5">

                                <h3 className="text-lg font-bold text-red-800">
                                    Offer Expired
                                </h3>

                                <p className="mt-2 text-sm text-red-700">
                                    The response deadline has passed.
                                    Your offer is no longer available.
                                    Check your waitlist status for updates.
                                </p>
                            </div>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
};

export default StudentOfferPage;