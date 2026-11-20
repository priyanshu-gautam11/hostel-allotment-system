import { apiRequest } from "./apiClient";

export const getHostels = async () => {
    const response = await apiRequest("/hostels");
    return response.data;
};

export const getHostelById = async (id) => {
    const hostels = await getHostels();

    const hostel = hostels.find(
        (hostel) =>
            hostel._id === id ||
            hostel.name === id ||
            hostel.name === `Hostel ${id}`
    );

    if (!hostel) {
        throw new Error("Hostel not found");
    }

    return hostel;
};