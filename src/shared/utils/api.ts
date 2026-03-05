const BASE_URL = import.meta.env.VITE_API_URL;

export const api = {
    async post(url: string, body?: any, customHeaders: Record<string, string> = {}) {
        const isFormData = body instanceof FormData;

        const token = localStorage.getItem("token");

        return fetch(BASE_URL + url, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...customHeaders,
            },
            body: isFormData ? body : body ? JSON.stringify(body) : undefined,
            credentials: "include",
        });
    },

    async get(url: string) {
        const token = localStorage.getItem("token");
        return fetch(BASE_URL + url, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
        });
    },

    async patch(url: string, body?: any, customHeaders: Record<string, string> = {}) {
        const token = localStorage.getItem("token");
        return fetch(BASE_URL + url, {
            method: "PATCH",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                "Content-Type": "application/json",
                ...customHeaders,
            },
            body: body ? JSON.stringify(body) : undefined,
            credentials: "include",
        });
    },

    async delete(url: string) {
        const token = localStorage.getItem("token");
        return fetch(BASE_URL + url, {
            method: "DELETE",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
        });
    },
};








