const BASE_URL = import.meta.env.VITE_API_URL

// "http://127.0.0.1:8000/api"
// "https://osvitech-backend.up.railway.app/api"

export const api = {
    async post(url: string, body?: any) {
        return fetch(BASE_URL + url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: body ? JSON.stringify(body) : undefined,
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
