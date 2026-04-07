import { useState, useEffect } from "react";
import { useAuth } from "@/core/auth/AuthContext.tsx";
import { AvatarProfilePhoto } from "@/shared/ui/avatar/avatar-profile-photo.tsx";
import { Input } from "@/shared/ui/input/input.tsx";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal.tsx";
import { FileUploadDropZone } from "@/shared/components/file-upload/file-upload-base.tsx";
import { api } from "@/shared/utils/api.ts";
import { safeDate } from "@/shared/utils/safeDate.ts";
import { Cake, User, Moon, Sun, Link2, Bell, Lock, Timer, Award } from "lucide-react";
import { ButtonGroup, ButtonGroupItem } from "@/shared/ui/button-group/button-group.tsx";
import { useTheme } from "@/shared/utils/use-theme.ts";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { Toggle } from "@/shared/ui/base/toggle/toggle";
import { usePomodoroEnabled } from "@/shared/components/pomodoro/PomodoroTimer";
import { startOAuth } from "@/core/auth/oauth.ts";
import type { MeUser } from "@/shared/types/AuthUser.ts";
import type { FC, SVGProps } from "react";
import { GoogleIcon, DiscordIcon, TelegramIcon, RobloxIcon } from "@/shared/assets/icons/oauth-icons";

export default function UserSettingsPage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="p-8">
            <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
                <ProfileSection user={user} />
                <ThemeSection />
                <AccountsSection user={user} />
                <PasswordSection />
                <BadgesSection />
                <NotificationsSection user={user} />
            </div>
        </div>
    );
}

/* ─── Section wrapper ─── */
function Section({ icon: Icon, title, description, children }: {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col gap-5 rounded-2xl border border-border-secondary bg-primary p-6 shadow-xs break-inside-avoid">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Icon size={18} className="text-fg-brand-primary" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-fg-primary">{title}</h3>
                    <p className="text-sm text-fg-tertiary">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

/* ─── Profile ─── */
function ProfileSection({ user }: { user: MeUser }) {
    const [avatarModal, setAvatarModal] = useState(false);
    const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(user.avatar_url);

    const handleAvatarUpload = async (file: File) => {
        try {
            setUploadedAvatar(URL.createObjectURL(file));
            const formData = new FormData();
            formData.append("file", file);
            const res = await api.post("/v1/Hub/UserMe/UploadAvatar", formData);
            if (res.status === 200) window.location.reload();
        } catch {
            setUploadedAvatar(user.avatar_url ?? null);
        }
    };

    return (
        <Section icon={User} title="Профіль" description="Ваша особиста інформація">
            <AvatarProfilePhoto
                size="md"
                className="cursor-pointer"
                src={uploadedAvatar}
                onClick={() => setAvatarModal(true)}
                placeholderIcon={User}
            />

            <div className="grid grid-cols-2 gap-4">
                <Input label="Імʼя" isDisabled value={user.first_name || ""} icon={User} />
                {user.last_name && (
                    <Input label="Прізвище" isDisabled value={user.last_name} icon={User} />
                )}
            </div>

            {user.birthday && (
                <Input label="День народження" isDisabled value={safeDate(user.birthday)} icon={Cake} />
            )}

            <DialogTrigger isOpen={avatarModal} onOpenChange={setAvatarModal}>
                <ModalOverlay isDismissable>
                    <Modal>
                        <Dialog>
                            <div className="relative w-full overflow-hidden p-4 rounded-2xl bg-primary shadow-xl sm:max-w-120">
                                <FileUploadDropZone className="w-full" onDropFiles={(files) => handleAvatarUpload(files[0])} />
                            </div>
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>
        </Section>
    );
}

/* ─── Theme ─── */
function ThemeSection() {
    const { theme, setDark, setLight } = useTheme();
    const { enabled: pomodoroEnabled, toggle: togglePomodoro } = usePomodoroEnabled();

    return (
        <Section icon={Sun} title="Інтерфейс" description="Зовнішній вигляд системи">
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-fg-secondary">Тема оформлення</span>
                <ButtonGroup
                    className="w-full"
                    selectedKeys={[theme]}
                    onSelectionChange={(keys) => {
                        if (typeof keys === "string") return;
                        const selected = Array.from(keys)[0] as string;
                        if (selected === "dark") setDark();
                        if (selected === "light") setLight();
                    }}
                >
                    <ButtonGroupItem id="light" iconLeading={Sun} className="flex-1">Світла</ButtonGroupItem>
                    <ButtonGroupItem id="dark" iconLeading={Moon} className="flex-1">Темна</ButtonGroupItem>
                </ButtonGroup>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border-secondary p-3.5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Timer size={16} className="text-fg-brand-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-fg-primary">Pomodoro таймер</span>
                        <span className="text-xs text-fg-tertiary">25/5 хв у сайдбарі</span>
                    </div>
                </div>
                <Toggle size="md" isSelected={pomodoroEnabled} onChange={togglePomodoro} />
            </div>
        </Section>
    );
}

/* ─── Password ─── */
function PasswordSection() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

    const handleSubmit = async () => {
        setMessage(null);
        if (newPassword.length < 8) {
            setMessage({ type: "error", text: "Мінімум 8 символів" });
            return;
        }
        setSaving(true);
        try {
            const res = await api.post("/v1/Hub/UserMe/ChangePassword", {
                current_password: currentPassword,
                new_password: newPassword,
            });
            if (res.ok) {
                setMessage({ type: "ok", text: "Пароль змінено" });
                setCurrentPassword("");
                setNewPassword("");
            } else {
                const data = await res.json();
                const msg = data.detail === "invalid_current_password" ? "Невірний поточний пароль" : "Помилка";
                setMessage({ type: "error", text: msg });
            }
        } catch {
            setMessage({ type: "error", text: "Помилка зʼєднання" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Section icon={Lock} title="Пароль" description="Змініть пароль для входу">
            <div className="flex flex-col gap-3">
                <Input
                    type="password"
                    label="Поточний пароль"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    icon={Lock}
                />
                <Input
                    type="password"
                    label="Новий пароль"
                    placeholder="Мінімум 8 символів"
                    value={newPassword}
                    onChange={setNewPassword}
                    icon={Lock}
                />
                {message && (
                    <p className={`text-sm ${message.type === "ok" ? "text-fg-success-primary" : "text-fg-error-primary"}`}>
                        {message.text}
                    </p>
                )}
                <Button
                    onClick={handleSubmit}
                    isLoading={saving}
                    isDisabled={!currentPassword || !newPassword}
                    showTextWhileLoading
                    className="w-full"
                >
                    Змінити пароль
                </Button>
            </div>
        </Section>
    );
}

/* ─── Linked accounts ─── */
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

function AccountsSection({ user }: { user: MeUser }) {
    const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);

    const handleUnlink = async (provider: string) => {
        setUnlinkingProvider(provider);
        try {
            const res = await api.post(`/v1/Hub/UserMe/LinkedAccounts/Unlink/${provider}`);
            if (res.ok) window.location.reload();
        } finally {
            setUnlinkingProvider(null);
        }
    };

    const handleLink = (provider: string) => {
        if (provider === "telegram") {
            const botId = import.meta.env.VITE_TELEGRAM_BOT_ID ?? "";
            const state = JSON.stringify({ provider: "telegram", mode: "link" });
            const returnTo = `${window.location.origin}/auth/callback?state=${encodeURIComponent(state)}`;
            window.location.href = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(window.location.origin)}&request_access=write&return_to=${encodeURIComponent(returnTo)}`;
            return;
        }
        startOAuth(provider as "google" | "discord" | "roblox", "link");
    };

    return (
        <Section icon={Link2} title="Підключені акаунти" description="Привʼяжіть акаунти для швидкого входу">
            <div className="flex flex-col gap-3">
                {providers.map((p) => {
                    const isLinked = !!user[p.idField];
                    const username = user[p.usernameField] as string | null;

                    return (
                        <div key={p.key} className="flex items-center justify-between gap-3 rounded-xl border border-border-secondary p-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${p.color}`}>
                                    <p.Icon className={`size-4.5 ${p.iconColor}`} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-fg-primary text-sm font-medium">{p.label}</span>
                                    {isLinked ? (
                                        <span className="text-fg-tertiary text-xs truncate">{username}</span>
                                    ) : (
                                        <span className="text-fg-quaternary text-xs">Не привʼязано</span>
                                    )}
                                </div>
                            </div>
                            {isLinked ? (
                                <Button size="sm" color="secondary-destructive" isLoading={unlinkingProvider === p.key} onClick={() => handleUnlink(p.key)}>
                                    Відвʼязати
                                </Button>
                            ) : (
                                <Button size="sm" color="secondary" onClick={() => handleLink(p.key)}>
                                    Привʼязати
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </Section>
    );
}

/* ─── Badges ─── */
interface BadgeItem {
    id: string;
    name: string;
    emoji: string | null;
    description: string | null;
}

function BadgesSection() {
    const { user } = useAuth();
    const [myBadges, setMyBadges] = useState<BadgeItem[]>([]);
    const [activeEmoji, setActiveEmoji] = useState<string | null>(user?.active_badge_emoji ?? null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/v1/Hub/Badges/My").then(async (res) => {
            if (res.ok) setMyBadges(await res.json());
            setLoading(false);
        });
    }, []);

    const handleSetActive = async (badge: BadgeItem | null) => {
        const res = await api.post("/v1/Hub/Badges/SetActive", { badge_id: badge?.id ?? null });
        if (res.ok) {
            const data = await res.json();
            setActiveEmoji(data.active_badge_emoji ?? null);
        }
    };

    if (loading || myBadges.length === 0) return null;

    return (
        <Section icon={Award} title="Бейджики" description="Ваші досягнення та нагороди">
            <div className="flex flex-col gap-2">
                {myBadges.map((b) => {
                    const isActive = activeEmoji === b.emoji && b.emoji;
                    return (
                        <div
                            key={b.id}
                            className={`flex items-center gap-3 rounded-xl border p-3 transition-colors cursor-pointer ${isActive ? "border-brand-solid bg-brand-primary_alt" : "border-border-secondary hover:bg-secondary/30"
                                }`}
                            onClick={() => handleSetActive(isActive ? null : b)}
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-secondary bg-secondary text-lg">
                                {b.emoji || "🏅"}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm font-medium text-fg-primary">{b.name}</span>
                                {b.description && <span className="text-xs text-fg-tertiary truncate">{b.description}</span>}
                            </div>
                            {isActive && (
                                <span className="text-xs font-medium text-fg-brand-primary shrink-0">Активний</span>
                            )}
                        </div>
                    );
                })}
                <p className="text-xs text-fg-quaternary mt-1">Натисніть на бейджик щоб показувати його емодзі біля імені</p>
            </div>
        </Section>
    );
}

/* ─── Notifications ─── */
const notifyProviders = [
    { key: "discord" as const, label: "Discord", Icon: DiscordIcon, linkedField: "discord_id" as const, usernameField: "discord_username" as const, color: "bg-[#5865F2]" },
    { key: "telegram" as const, label: "Telegram", Icon: TelegramIcon, linkedField: "telegram_id" as const, usernameField: "telegram_username" as const, color: "bg-[#2AABEE]" },
];

function NotificationsSection({ user }: { user: MeUser }) {
    const [discordEnabled, setDiscordEnabled] = useState(user.notify_discord);
    const [telegramEnabled, setTelegramEnabled] = useState(user.notify_telegram);
    const [saving, setSaving] = useState(false);

    const toggle = async (provider: "discord" | "telegram", value: boolean) => {
        setSaving(true);
        const body = provider === "discord" ? { notify_discord: value } : { notify_telegram: value };
        const res = await api.post("/v1/Hub/UserMe/UpdateNotifySettings", body);
        if (res.ok) {
            if (provider === "discord") setDiscordEnabled(value);
            else setTelegramEnabled(value);
        }
        setSaving(false);
    };

    const enabled = { discord: discordEnabled, telegram: telegramEnabled };

    return (
        <Section icon={Bell} title="Сповіщення" description="Отримуйте сповіщення в месенджери">
            <div className="flex flex-col gap-3">
                {notifyProviders.map((p) => {
                    const linked = !!user[p.linkedField];
                    const username = user[p.usernameField] as string | null;

                    return (
                        <div key={p.key} className="flex items-center justify-between gap-3 rounded-xl border border-border-secondary p-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${p.color}`}>
                                    <p.Icon className="size-4.5 text-white" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-fg-primary text-sm font-medium">{p.label}</span>
                                    {linked ? (
                                        <span className="text-fg-tertiary text-xs truncate">{username}</span>
                                    ) : (
                                        <span className="text-fg-quaternary text-xs">Спочатку привʼяжіть акаунт</span>
                                    )}
                                </div>
                            </div>
                            <Toggle
                                size="md"
                                isSelected={enabled[p.key]}
                                isDisabled={!linked || saving}
                                onChange={(v) => toggle(p.key, v)}
                            />
                        </div>
                    );
                })}
            </div>
        </Section>
    );
}
