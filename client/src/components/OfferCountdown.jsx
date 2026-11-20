import { useEffect, useRef, useState } from "react";

const OfferCountdown = ({ expiresAt, onExpire }) => {
    const [secondsLeft, setSecondsLeft] = useState(() =>
        Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
    );

    const expiredRef = useRef(false);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    useEffect(() => {
        expiredRef.current = false;

        const updateTimer = () => {
            const remaining = Math.max(
                0,
                Math.ceil((expiresAt - Date.now()) / 1000)
            );

            setSecondsLeft(remaining);

            if (remaining === 0 && !expiredRef.current) {
                expiredRef.current = true;
                onExpireRef.current?.();
            }
        };

        updateTimer();

        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [expiresAt]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return (
        <p className="text-2xl font-bold text-red-600">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
        </p>
    );
};

export default OfferCountdown;