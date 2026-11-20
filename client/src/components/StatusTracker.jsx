const steps = [
    { id: "submitted", label: "Submitted" },
    { id: "verified", label: "Verified" },
    { id: "allotted", label: "Allotted" },
];

function StatusTracker({ status }) {
    const currentIndex = steps.findIndex(
        (step) => step.id === status
    );

    return (
        <div className="status-tracker">
            <h2>Application Status</h2>

            <div className="status-steps">
                {steps.map((step, index) => {
                    let stepStatus = "pending";

                    if (currentIndex !== -1) {
                        if (index < currentIndex) {
                            stepStatus = "done";
                        } else if (index === currentIndex) {
                            stepStatus = "current";
                        }
                    }

                    return (
                        <div
                            key={step.id}
                            className={`status-step ${stepStatus}`}
                        >
                            <div className="status-circle">
                                {stepStatus === "done"
                                    ? "✓"
                                    : index + 1}
                            </div>

                            <span>{step.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default StatusTracker;