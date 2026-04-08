import React, { useEffect, useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";
import { EmptyState } from "@/shared/ui/application/empty-state/empty-state";

import { FeedItem } from "@/shared/components/activity-feed/activity-feed";
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
import Leaderboard from "./components/Leaderboard.tsx";
import BadgeTimeline from "./components/BadgeTimeline.tsx";
import NotifySetupWizard from "./components/NotifySetupWizard.tsx";
import { getUnfinishedForm } from "@/features/forms/SubmitForm/SubmitForm";
import ProfileCard from "./components/ProfileCard";
import { FileText } from "lucide-react";
import { Edit01, Trash01, Plus } from "@untitledui/icons";
import { TextEditor } from "@/shared/ui/text-editor/text-editor.tsx";
import { toast } from "sonner";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
/* ===================== FEED COMPONENT ===================== */

interface NewsItem {
    id: string;
    title: string | null;
    content: string;
    labels: string[];
    target_text: string | null;
    target_url: string | null;
    created_at: string;
    author: {
        id: string;
        first_name: string;
        last_name: string | null;
        avatar_url: string | null;
    };
}

const ActivityFeedConnected: React.FC<{ initialNews?: NewsItem[] }> = ({ initialNews }) => {
    const { role } = useAuth();
    const [news, setNews] = useState<NewsItem[]>(initialNews || []);
    const [loading, setLoading] = useState(!initialNews);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

    const canManageNews = role && role.order <= 1;

    const fetchNews = async () => {
        try {
            const res = await api.get("/v1/Hub/News/List");
            if (res.ok) {
                const data = await res.json();
                setNews(data.items);
            }
        } catch (error) {
            console.error("Failed to fetch news", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!initialNews) fetchNews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Ви впевнені, що хочете видалити цю новину?")) return;
        try {
            const res = await api.delete(`/v1/Hub/News/${id}/Delete`);
            if (res.ok) {
                toast.success("Новину видалено");
                fetchNews();
            }
        } catch (error) {
            toast.error("Помилка при видаленні");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <LoaderDots />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    📰 Останні оновлення
                </h3>
                {canManageNews && (
                    <Button 
                        size="sm" 
                        color="secondary" 
                        onClick={() => setIsCreateModalOpen(true)}
                        iconLeading={<Plus className="w-4 h-4" />}
                    >
                        Додати
                    </Button>
                )}
            </div>

            {news.length === 0 ? (
                <div className="bg-primary rounded-xl border border-secondary py-8 mt-4">
                    <EmptyState size="sm">
                        <EmptyState.Content>
                            <EmptyState.Title>Новин поки немає</EmptyState.Title>
                            <EmptyState.Description>
                                Останні оновлення та новини з'являться тут.
                            </EmptyState.Description>
                        </EmptyState.Content>
                    </EmptyState>
                </div>
            ) : (
                <ul className="space-y-0 mt-4">
                    {news.map((item, index) => (
                    <li key={item.id}>
                        <FeedItem
                            id={item.id}
                            date={format(new Date(item.created_at), "d MMMM yyyy", { locale: uk })}
                            user={{
                                name: `${item.author.first_name} ${item.author.last_name || ""}`,
                                avatarUrl: item.author.avatar_url || "",
                                href: "#",
                            }}
                            labels={item.labels.map(l => ({ name: l, color: "blue" }))}
                            action={item.target_text ? {
                                content: item.title || "",
                                target: item.target_text,
                                href: item.target_url || "#"
                            } : undefined}
                            message={
                                <div 
                                    className="prose prose-sm dark:prose-invert max-w-none text-secondary" 
                                    dangerouslySetInnerHTML={{ __html: item.content }} 
                                />
                            }
                            connector={index !== news.length - 1}
                            extraActions={canManageNews ? (
                                <>
                                    <button 
                                        onClick={() => setEditingNews(item)}
                                        className="p-1 hover:bg-secondary rounded-md text-tertiary transition-colors"
                                    >
                                        <Edit01 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1 hover:bg-error-secondary rounded-md text-tertiary hover:text-error transition-colors"
                                    >
                                        <Trash01 className="w-4 h-4" />
                                    </button>
                                </>
                            ) : undefined}
                        />
                    </li>
                ))}
            </ul>
            )}

            <NewsModal 
                isOpen={isCreateModalOpen || !!editingNews} 
                setIsOpen={(open) => {
                    setIsCreateModalOpen(open);
                    if (!open) setEditingNews(null);
                }}
                news={editingNews}
                onSuccess={() => {
                    fetchNews();
                    setIsCreateModalOpen(false);
                    setEditingNews(null);
                }}
            />
        </div>
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

const MyTasksConnected: React.FC<{ initialTasks?: ActiveTask[] }> = ({ initialTasks }) => {
    const [tasks, setTasks] = useState<ActiveTask[]>(initialTasks || []);
    const [loading, setLoading] = useState(!initialTasks);

    useEffect(() => {
        if (initialTasks) return;
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
            <div className="bg-primary rounded-xl border border-secondary py-8">
                <EmptyState size="sm">
                    <EmptyState.Header pattern="circle">
                        <EmptyState.FeaturedIcon icon={CheckCircle2} color="success" />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>Все виконано!</EmptyState.Title>
                        <EmptyState.Description>У вас немає активних задач.</EmptyState.Description>
                    </EmptyState.Content>
                </EmptyState>
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

interface DashboardData {
    tasks: ActiveTask[];
    leaderboard: any[];
    badge_awards: any[];
    news: NewsItem[];
    positions: any[];
    supervisors: any[];
    subordinates: any[];
}

const DashboardPage: React.FC = () => {
    const { user, role } = useAuth();
    const [birthdayModal, setBirthdayModal] = useState(false);
    const [notifySetup, setNotifySetup] = useState(false);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [modalsChecked, setModalsChecked] = useState(false);

    useEffect(() => {
        api.get("/v1/Hub/UserMe/Dashboard/Get").then(async (res) => {
            if (res.ok) setData(await res.json());
            setLoading(false);
        });
    }, []);

    // Show modals only after dashboard loaded
    useEffect(() => {
        if (!user || loading || modalsChecked) return;
        setModalsChecked(true);

        if (!user.birthday) {
            setBirthdayModal(true);
            return;
        }

        const hasWorkingNotify = (user.notify_discord && user.discord_id) || (user.notify_telegram && user.telegram_id);
        const skipped = localStorage.getItem("notify_setup_skipped") === "true";
        if (!hasWorkingNotify && !skipped) {
            setNotifySetup(true);
        }
    }, [user, loading]);

    const unfinishedForm = getUnfinishedForm();

    if (!user || loading) return <LoaderDots />;

    return (
        <div className="p-6 space-y-6">
            {/* Unfinished form banner */}
            {unfinishedForm && (
                <Link
                    to={`/form/${unfinishedForm.slug}/submit`}
                    className="flex items-center gap-3 rounded-xl border border-border-brand bg-brand-primary_alt px-4 py-3 transition-colors hover:bg-brand-secondary"
                >
                    <FileText size={18} className="text-fg-brand-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-fg-brand-primary">Незавершене опитування</p>
                        <p className="text-xs text-fg-tertiary truncate">{unfinishedForm.title}</p>
                    </div>
                    <span className="text-xs font-medium text-fg-brand-primary shrink-0">Продовжити →</span>
                </Link>
            )}

            <h2 className="text-xl font-semibold text-primary">
                Привіт,{" "}
                <span className="text-[#0a9a59] dark:text-fg-success-primary font-extrabold">
                    {user.first_name} {user.last_name || ""}
                </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
                <div className="flex flex-col gap-4">
                    {role && (
                        <ProfileCard
                            user={user}
                            role={role}
                            positions={data?.positions || []}
                            supervisors={data?.supervisors || []}
                            subordinates={data?.subordinates || []}
                        />
                    )}
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        ✅ Мої задачі
                    </h3>
                    <MyTasksConnected initialTasks={data?.tasks} />
                </div>

                <div className="flex flex-col gap-8">
                    <Leaderboard initialItems={data?.leaderboard} />
                    <BadgeTimeline initialAwards={data?.badge_awards} />
                </div>

                <div className="flex flex-col gap-4">
                    <ActivityFeedConnected initialNews={data?.news} />
                </div>
            </div>

            <SubmitBirthdayModal isOpen={birthdayModal} setIsOpen={setBirthdayModal} />
            {user && <NotifySetupWizard isOpen={notifySetup} setIsOpen={setNotifySetup} user={user} />}
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
        if (n < 1970) return year;

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
                                        onChange={(v: string) => setDay(clampDay(v))}
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
                                        onChange={(v: string) => setMonth(clampMonth(v))}
                                    >
                                        <PinInput.Slot index={0} />
                                        <PinInput.Slot index={1} />
                                    </PinInput.Group>
                                </PinInput>

                                {/* Рік */}
                                <PinInput size="sm">
                                    <PinInput.Label>Рік</PinInput.Label>
                                    <PinInput.Group maxLength={4} value={year} onChange={(v: string) => setYear(clampYear(v))}>
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


interface NewsModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    news: NewsItem | null;
    onSuccess: () => void;
}

const NewsModal = ({ isOpen, setIsOpen, news, onSuccess }: NewsModalProps) => {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [labels, setLabels] = useState("");
    const [targetText, setTargetText] = useState("");
    const [targetUrl, setTargetUrl] = useState("");

    useEffect(() => {
        if (news) {
            setContent(news.content);
            setTitle(news.title || "");
            setLabels(news.labels.join(", "));
            setTargetText(news.target_text || "");
            setTargetUrl(news.target_url || "");
        } else {
            setContent("");
            setTitle("");
            setLabels("");
            setTargetText("");
            setTargetUrl("");
        }
    }, [news, isOpen]);

    const handleSubmit = async () => {
        if (!content) {
            toast.error("Вміст новини не може бути порожнім");
            return;
        }

        setLoading(true);
        try {
            const data = {
                title,
                content,
                labels: labels.split(",").map(l => l.trim()).filter(l => l),
                target_text: targetText,
                target_url: targetUrl
            };

            const url = news ? `/v1/Hub/News/${news.id}/Update` : "/v1/Hub/News/Create";
            const res = news 
                ? await api.patch(url, data)
                : await api.post(url, data);

            if (res.ok) {
                toast.success(news ? "Новину оновлено" : "Новину створено");
                onSuccess();
            } else {
                toast.error("Помилка при збереженні");
            }
        } catch (error) {
            toast.error("Сталася помилка");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog className="overflow-hidden">
                        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-primary shadow-xl">
                            <CloseButton onClick={() => setIsOpen(false)} theme="light" size="lg" className="absolute top-3 right-3" />
                            
                            <div className="p-6">
                                <Heading slot="title" className="text-xl font-semibold text-primary mb-6">
                                    {news ? "Редагувати новину" : "Створити новину"}
                                </Heading>

                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-secondary">Заголовок</label>
                                        <input 
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Напр. Оновлення системи"
                                            className="w-full px-3 py-2 bg-primary border border-secondary rounded-lg text-primary focus:ring-2 focus:ring-brand outline-hidden"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-secondary">Теги (через кому)</label>
                                        <input 
                                            value={labels}
                                            onChange={(e) => setLabels(e.target.value)}
                                            placeholder="Процеси, Комунікація"
                                            className="w-full px-3 py-2 bg-primary border border-secondary rounded-lg text-primary focus:ring-2 focus:ring-brand outline-hidden"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium text-secondary">Зміст новини</label>
                                        <div className="min-h-[200px] border border-secondary rounded-lg overflow-hidden">
                                            <TextEditor.Root 
                                                content={content}
                                                onUpdate={({ editor }) => setContent(editor.getHTML())}
                                            >
                                                <div className="border-b border-secondary p-1">
                                                    <TextEditor.Toolbar type="simple" />
                                                </div>
                                                <TextEditor.Content className="min-h-[150px] p-4 focus:outline-hidden" />
                                            </TextEditor.Root>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-secondary">Текст посилання</label>
                                            <input 
                                                value={targetText}
                                                onChange={(e) => setTargetText(e.target.value)}
                                                placeholder="Детальніше"
                                                className="w-full px-3 py-2 bg-primary border border-secondary rounded-lg text-primary focus:ring-2 focus:ring-brand outline-hidden"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-secondary">URL посилання</label>
                                            <input 
                                                value={targetUrl}
                                                onChange={(e) => setTargetUrl(e.target.value)}
                                                placeholder="https://..."
                                                className="w-full px-3 py-2 bg-primary border border-secondary rounded-lg text-primary focus:ring-2 focus:ring-brand outline-hidden"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 p-6 bg-secondary/30 border-t border-secondary">
                                <Button color="secondary" onClick={() => setIsOpen(false)}>
                                    Скасувати
                                </Button>
                                <Button color="primary" onClick={handleSubmit} isLoading={loading} showTextWhileLoading>
                                    Зберегти
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};









