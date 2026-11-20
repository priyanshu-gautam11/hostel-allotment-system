import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose }) => {
    useEffect(() => {
        if (!message) return;

        const timeoutId = setTimeout(() => {
            onClose?.();
        }, 3000);

        return () => clearTimeout(timeoutId);
    }, [message, onClose]);

    if (!message) return null;

    const styles =
        type === "error"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-green-200 bg-green-50 text-green-700";

    return (
        <div
            role="status"
            className={`fixed right-5 top-5 z-50 flex items-center gap-4 rounded-xl border px-6 py-4 shadow-lg ${styles}`}
        >
            <p className="font-medium">{message}</p>

            <button
                onClick={onClose}
                className="font-bold opacity-70 hover:opacity-100"
                aria-label="Close notification"
            >
                ✕
            </button>
        </div>
    );
};

export default Toast;