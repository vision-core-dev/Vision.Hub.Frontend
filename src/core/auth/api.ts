import { api } from "@/shared/utils/api";
import type { CheckMeResponse } from "./types";

const AUTH_TOKEN_KEY = "token";
const GREETING_KEY = "greeting";

export const authApi = {
    /**
     * Check current authentication status
     */
    checkMe: async (): Promise<{ ok: boolean; data: CheckMeResponse }> => {
        const response = await api.get("/v1/Hub/Auth/CheckMe");
        const data = await response.json();
        return { ok: response.ok, data };
    },

    /**
     * Login with credentials
     */
    login: async (email: string, password: string): Promise<{ ok: boolean; token?: string; detail?: string }> => {
        const response = await api.post("/v1/Hub/Auth/Login", { email, password });
        const data = await response.json();
        return { ok: response.ok, token: data.token, detail: data.detail };
    },
};

export const tokenStorage = {
    get: (): string | null => localStorage.getItem(AUTH_TOKEN_KEY),
    set: (token: string): void => localStorage.setItem(AUTH_TOKEN_KEY, token),
    remove: (): void => localStorage.removeItem(AUTH_TOKEN_KEY),
};

export const greetingStorage = {
    get: (): string | null => localStorage.getItem(GREETING_KEY),
    set: (greeting: string): void => localStorage.setItem(GREETING_KEY, greeting),
};
