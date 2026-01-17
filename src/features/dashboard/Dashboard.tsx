import React, {useEffect, useState} from "react";
import { useAuth } from "@/core/auth/AuthContext";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";

import { FeedItem, type FeedItemType } from "@/shared/components/activity-feed/activity-feed";
import {Badge} from "@/shared/ui/badges/badges.tsx";
import {api} from "@/shared/utils/api.ts";
import {Dialog, DialogTrigger, Modal, ModalOverlay} from "@/shared/components/modals/modal.tsx";
import {CloseButton} from "@/shared/ui/buttons/close-button.tsx";
import {FeaturedIcon} from "@/shared/assets/icons/featured-icon/featured-icon.tsx";
import {BackgroundPattern} from "@/shared/assets/background-patterns";
import {Heading} from "react-aria-components";
import {Button} from "@/shared/ui/buttons/button.tsx";
import {Cake} from "lucide-react";
import {PinInput} from "@/shared/ui/pin-input/pin-input.tsx";

/* ===================== FEED DATA ===================== */

const feed: FeedItemType[] = [
    {
        id: "update-communication",
        unseen: false,
        date: "10 січня 2026",
        user: {
            avatarUrl: "https://cdn.visioncore.dev/avatars/ca0413d7-6fa1-4bda-99de-d6be805d7ddd_69d5b5fa-63cf-4ca7-a888-f4931efc74f1.jpg",
            name: "Кирило",
            href: "",
            badge: <Badge size="sm" color="brand">Генеральний директор</Badge>,
        },
        action: {
            content: "Тепер кожне питання має свій шлях: задачі, оплата, блокери, ідеї та стратегія. Визначено",
            target: "порядок звернень",
            href: "https://vcore.b-cdn.net/updates/communications-schema.png",
        },
        labels: [
            { name: "Процеси", color: "blue" },
            { name: "Комунікація", color: "indigo" },
        ],
    },
    {
        id: "update-structure",
        unseen: false,
        date: "07 січня 2026",
        user: {
            avatarUrl: "https://cdn.visioncore.dev/avatars/ca0413d7-6fa1-4bda-99de-d6be805d7ddd_69d5b5fa-63cf-4ca7-a888-f4931efc74f1.jpg",
            name: "Кирило",
            href: "",
            badge: <Badge size="sm" color="brand">Генеральний директор</Badge>,
        },
        action: {
            content: "Ми впровадили нову організаційну структуру з поділом на студії, ролі та зони відповідальності. Оновлено",
            target: "структуру компанії",
            href: "https://vcore.b-cdn.net/updates/company-structure.png",
        },
        labels: [
            { name: "Організація", color: "purple" },
            { name: "Процеси", color: "blue" },
        ]
    },
    {
        id: "update-projects",
        date: "18 грудня 2025",
        user: {
            avatarUrl: "https://cdn.visioncore.dev/avatars/ca0413d7-6fa1-4bda-99de-d6be805d7ddd_69d5b5fa-63cf-4ca7-a888-f4931efc74f1.jpg",
            name: "Кирило",
            href: "",
            badge: <Badge size="sm" color="brand">Генеральний директор</Badge>,
        },
        action: {
            content: "Актуалізовано список активних проєктів RoVision та Vision Web. Оновлено",
            target: "структуру проєктів",
            href: "https://vcore.b-cdn.net/updates/projects-structure.png",
        },
        labels: [
            { name: "RoVision", color: "brand" },
            { name: "Vision Web", color: "success" },
        ],
    },
];

/* ===================== FEED COMPONENT ===================== */

const ActivityFeedConnected: React.FC = () => {
    return (
        <ul className="space-y-0">
            {feed.map((item, index) => (
                <li key={item.id}>
                    <FeedItem
                        {...item}
                        connector={index !== feed.length - 1}
                    />
                </li>
            ))}
        </ul>
    );
};

/* ===================== DASHBOARD PAGE ===================== */

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [birthdayModal, setBirthdayModal] = useState(false);

    useEffect(() => {
        if (user && !user.birthday) {
            setBirthdayModal(true);
        }
    }, [user]);

    if (!user) {
        return <LoaderDots />;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <h2 className="text-xl font-semibold">
                Привіт,{" "}
                <span className="text-[#0a9a59] font-extrabold">
                    {user.first_name} {user.last_name || ""}
                </span>
            </h2>

            {/* Updates */}
            <div className="max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                        📰 Останні оновлення
                    </h3>
                </div>

                <ActivityFeedConnected />
            </div>

            <SubmitBirthdayModal isOpen={birthdayModal} setIsOpen={setBirthdayModal} />
        </div>
    );
};



interface CreateUserModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const SubmitBirthdayModal = ({ isOpen, setIsOpen }: CreateUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [, setError] = useState<string | null>(null);

    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");


    const clampDay = (value: string) => {
        if (!/^\d*$/.test(value)) return day;

        if (value.length === 1) {
            if (Number(value) > 3) return day;
        }

        if (value.length === 2) {
            const n = Number(value);
            if (n < 1 || n > 31) return day;
        }

        return value;
    };

    const clampMonth = (value: string) => {
        if (!/^\d*$/.test(value)) return month;

        if (value.length === 1) {
            if (Number(value) > 1) return "";
        }

        if (value.length === 2) {
            const n = Number(value);
            if (n < 1 || n > 12) return month;
        }

        return value;
    };

    const clampYear = (value: string) => {
        if (!/^\d*$/.test(value)) return year;

        if (value.length < 4) return value;

        const n = Number(value);
        if (n < 1990) return year;

        const currYear = new Date().getFullYear();

        if ((currYear - n) < 10) return year;

        return value;
    };

    const handleSubmit = async () => {
        if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
            setError("Введіть повну дату народження");
            return;
        }

        const birthday = `${year}-${month}-${day}`;

        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/v1/Hub/UserMe/SetBirthday", {
                birthday,
            });

            if (res.status == 200) {
                window.location.reload();
            } else {
                setIsOpen(false);
                setError("Не вдалося зберегти дату народження.");
            }
        } catch {
            setError("Не вдалося зберегти дату народження.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog className="overflow-hidden">
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl sm:max-w-172 lg:max-w-100">
                            <CloseButton onClick={() => setIsOpen(false)} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max max-sm:hidden">

                                    <FeaturedIcon color="gray" size="lg" theme="modern" icon={Cake} />
                                    <BackgroundPattern pattern="circle" size="sm" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <Heading slot="title" className="text-md font-semibold text-primary">
                                        День народження
                                    </Heading>
                                    <p className="text-sm text-tertiary">Поділись, коли ти народився, щоб ми могли тебе привітати всією командою.</p>
                                </div>
                            </div>

                            <div className="h-5 w-full" />
                            <div className="w-full border-t border-secondary" />
                            <div className="flex flex-col justify-start gap-4 px-4 pt-5 sm:px-6">
                                {/* День */}
                                <PinInput size="sm">
                                    <PinInput.Label>День</PinInput.Label>
                                    <PinInput.Group
                                        maxLength={2}
                                        value={day}
                                        onChange={(v) => setDay(clampDay(v))}
                                    >
                                        <PinInput.Slot index={0} />
                                        <PinInput.Slot index={1} />
                                    </PinInput.Group>
                                </PinInput>

                                {/* Місяць */}
                                <PinInput size="sm">
                                    <PinInput.Label>Місяць</PinInput.Label>
                                    <PinInput.Group
                                        maxLength={2}
                                        value={month}
                                        onChange={(v) => setMonth(clampMonth(v))}
                                    >
                                        <PinInput.Slot index={0} />
                                        <PinInput.Slot index={1} />
                                    </PinInput.Group>
                                </PinInput>

                                {/* Рік */}
                                <PinInput size="sm">
                                    <PinInput.Label>Рік</PinInput.Label>
                                    <PinInput.Group maxLength={4} value={year} onChange={(v) => setYear(clampYear(v))}>
                                        <PinInput.Slot index={0} />
                                        <PinInput.Slot index={1} />
                                        <PinInput.Slot index={2} />
                                        <PinInput.Slot index={3} />
                                    </PinInput.Group>
                                </PinInput>
                            </div>

                            <div className="z-10 flex flex-col pt-6 pb-4 sm:pt-8 sm:pb-6">
                                <div className="w-full border-t border-secondary" />

                                <div className="h-4 w-full sm:h-6" />
                                <div className="flex flex-1 flex-col-reverse gap-3 px-4 sm:grid sm:grid-cols-2 sm:px-6">
                                    <Button color="secondary" onClick={() => setIsOpen(false)}>
                                        Пропустити
                                    </Button>
                                    <Button color="primary" onClick={handleSubmit} isLoading={loading} showTextWhileLoading>
                                        Зберегти
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

export default DashboardPage;









