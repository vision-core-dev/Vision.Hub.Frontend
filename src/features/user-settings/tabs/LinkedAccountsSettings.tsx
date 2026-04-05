import { useState } from "react";
import type { FC, SVGProps } from "react";
import { api } from "@/shared/utils/api";
import { startOAuth } from "@/core/auth/oauth";
import type { MeUser } from "@/shared/types/AuthUser";
import { Button } from "@/shared/ui/buttons/button";
import { GoogleIcon, DiscordIcon, TelegramIcon, RobloxIcon } from "@/shared/assets/icons/oauth-icons";

interface Props {
    user: MeUser;
}

interface ProviderConfig {
    key: string;
    label: string;
    idField: keyof MeUser;
    usernameField: keyof MeUser;
    color: string;
    iconColor: string;
    Icon: FC<SVGProps<SVGSVGElement>>;
}

const providers: ProviderConfig[] = [
    { key: "google", label: "Google", idField: "google_id", usernameField: "google_email", color: "bg-white border border-border-primary", iconColor: "", Icon: GoogleIcon },
    { key: "discord", label: "Discord", idField: "discord_id", usernameField: "discord_username", color: "bg-[#5865F2]", iconColor: "text-white", Icon: DiscordIcon },
    { key: "telegram", label: "Telegram", idField: "telegram_id", usernameField: "telegram_username", color: "bg-[#2AABEE]", iconColor: "text-white", Icon: TelegramIcon },
    { key: "roblox", label: "Roblox", idField: "roblox_id", usernameField: "roblox_username", color: "bg-[#E2231A]", iconColor: "text-white", Icon: RobloxIcon },
];

export default function LinkedAccountsSettings({ user }: Props) {
    const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);

    const handleUnlink = async (provider: string) => {
        setUnlinkingProvider(provider);
        try {
            const res = await api.post(`/v1/Hub/UserMe/LinkedAccounts/Unlink/${provider}`);
            if (res.ok) {
                window.location.reload();
            }
        } finally {
            setUnlinkingProvider(null);
        }
    };

    const handleLink = (provider: string) => {
        if (provider === "telegram") {
            const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME ?? "";
            const redirectUri = `${window.location.origin}/auth/callback`;
            const state = JSON.stringify({ provider: "telegram", mode: "link" });
            window.location.href = `https://oauth.telegram.org/auth?bot_id=${botUsername}&origin=${encodeURIComponent(window.location.origin)}&request_access=write&return_to=${encodeURIComponent(redirectUri)}?state=${encodeURIComponent(state)}`;
            return;
        }
        startOAuth(provider as "google" | "discord" | "roblox", "link");
    };

    return (
        <div className="flex flex-col gap-4">
            <p className="text-fg-secondary text-sm">
                Привʼяжіть акаунти для швидкого входу
            </p>

            {providers.map((p) => {
                const isLinked = !!user[p.idField];
                const username = user[p.usernameField] as string | null;

                return (
                    <div
                        key={p.key}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border-secondary p-4"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${p.color}`}>
                                <p.Icon className={`size-5 ${p.iconColor}`} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-fg-primary font-medium">{p.label}</span>
                                {isLinked ? (
                                    <span className="text-fg-tertiary text-sm truncate">
                                        {username}
                                    </span>
                                ) : (
                                    <span className="text-fg-quaternary text-sm">Не привʼязано</span>
                                )}
                            </div>
                        </div>

                        {isLinked ? (
                            <Button
                                size="sm"
                                color="secondary-destructive"
                                isLoading={unlinkingProvider === p.key}
                                onClick={() => handleUnlink(p.key)}
                            >
                                Відвʼязати
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                color="secondary"
                                onClick={() => handleLink(p.key)}
                            >
                                Привʼязати
                            </Button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
