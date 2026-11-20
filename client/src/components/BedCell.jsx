function BedCell({ bed }) {
    const statusLabels = {
        available: "Available",
        offered: "Offer Pending",
        occupied: "Occupied",
        blocked: "Blocked",
    };

    return (
        <div
            className={`bed-cell bed-${bed.status}`}
            title={`Bed ${bed.bedNumber} - ${statusLabels[bed.status] || bed.status}`}
        >
            <span className="bed-number">
                Bed {bed.bedNumber}
            </span>

            <span className="bed-status">
                {statusLabels[bed.status] || bed.status}
            </span>
        </div>
    );
}

export default BedCell;