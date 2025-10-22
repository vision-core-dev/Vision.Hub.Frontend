const BASE_URL = import.meta.env.VITE_API_URL;

export const api = {
    async post(url: string, body?: any, customHeaders: Record<string, string> = {}) {
        const isFormData = body instanceof FormData;

        return fetch(BASE_URL + url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...customHeaders,
            },
            body: isFormData ? body : body ? JSON.stringify(body) : undefined,
            credentials: "include",
        });
    },

    async get(url: string) {
        return fetch(BASE_URL + url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            credentials: "include",
        });
    },
};
