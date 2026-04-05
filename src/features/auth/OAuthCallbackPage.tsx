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
        const code = searchParams.get("code");
        const stateRaw = searchParams.get("state");

        if (!code || !stateRaw) {
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
        const redirect_uri = getRedirectUri();

        const process = async () => {
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

                if (mode === "link") {
                    navigate("/my/settings?tab=accounts", { replace: true });
                } else {
                    login(data.token);
                    navigate("/dashboard", { replace: true });
                    window.location.reload();
                }
            } catch {
                setError("Помилка підключення до сервера");
            }
        };

        process();
    }, [searchParams, navigate, login]);

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
