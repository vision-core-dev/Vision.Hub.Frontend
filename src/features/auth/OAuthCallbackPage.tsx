import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/shared/utils/api";
import { useAuth } from "@/core/auth/AuthContext";
import { getRedirectUri } from "@/core/auth/oauth";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";

export default function OAuthCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const stateRaw = searchParams.get("state");

        if (!stateRaw) {
            setError("Невірні параметри авторизації");
            return;
        }

        let state: { provider: string; mode: string };
        try {
            state = JSON.parse(stateRaw);
        } catch {
            setError("Невірний state параметр");
            return;
        }

        const { provider, mode } = state;

        // Telegram returns data via #tgAuthResult hash fragment
        if (provider === "telegram") {
            processTelegram(mode);
            return;
        }

        // Other providers return ?code=
        const code = searchParams.get("code");
        if (!code) {
            setError("Невірні параметри авторизації");
            return;
        }

        processOAuth(provider, mode, code);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const processOAuth = async (provider: string, mode: string, code: string) => {
        const redirect_uri = getRedirectUri();
        try {
            const endpoint = mode === "link"
                ? `/v1/Hub/UserMe/LinkedAccounts/Link/${capitalize(provider)}`
                : `/v1/Hub/Auth/Login/${capitalize(provider)}`;

            const res = await api.post(endpoint, { code, redirect_uri });
            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || "Помилка авторизації");
                return;
            }

            handleSuccess(mode, data.token);
        } catch {
            setError("Помилка підключення до сервера");
        }
    };

    const processTelegram = async (mode: string) => {
        // Telegram puts auth result in URL hash: #tgAuthResult=BASE64
        const hash = window.location.hash;
        const match = hash.match(/tgAuthResult=([^&]+)/);

        if (!match) {
            setError("Telegram не повернув дані авторизації");
            return;
        }

        try {
            const decoded = JSON.parse(atob(match[1]));

            const endpoint = mode === "link"
                ? `/v1/Hub/UserMe/LinkedAccounts/Link/Telegram`
                : `/v1/Hub/Auth/Login/Telegram`;

            const res = await api.post(endpoint, decoded);
            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || "Помилка авторизації Telegram");
                return;
            }

            handleSuccess(mode, data.token);
        } catch {
            setError("Помилка обробки даних Telegram");
        }
    };

    const handleSuccess = (mode: string, token?: string) => {
        if (mode === "link") {
            navigate("/my/settings?tab=accounts", { replace: true });
        } else {
            if (token) login(token);
            navigate("/dashboard", { replace: true });
            window.location.reload();
        }
    };

    if (error) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
                <p className="text-error-primary text-lg">{error}</p>
                <button
                    onClick={() => navigate("/login")}
                    className="text-fg-brand-primary underline"
                >
                    Повернутись до входу
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoaderDots />
        </div>
    );
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
