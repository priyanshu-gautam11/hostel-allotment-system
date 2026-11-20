// Mock student offer data.
// The expiry timestamp is generated fresh whenever this module loads.

export const studentOffer = {
    offer: {
        bedId: "B-12-1",
        hostelId: "B",
        roomNumber: 12,
        expiresAt: Date.now() + 2 * 60 * 1000,
        status: "pending",
    },
    waitlistPosition: 2,
};