import { getMyApplication } from "./applicationService";
import { getMyOffer, getMyWaitlistPosition } from "./offerService";

const STORAGE_KEY = "read_notifications_ids";

const getReadIds = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
};

export const markNotificationRead = async (id) => {
    const readIds = getReadIds();
    if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
    }
    return { id, read: true };
};

export const getNotifications = async () => {
    const readIds = getReadIds();
    const notifications = [];

    try {
        const app = await getMyApplication();
        if (app) {
            if (app.status === "submitted") {
                notifications.push({
                    id: `app-submitted-${app._id}`,
                    title: "Application Under Review",
                    message: "Your hostel application has been submitted and is awaiting administrative verification.",
                    createdAt: app.createdAt || new Date().toISOString(),
                    read: readIds.includes(`app-submitted-${app._id}`),
                });
            } else if (app.status === "verified") {
                notifications.push({
                    id: `app-verified-${app._id}`,
                    title: "Application Verified",
                    message: `Your application has been verified with CGPA: ${app.verifiedCgpa ?? app.claimedCgpa}. You are eligible for the upcoming allotment cycle.`,
                    createdAt: app.updatedAt || new Date().toISOString(),
                    read: readIds.includes(`app-verified-${app._id}`),
                });
            } else if (app.status === "rejected") {
                notifications.push({
                    id: `app-rejected-${app._id}`,
                    title: "Application Rejected",
                    message: "Your hostel application could not be verified or was rejected by administration.",
                    createdAt: app.updatedAt || new Date().toISOString(),
                    read: readIds.includes(`app-rejected-${app._id}`),
                });
            }
        }
    } catch {
        // No application found
    }

    try {
        const offer = await getMyOffer();
        if (offer) {
            if (offer.status === "pending") {
                notifications.push({
                    id: `offer-${offer.id}`,
                    title: "Hostel Allotment Offer Received!",
                    message: `You have received an allotment offer for ${offer.hostelName}, Room ${offer.roomNumber}, Bed ${offer.bedNumber}. Please respond before the deadline.`,
                    createdAt: offer.offeredAt || new Date().toISOString(),
                    read: readIds.includes(`offer-${offer.id}`),
                });
            } else if (offer.status === "accepted") {
                notifications.push({
                    id: `offer-accepted-${offer.id}`,
                    title: "Hostel Offer Confirmed",
                    message: `Your bed in ${offer.hostelName}, Room ${offer.roomNumber} is confirmed and occupied.`,
                    createdAt: new Date().toISOString(),
                    read: readIds.includes(`offer-accepted-${offer.id}`),
                });
            }
        } else {
            const rank = await getMyWaitlistPosition();
            if (rank) {
                notifications.push({
                    id: `waitlist-${rank}`,
                    title: "Hostel Waitlist Position",
                    message: `You are currently rank #${rank} on the waitlist. You will be automatically promoted when a bed becomes vacant.`,
                    createdAt: new Date().toISOString(),
                    read: readIds.includes(`waitlist-${rank}`),
                });
            }
        }
    } catch {
        // No offer
    }

    if (notifications.length === 0) {
        notifications.push({
            id: "welcome-notice",
            title: "Welcome to Hostel Portal",
            message: "Get started by submitting your profile and hostel preference application.",
            createdAt: new Date().toISOString(),
            read: readIds.includes("welcome-notice"),
        });
    }

    return notifications;
};
