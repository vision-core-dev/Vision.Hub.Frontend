import { useState } from "react";
import { api } from "@/shared/utils/api";
import type { MeUser } from "@/shared/types/AuthUser";
import { DiscordIcon, TelegramIcon } from "@/shared/assets/icons/oauth-icons";
import { Toggle } from "@/shared/ui/base/toggle/toggle";

interface Props {
    user: MeUser;
}

export default function NotificationsSettings({ user }: Props) {
    const [discordEnabled, setDiscordEnabled] = useState(user.notify_discord);
    const [telegramEnabled, setTelegramEnabled] = useState(user.notify_telegram);
    const [saving, setSaving] = useState(false);

    const toggle = async (provider: "discord" | "telegram", value: boolean) => {
        setSaving(true);
        const body = provider === "discord"
            ? { notify_discord: value }
            : { notify_telegram: value };

        const res = await api.post("/v1/Hub/UserMe/UpdateNotifySettings", body);
        if (res.ok) {
            if (provider === "discord") setDiscordEnabled(value);
            else setTelegramEnabled(value);
        }
        setSaving(false);
    };

    const providers = [
        {
            key: "discord" as const,
            label: "Discord",
            Icon: DiscordIcon,
            linked: !!user.discord_id,
            username: user.discord_username,
            enabled: discordEnabled,
            color: "bg-[#5865F2]",
        },
        {
            key: "telegram" as const,
            label: "Telegram",
            Icon: TelegramIcon,
            linked: !!user.telegram_id,
            username: user.telegram_username,
            enabled: telegramEnabled,
            color: "bg-[#2AABEE]",
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <p className="text-fg-secondary text-sm">
                Отримуйте сповіщення в месенджери при нових подіях
            </p>

            {providers.map((p) => (
                <div
                    key={p.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border-secondary p-4"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${p.color}`}>
                            <p.Icon className="size-5 text-white" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-fg-primary font-medium">{p.label}</span>
                            {p.linked ? (
                                <span className="text-fg-tertiary text-sm truncate">{p.username}</span>
                            ) : (
                                <span className="text-fg-quaternary text-sm">
                                    Спочатку привʼяжіть акаунт
                                </span>
                            )}
                        </div>
                    </div>

                    <Toggle
                        size="md"
                        isSelected={p.enabled}
                        isDisabled={!p.linked || saving}
                        onChange={(v) => toggle(p.key, v)}
                    />
                </div>
            ))}
        </div>
    );
}
