import BedCell from "./BedCell";

function RoomCard({ roomNumber, floor, beds }) {
    return (
        <div className="room-card border border-gray-200 rounded-lg p-3 bg-white shadow-xs">
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-100">
                <h4 className="font-bold text-gray-800 text-sm">Room {roomNumber}</h4>
                {floor !== undefined && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        {floor === 0 ? "Ground Floor" : `Floor ${floor}`}
                    </span>
                )}
            </div>

            <div className="room-beds flex flex-wrap gap-1.5">
                {beds.map((bed) => (
                    <BedCell
                        key={bed._id}
                        bed={bed}
                    />
                ))}
            </div>
        </div>
    );
}

export default RoomCard;
