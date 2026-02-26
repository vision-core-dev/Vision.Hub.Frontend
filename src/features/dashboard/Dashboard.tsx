import React, { useEffect, useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";

import { FeedItem, type FeedItemType } from "@/shared/components/activity-feed/activity-feed";
import { Badge } from "@/shared/ui/badges/badges.tsx";
import { api } from "@/shared/utils/api.ts";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal.tsx";
import { CloseButton } from "@/shared/ui/buttons/close-button.tsx";
import { FeaturedIcon } from "@/shared/assets/icons/featured-icon/featured-icon.tsx";
import { BackgroundPattern } from "@/shared/assets/background-patterns";
import { Heading } from "react-aria-components";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { Cake } from "lucide-react";
import { PinInput } from "@/shared/ui/pin-input/pin-input.tsx";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, SquareCheckBig, Kanban } from "lucide-react";
import { getTextColor } from "@/shared/utils/colors.ts";
import { safeDate } from "@/shared/utils/safeDate.ts";
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

/* ===================== MY TASKS COMPONENT ===================== */

interface ActiveTask {
    id: string;
    name: string;
    board_id: string;
    board_name: string | null;
    list_id: string;
    status: string;
    started_at: string | null;
    deadline_at: string | null;
    tags: { id: string; name: string; color: string }[];
    subtasks_total: number;
    subtasks_completed: number;
}

const MyTasksConnected: React.FC = () => {
    const [tasks, setTasks] = useState<ActiveTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await api.get("/v1/Hub/UserMe/Tasks/Active");
                if (res.ok) {
                    const data = await res.json();
                    setTasks(data);
                }
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    if (loading) {
        return (
            <div className="p-4 bg-primary rounded-xl border border-secondary flex justify-center">
                <LoaderDots />
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-primary rounded-xl border border-secondary text-tertiary">
                <CheckCircle2 className="w-8 h-8 mb-2" />
                <p>У вас немає активних задач.</p>
            </div>
        );
    }

    return (
        <ul className="space-y-3">
            {tasks.map((task) => (
                <li key={task.id}>
                    <Link
                        to={`/boards/b/${task.board_id}/t/${task.id}`}
                        className="flex flex-col gap-2 p-4 bg-primary hover:bg-secondary rounded-xl border border-secondary transition-colors"
                    >
                        {(task.tags && task.tags.length > 0) && (
                            <div className="flex flex-wrap gap-1.5 mb-0.5">
                                {task.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="px-2 py-0.5 rounded-md text-[11px] font-medium leading-tight"
                                        style={{ backgroundColor: tag.color, color: getTextColor(tag.color) }}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                        <span className="font-medium text-primary text-sm sm:text-base leading-snug">{task.name}</span>
                        {(task.board_name || task.deadline_at || task.started_at || task.subtasks_total > 0) && (
                            <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-tertiary">
                                {task.board_name && (
                                    <div className="flex items-center gap-1.5">
                                        <Kanban className="w-3.5 h-3.5" />
                                        <span>{task.board_name}</span>
                                    </div>
                                )}
                                {(task.deadline_at || task.started_at) && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>
                                            {task.started_at && safeDate(task.started_at)}
                                            {task.started_at && task.deadline_at ? " – " : ""}
                                            {task.deadline_at && safeDate(task.deadline_at)}
                                        </span>
                                    </div>
                                )}
                                {(task.subtasks_total > 0) && (
                                    <div className="flex items-center gap-1.5">
                                        <SquareCheckBig className="w-3.5 h-3.5" />
                                        <span>{task.subtasks_completed}/{task.subtasks_total}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </Link>
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

            {/* Updates and Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* My Tasks */}
                <div className="order-1 lg:order-1 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        ✅ Мої задачі
                    </h3>
                    <MyTasksConnected />
                </div>

                {/* Updates */}
                <div className="order-2 lg:order-2 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        📰 Останні оновлення
                    </h3>
                    <ActivityFeedConnected />
                </div>

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









