const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

const TOKEN_KEY = "hostel_token";

export const tokenStorage = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (token) => localStorage.setItem(TOKEN_KEY, token),
    clear: () => localStorage.removeItem(TOKEN_KEY),
};

export async function apiRequest(
    path,
    { method = "GET", body, auth = true } = {}
) {
    const headers = {};

    if (!(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    if (auth) {
        const token = tokenStorage.get();

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body:
            body instanceof FormData
                ? body
                : body !== undefined
                    ? JSON.stringify(body)
                    : undefined,
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        if (response.status === 401 && auth) {
            tokenStorage.clear();
        }

        const error = new Error(
            data?.message || "Request failed. Please try again."
        );

        error.status = response.status;
        error.errors = data?.errors;

        throw error;
    }

    return data;
}