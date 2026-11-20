import RoomCard from "./RoomCard";

function HostelMap({ hostel, beds }) {

    // Group beds according to populated room number
    const groupedRooms = beds.reduce((groups, bed) => {
        const roomNumber =
            bed.roomId?.roomNumber ?? bed.roomNumber ?? "Unknown";

        if (!groups[roomNumber]) {
            groups[roomNumber] = [];
        }

        groups[roomNumber].push(bed);

        return groups;
    }, {});

    const rooms = Object.entries(groupedRooms)
        .sort(([a], [b]) => {
            return String(a).localeCompare(String(b), undefined, {
                numeric: true,
            });
        });

    return (
        <section className="hostel-map">

            <div className="hostel-map-header">
                <h2>{hostel.name}</h2>

                <p>
                    Type:{" "}
                    {hostel.type === "single"
                        ? "Single Seater"
                        : "Three Seater"}
                </p>

                <p>
                    Total Rooms: {hostel.totalRooms}
                </p>

                <p>
                    Total Beds: {hostel.totalBeds}
                </p>
            </div>

            <div className="rooms-grid">
                {rooms.map(([roomNumber, roomBeds]) => (
                    <RoomCard
                        key={`${hostel._id}-${roomNumber}`}
                        roomNumber={roomNumber}
                        floor={roomBeds[0]?.roomId?.floor}
                        beds={roomBeds}
                    />
                ))}
            </div>

        </section>
    );
}

export default HostelMap;