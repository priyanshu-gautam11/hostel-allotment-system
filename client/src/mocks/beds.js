import hostels from "./hostels";

const beds = [];

hostels.forEach((hostel) => {
    // Single-seater: 1 bed per room.
    // Triple-seater: 3 beds per room.
    const bedsPerRoom = hostel.type === "single" ? 1 : 3;

    for (let room = 1; room <= hostel.totalRooms; room++) {
        for (let bed = 1; bed <= bedsPerRoom; bed++) {
            // Temporary test: only Hostel A, Room 1, Bed 1 is occupied.
            const status =
                hostel.id === "A" && room === 1 && bed === 1
                    ? "occupied"
                    : "available";

            beds.push({
                id: `${hostel.id}-${room}-${bed}`,
                hostelId: hostel.id,
                roomNumber: room,
                bedNumber: bed,
                status
            });
        }
    }
});

export default beds;