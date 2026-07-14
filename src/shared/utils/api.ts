const BASE_URL = import.meta.env.VITE_API_URL;

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// In-flight GET deduplication — if same URL is already fetching, reuse the promise
const _inflight = new Map<string, Promise<Response>>();

async function _fetch(
    url: string,
    options: RequestInit = {},
    retries = MAX_RETRIES,
): Promise<Response> {
    const rawToken = localStorage.getItem("token");
    // Guard against sentinel garbage ("None"/"null"/"undefined") that would be
    // sent as `Bearer None` and rejected on every request — treat as no token.
    const token =
        rawToken && !["None", "null", "undefined"].includes(rawToken) ? rawToken : null;

    const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
    };

    const res = await fetch(BASE_URL + url, {
        ...options,
        headers,
        credentials: "include",
    });

    // Auto-redirect on 401 (unauthorized / expired token)
    // Skip for auth-related endpoints to prevent infinite redirect loops
    if (res.status === 401 && !url.includes("/Auth/")) {
        try {
            const body = await res.clone().json();
            if (body?.detail === "user_is_deactivated") {
                window.location.href = "/deactivated";
                throw new Error("Deactivated");
            }
        } catch (e) {
            if ((e as Error).message === "Deactivated") throw e;
        }
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    // Auto-retry on server errors (5xx)
    if (res.status >= 500 && retries > 0) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        return _fetch(url, options, retries - 1);
    }

    return res;
}

export const api = {
    async post(url: string, body?: any, customHeaders: Record<string, string> = {}, signal?: AbortSignal) {
        const isFormData = body instanceof FormData;

        return _fetch(url, {
            method: "POST",
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                ...customHeaders,
            },
            body: isFormData ? body : body ? JSON.stringify(body) : undefined,
            signal,
        });
    },

    async get(url: string, signal?: AbortSignal) {
        const existing = _inflight.get(url);
        if (existing) return existing.then(r => r.clone());

        const promise = _fetch(url, { signal }).finally(() => _inflight.delete(url));
        _inflight.set(url, promise);
        return promise;
    },

    async patch(url: string, body?: any, customHeaders: Record<string, string> = {}, signal?: AbortSignal) {
        return _fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...customHeaders,
            },
            body: body ? JSON.stringify(body) : undefined,
            signal,
        });
    },

    async delete(url: string, signal?: AbortSignal) {
        return _fetch(url, {
            method: "DELETE",
            signal,
        });
    },
};




