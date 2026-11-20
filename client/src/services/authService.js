import { apiRequest, tokenStorage } from "./apiClient";

export async function loginUser(email, password) {
    const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
    });

    tokenStorage.set(data.token);
    return data.user;
}

export async function registerUser({ name, email, password }) {
    const data = await apiRequest("/auth/register", {
        method: "POST",
        body: { name, email, password },
        auth: false,
    });

    tokenStorage.set(data.token);
    return data.user;
}

export async function getCurrentUser() {
    const data = await apiRequest("/auth/me");
    return data.user;
}
