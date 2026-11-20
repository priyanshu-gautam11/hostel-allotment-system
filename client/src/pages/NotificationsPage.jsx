import { useCallback, useEffect, useState } from "react";

import {
    getNotifications,
    markNotificationRead,
} from "../services/notificationService";

import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

import "../styles/NotificationsPage.css";

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getNotifications();

            setNotifications(data);
        } catch (err) {
            console.error("Notifications loading error:", err);

            setError(
                import.meta.env.DEV
                    ? err.message
                    : "Unable to load notifications. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Automatically clear error after 3 seconds
    useEffect(() => {
        if (!error) return;

        const timer = setTimeout(() => {
            setError("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [error]);

    // Calculate unread notifications
    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    // Mark notification as read
    const handleMarkAsRead = async (id) => {
        if (updatingId !== null) return;

        try {
            setError("");
            setUpdatingId(id);

            await markNotificationRead(id);

            // Update only the selected notification
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id
                        ? { ...notification, read: true }
                        : notification
                )
            );

        } catch (err) {
            console.error("Notification update error:", err);

            setError(
                import.meta.env.DEV
                    ? err.message
                    : "Unable to update notification. Please try again."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="notifications-page">
                <LoadingState message="Loading notifications..." />
            </div>
        );
    }

    // Error state when notifications could not be loaded
    if (error && notifications.length === 0) {
        return (
            <div className="notifications-page">
                <ErrorState
                    message={error}
                    onRetry={fetchNotifications}
                />
            </div>
        );
    }

    // Empty state
    if (notifications.length === 0) {
        return (
            <div className="notifications-page">
                <EmptyState
                    title="No notifications yet"
                    description="You are all caught up!"
                />
            </div>
        );
    }

    return (
        <div className="notifications-page">

            {/* Header */}
            <div className="notifications-header">
                <h1>Notifications</h1>

                <p>
                    You have {unreadCount} unread notifications.
                </p>
            </div>

            {/* Error message */}
            {error && (
                <ErrorState message={error} />
            )}

            {/* Notifications List */}
            <div className="notifications-list">

                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`notification-card ${
                            notification.read ? "read" : "unread"
                        }`}
                    >

                        <div className="notification-content">

                            <h3>{notification.title}</h3>

                            <p>{notification.message}</p>

                            <small>
                                {new Date(
                                    notification.createdAt
                                ).toLocaleDateString("en-IN")}
                            </small>

                        </div>

                        <div className="notification-actions">

                            {notification.read ? (
                                <span className="read-label">
                                    ✓ Read
                                </span>
                            ) : (
                                <button
                                    onClick={() =>
                                        handleMarkAsRead(notification.id)
                                    }
                                    disabled={updatingId !== null}
                                >
                                    {updatingId === notification.id
                                        ? "Updating..."
                                        : "Mark as read"}
                                </button>
                            )}

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
}

export default NotificationsPage;