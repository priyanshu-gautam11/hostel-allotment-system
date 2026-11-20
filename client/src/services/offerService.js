import { apiRequest } from "./apiClient";

// Get current student's offer
export const getMyOffer = async () => {
    const response = await apiRequest("/offers/me");

    if (
        !response?.data ||
        response.data.type !== "offer" ||
        !response.data.data
    ) {
        return null;
    }

    const offer = response.data.data;
    const bed = offer.bedId;
    const room = bed?.roomId;
    const hostel = bed?.hostelId;

    const expiresAt = offer.respondBy
        ? new Date(offer.respondBy).getTime()
        : null;

    return {
        id: offer._id,
        allotmentId: offer._id,

        bedId: bed?._id || bed || null,
        bedNumber: bed?.bedNumber ?? null,

        hostelId: hostel?._id || hostel || null,
        hostelName: hostel?.name || "Hostel",
        hostelType: hostel?.type || "single",

        roomNumber: room?.roomNumber ?? "N/A",
        floor: room?.floor ?? null,

        offeredAt: offer.offeredAt || null,
        respondBy: offer.respondBy || null,
        expiresAt,

        status:
            offer.status === "offered"
                ? "pending"
                : offer.status,
    };
};


// Get current student's waitlist position
export const getMyWaitlistPosition = async () => {
    const response = await apiRequest("/offers/me");

    if (
        !response?.data ||
        response.data.type !== "waitlist" ||
        !response.data.data
    ) {
        return null;
    }

    return response.data.data.rank ?? null;
};


// Accept or decline an offer
export const respondToOffer = async (decision) => {
    if (!["accept", "decline"].includes(decision)) {
        throw new Error(
            "Invalid offer response. Must be accept or decline."
        );
    }

    const response = await apiRequest("/offers/me/respond", {
        method: "POST",
        body: { decision },
    });

    return {
        status: decision === "accept" ? "accepted" : "declined",
        message:
            response?.message ||
            response?.data?.message ||
            "Offer response submitted successfully.",
    };
};