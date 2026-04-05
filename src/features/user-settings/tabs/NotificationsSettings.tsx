import { useState } from "react";
import { api } from "@/shared/utils/api";
import type { MeUser } from "@/shared/types/AuthUser";
import { DiscordIcon, TelegramIcon } from "@/shared/assets/icons/oauth-icons";

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
                        checked={p.enabled}
                        disabled={!p.linked || saving}
                        onChange={(v) => toggle(p.key, v)}
                    />
                </div>
            ))}
        </div>
    );
}

function Toggle({ checked, disabled, onChange }: {
    checked: boolean;
    disabled: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`
                relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
                transition-colors duration-200 ease-in-out
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
                ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                ${checked ? "bg-brand-solid" : "bg-quaternary"}
            `}
        >
            <span
                className={`
                    pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm
                    ring-0 transition duration-200 ease-in-out transform
                    ${checked ? "translate-x-5" : "translate-x-0.5"}
                    mt-0.5
                `}
            />
        </button>
    );
}
