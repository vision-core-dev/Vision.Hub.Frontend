import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api.ts";
import { useAuth } from "@/core/auth/AuthContext.tsx";
import { Lock, Mail } from "lucide-react";
import { getErrorText } from "@/shared/types/Messages.ts";
import { Input } from "@/shared/ui/input/input.tsx";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { startOAuth } from "@/core/auth/oauth.ts";
import { GoogleIcon, DiscordIcon, TelegramIcon, RobloxIcon } from "@/shared/assets/icons/oauth-icons";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const response = await api.post("/v1/Hub/Auth/Login", { email, password });
            if (response.ok) {
                const data = await response.json();
                login(data.token);
                navigate("/dashboard");
                window.location.reload();
                setIsLoading(false);
            } else {
                const err = await response.json();
                setError(getErrorText(err.detail, "Невірні дані"));
                setIsLoading(false);
            }
        } catch {
            setError("Помилка підключення до сервера");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 align-center justify-center w-[360px] max-w-[90%] m-auto mt-10 p-10">
            <h1 className="font-extrabold text-display-md text-fg-brand-primary w-full text-center">Vision Core Hub</h1>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                <Input
                    className="w-full"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(value) => setEmail(value)}
                    isRequired={true}
                    icon={Mail}
                />

                <Input
                    className="w-full"
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(value) => setPassword(value)}
                    isRequired={true}
                    icon={Lock}
                />

                {error && <p className="text-error-primary">{error}</p>}

                <Button
                    className="w-full"
                    type="submit" size="md" isLoading={isLoading} showTextWhileLoading>
                    Увійти
                </Button>
            </form>

            <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border-secondary" />
                <span className="text-fg-quaternary text-sm">або</span>
                <div className="flex-1 h-px bg-border-secondary" />
            </div>

            <div className="flex flex-col gap-2 w-full">
                <OAuthButton provider="google" label="Google" onClick={() => startOAuth("google", "login")} />
                <OAuthButton provider="discord" label="Discord" onClick={() => startOAuth("discord", "login")} />
                <OAuthButton provider="telegram" label="Telegram" onClick={() => window.location.href = getTelegramLoginUrl("login")} />
                <OAuthButton provider="roblox" label="Roblox" onClick={() => startOAuth("roblox", "login")} />
            </div>
        </div>
    );
};

function getTelegramLoginUrl(mode: string): string {
    const botId = import.meta.env.VITE_TELEGRAM_BOT_ID ?? "";
    const returnTo = `${window.location.origin}/auth/callback?state=${encodeURIComponent(JSON.stringify({ provider: "telegram", mode }))}`;
    return `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(window.location.origin)}&request_access=write&return_to=${encodeURIComponent(returnTo)}`;
}

const providerConfig: Record<string, { colors: string; Icon: typeof GoogleIcon }> = {
    google: { colors: "bg-white text-gray-700 border border-border-primary hover:bg-gray-50", Icon: GoogleIcon },
    discord: { colors: "bg-[#5865F2] text-white hover:bg-[#4752C4]", Icon: DiscordIcon },
    telegram: { colors: "bg-[#2AABEE] text-white hover:bg-[#229ED9]", Icon: TelegramIcon },
    roblox: { colors: "bg-[#E2231A] text-white hover:bg-[#C81E17]", Icon: RobloxIcon },
};

function OAuthButton({ provider, label, onClick }: { provider: string; label: string; onClick: () => void }) {
    const { colors, Icon } = providerConfig[provider];
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center justify-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${colors}`}
        >
            <Icon className="size-5 shrink-0" />
            Увійти через {label}
        </button>
    );
}

export default LoginPage;









