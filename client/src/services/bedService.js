import { apiRequest } from "./apiClient";

export const getBeds = async () => {
    const response = await apiRequest("/beds");
    return response.data;
};

export const getBedsByHostel = async (hostelId) => {
    const response = await apiRequest(
        `/beds?hostelId=${encodeURIComponent(hostelId)}`
    );

    return response.data;
};