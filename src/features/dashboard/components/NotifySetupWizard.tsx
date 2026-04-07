import { useState } from "react";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { FeaturedIcon } from "@/shared/assets/icons/featured-icon/featured-icon";
import { BackgroundPattern } from "@/shared/assets/background-patterns";
import { Button } from "@/shared/ui/buttons/button";
import { Heading } from "react-aria-components";
import { Bell, Check, ArrowRight } from "lucide-react";
import { DiscordIcon, TelegramIcon } from "@/shared/assets/icons/oauth-icons";
import { startOAuth } from "@/core/auth/oauth";
import { api } from "@/shared/utils/api";
import type { MeUser } from "@/shared/types/AuthUser";

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    user: MeUser;
}

type Step = "intro" | "choose" | "connect-discord" | "connect-telegram" | "done";

export default function NotifySetupWizard({ isOpen, setIsOpen, user }: Props) {
    const [step, setStep] = useState<Step>("intro");
    const [enabling, setEnabling] = useState(false);

    const hasDiscord = !!user.discord_id;
    const hasTelegram = !!user.telegram_id;

    const handleConnectDiscord = () => {
        startOAuth("discord", "link");
    };

    const handleConnectTelegram = () => {
        const botId = import.meta.env.VITE_TELEGRAM_BOT_ID ?? "";
        const state = JSON.stringify({ provider: "telegram", mode: "link" });
        const returnTo = `${window.location.origin}/auth/callback?state=${encodeURIComponent(state)}`;
        window.location.href = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${encodeURIComponent(window.location.origin)}&request_access=write&return_to=${encodeURIComponent(returnTo)}`;
    };

    const enableNotifications = async (provider: "discord" | "telegram") => {
        setEnabling(true);
        const body = provider === "discord"
            ? { notify_discord: true }
            : { notify_telegram: true };
        await api.post("/v1/Hub/UserMe/UpdateNotifySettings", body);
        setEnabling(false);
        setStep("done");
    };

    const skip = () => {
        localStorage.setItem("notify_setup_skipped", "true");
        setIsOpen(false);
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog className="overflow-hidden">
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl sm:max-w-[440px]">
                            <CloseButton onClick={() => setIsOpen(false)} theme="light" size="lg" className="absolute top-3 right-3 z-10" />

                            <div className="flex flex-col gap-4 px-6 pt-6">
                                <div className="relative w-max max-sm:hidden">
                                    <FeaturedIcon color="brand" size="lg" theme="modern" icon={Bell} />
                                    <BackgroundPattern pattern="circle" size="sm" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="px-6 pt-4 pb-6">
                                {step === "intro" && (
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <Heading slot="title" className="text-lg font-semibold text-primary">
                                                Не пропускай нічого важливого
                                            </Heading>
                                            <p className="text-sm text-tertiary mt-1">
                                                Підключи сповіщення в месенджер і будь завжди в курсі подій.
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2.5 rounded-xl bg-secondary/30 p-4">
                                            <Feature text="Призначення та зміни в задачах" />
                                            <Feature text="Нагадування за 1 день та 1 годину до дедлайну" />
                                            <Feature text="Нарахування та фінансові операції" />
                                            <Feature text="Запрошення на події та зміни часу" />
                                        </div>

                                        <p className="text-xs text-fg-quaternary">Налаштування займе менше хвилини</p>

                                        <div className="flex gap-3 pt-2">
                                            <Button color="secondary" className="flex-1" onClick={skip}>
                                                Пізніше
                                            </Button>
                                            <Button className="flex-1" iconTrailing={ArrowRight} onClick={() => setStep("choose")}>
                                                Налаштувати
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {step === "choose" && (
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <Heading slot="title" className="text-lg font-semibold text-primary">
                                                Оберіть месенджер
                                            </Heading>
                                            <p className="text-sm text-tertiary mt-1">
                                                Куди надсилати сповіщення?
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={() => hasDiscord ? enableNotifications("discord") : setStep("connect-discord")}
                                                className="flex items-center gap-4 rounded-xl border border-border-secondary p-4 hover:bg-primary_hover transition-colors cursor-pointer text-left"
                                            >
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#5865F2]">
                                                    <DiscordIcon className="size-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-fg-primary">Discord</p>
                                                    <p className="text-xs text-fg-tertiary">
                                                        {hasDiscord ? `Підключено: ${user.discord_username}` : "Потрібно привʼязати акаунт"}
                                                    </p>
                                                </div>
                                                <ArrowRight size={16} className="text-fg-quaternary" />
                                            </button>

                                            <button
                                                onClick={() => hasTelegram ? enableNotifications("telegram") : setStep("connect-telegram")}
                                                className="flex items-center gap-4 rounded-xl border border-border-secondary p-4 hover:bg-primary_hover transition-colors cursor-pointer text-left"
                                            >
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#2AABEE]">
                                                    <TelegramIcon className="size-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-fg-primary">Telegram</p>
                                                    <p className="text-xs text-fg-tertiary">
                                                        {hasTelegram ? `Підключено: ${user.telegram_username}` : "Потрібно привʼязати акаунт"}
                                                    </p>
                                                </div>
                                                <ArrowRight size={16} className="text-fg-quaternary" />
                                            </button>
                                        </div>

                                        <Button color="link-gray" onClick={skip} className="self-center">
                                            Пропустити
                                        </Button>
                                    </div>
                                )}

                                {step === "connect-discord" && (
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <Heading slot="title" className="text-lg font-semibold text-primary">
                                                Привʼяжіть Discord
                                            </Heading>
                                            <p className="text-sm text-tertiary mt-1">
                                                Після авторизації ви повернетесь сюди і сповіщення увімкнуться автоматично.
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button color="secondary" className="flex-1" onClick={() => setStep("choose")}>
                                                Назад
                                            </Button>
                                            <Button className="flex-1" onClick={handleConnectDiscord} iconLeading={DiscordIcon}>
                                                Підключити Discord
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {step === "connect-telegram" && (
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <Heading slot="title" className="text-lg font-semibold text-primary">
                                                Привʼяжіть Telegram
                                            </Heading>
                                            <p className="text-sm text-tertiary mt-1">
                                                Після авторизації ви повернетесь сюди і сповіщення увімкнуться автоматично.
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button color="secondary" className="flex-1" onClick={() => setStep("choose")}>
                                                Назад
                                            </Button>
                                            <Button className="flex-1" onClick={handleConnectTelegram} iconLeading={TelegramIcon}>
                                                Підключити Telegram
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {step === "done" && (
                                    <div className="flex flex-col gap-4 items-center text-center">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-secondary">
                                            <Check size={28} className="text-fg-success-primary" />
                                        </div>
                                        <div>
                                            <Heading slot="title" className="text-lg font-semibold text-primary">
                                                Готово!
                                            </Heading>
                                            <p className="text-sm text-tertiary mt-1">
                                                Сповіщення увімкнено. Тепер ви не пропустите жодної важливої події.
                                            </p>
                                        </div>
                                        <Button className="w-full mt-2" onClick={() => { setIsOpen(false); window.location.reload(); }}>
                                            Чудово
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

function Feature({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-solid">
                <Check size={12} className="text-white" />
            </div>
            <span className="text-sm text-fg-secondary">{text}</span>
        </div>
    );
}
