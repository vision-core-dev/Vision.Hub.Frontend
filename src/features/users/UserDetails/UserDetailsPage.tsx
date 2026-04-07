import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api.ts";
import { safeDate, safeDatetime } from "@/shared/utils/safeDate.ts";
import type { UserType } from "@/shared/types/Users.ts";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import {
    ArrowLeft,
    X,
    Mail,
    Calendar,
    Clock,
    CheckCircle2,
    Target,
    Users,
    DollarSign,
    ListTodo,
    ChevronRight,
    Settings,
    Activity,
    Link2,
    ExternalLink,
    Award,
    KeyRound,
    Copy,
    Check,
} from "lucide-react";
import { GoogleIcon, DiscordIcon, TelegramIcon, RobloxIcon } from "@/shared/assets/icons/oauth-icons";
import TransactionsListSection, {
    type TransactionItem
} from "../../finance/TransactionsListSection/TransactionsListSection";
import UserValue from "./UserValue/UserValue.tsx";
import BadgesSection from "./BadgesSection/BadgesSection.tsx";
import UserActivitySection from "./UserActivitySection.tsx";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { Select } from "@/shared/ui/select/select.tsx";
import { AvatarLabelGroupWithDropdown } from "@/shared/ui/avatar";
import type { Key } from "react-aria-components";
import { User01 } from "@untitledui/icons";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal";
import { isOnline } from "@/shared/utils/users-utils.ts";
import { CloseButton } from "@/shared/ui/buttons/close-button.tsx";
import { NativeSelect } from "@/shared/ui/select/select-native.tsx";
import { Tabs } from "@/shared/components/tabs/tabs.tsx";
import FilePreviewModal from "@/features/drive/FilePreviewModal.tsx";

export interface Badge {
    id: string;
    name: string;
    description?: string;
    icon_url?: string;
    emoji?: string;
    awarded_at: string;
}

export interface Role {
    id: string;
    name: string;
    order: number;
}

interface Response {
    ok: boolean;
    user: UserType;
    actions: string[];
    supervisors: UserType[];
    subordinates: UserType[];
    transactions: TransactionItem[];
    badges: Badge[];
    tasks: UserTask[];
    tasks_total_completed: number;
    tasks_total_active: number;
}

// Task interface for user tasks
export interface UserTask {
    id: string;
    name: string;
    list_name?: string;
    deadline_at?: string;
    board_id: string;
    status: string; // backend status string: backlog, in_progress, review, done
}

const UserDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserType | null>(null);
    const [actions, setActions] = useState<string[]>([]);
    const [supervisors, setSupervisors] = useState<UserType[]>([]);
    const [subordinates, setSubordinates] = useState<UserType[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [tasks, setTasks] = useState<UserTask[]>([]); // Store all tasks
    const [activeTasks, setActiveTasks] = useState<UserTask[]>([]); // Filtered for preview
    const [taskStats, setTaskStats] = useState({ completed: 0, active: 0 });

    // ... (other states)
    const [selectedRole, setSelectedRole] = useState<Key | null>("");

    const [allUsers, setAllUsers] = useState<UserType[]>([]);

    const [loading, setLoading] = useState(true);
    const [changingRole, setChangingRole] = useState(false);

    // Modal states
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
    const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [resetPasswordResult, setResetPasswordResult] = useState<string | null>(null);

    // Transactions pagination
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const TRANSACTIONS_PREVIEW_COUNT = 5;

    // ... (handlers)
    const handleDeactivate = async () => {
        await api.post(`/v1/Hub/Users/${user?.id}/Deactivate`);
        refreshUserData()
    };

    const handleActivate = async () => {
        await api.post(`/v1/Hub/Users/${user?.id}/Activate`);
        refreshUserData()
    };

    const refreshUserData = async () => {
        try {
            setLoading(true);

            const res = await api.get(`/v1/Hub/Users/${id}/Details`);
            const data: Response = await res.json();

            setUser(data.user);

            setSupervisors(data.supervisors);
            setSubordinates(data.subordinates);

            setBadges(data.badges ?? []);
            setActions(data.actions ?? []);
            setTransactions(data.transactions ?? []);
            setTaskStats({
                completed: data.tasks_total_completed,
                active: data.tasks_total_active
            });

            const allTasks = data.tasks ?? [];
            setTasks(allTasks);

            // Filter for Active Tasks preview (excluding done)
            // Limit to 4 for the preview card
            const active = allTasks
                .filter(t => t.status !== 'done')
                .sort((a, b) => {
                    // Sort by deadline (nearest first), nulls last
                    if (!a.deadline_at) return 1;
                    if (!b.deadline_at) return -1;
                    return new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime();
                })
                .slice(0, 4);

            setActiveTasks(active);

            if (data.user?.role?.id) {
                setSelectedRole(data.user.role.id);
            }

        } finally {
            setLoading(false);
        }
    };

    // 📥 Завантаження користувача
    useEffect(() => {
        refreshUserData();
        api.get(`/v1/Hub/Users/List`).then(async (res) => {
            if (res.ok) {
                const data = await res.json();
                setAllUsers(data.list);
            }
        });
    }, [id]);

    // 📥 Якщо можна змінювати роль — вантажимо доступні
    useEffect(() => {
        if (actions.includes("change_role")) {
            api.get(`/v1/Hub/UserRoles/MyLowerRoles`).then(async (res) => {
                if (res.ok) {
                    const data: Role[] = await res.json();
                    setRoles(data);
                }
            });
        }
    }, [actions]);

    const handleChangeRole = async () => {
        if (!selectedRole) return;
        setChangingRole(true);
        await api.post(
            `/v1/Hub/Users/${user?.id}/ChangeRole/${selectedRole}`
        );
        setChangingRole(false);
        setIsRoleModalOpen(false);
        refreshUserData();
    };

    const handleAddSupervisor = async (supervisorId: Key | null) => {
        await api.post(`/v1/Hub/Users/${user?.id}/Supervisors/Add/${supervisorId}`);
        refreshUserData()
    };

    const handleRemoveSupervisor = async (supervisorId: string) => {
        await api.post(`/v1/Hub/Users/${user?.id}/Supervisors/Remove/${supervisorId}`);
        refreshUserData()
    };

    const handleAddSubordinate = async (subordinateId: Key | null) => {
        await api.post(`/v1/Hub/Users/${user?.id}/Subordinates/Add/${subordinateId}`);
        refreshUserData()
    };

    const handleRemoveSubordinate = async (subordinateId: string) => {
        await api.post(`/v1/Hub/Users/${user?.id}/Subordinates/Remove/${subordinateId}`);
        refreshUserData()
    };


    const getAge = (birthday: string | number | Date | undefined) => {
        if (!birthday) return null;
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return <span className="text-tertiary">({age} років)</span>;
    };

    const backButton = (
        <Button color="link-color" onClick={() => navigate("/users/list")} iconLeading={ArrowLeft}>
            Назад до списку
        </Button>
    );

    if (!user || loading) return (
        <DefaultPage isLoading={loading}>
            {backButton}
            <p>Користувача не знайдено.</p>
        </DefaultPage>
    );

    const displayedTransactions = showAllTransactions
        ? transactions
        : transactions.slice(0, TRANSACTIONS_PREVIEW_COUNT);

    return (
        <DefaultPage>
            {backButton}

            <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[300px_1fr_380px]">
                {/* Ліва колонка - Профіль */}
                <div className="flex flex-col gap-5">
                    {/* Основна картка профілю */}
                    <div className="flex flex-col gap-5 rounded-xl border border-secondary bg-primary p-6 shadow-sm">
                        <AvatarLabelGroupWithDropdown
                            size="xl"
                            title={`${user.first_name} ${user.last_name || ""}`}
                            subtitle={user.role?.name || ""}
                            badgeEmoji={user.active_badge_emoji}
                            src={user.avatar_url}
                            status={isOnline(user.last_login) ? "online" : "offline"}
                            userId={user.id}
                            disableDropdown
                            onAvatarClick={() => setIsAvatarModalOpen(true)}
                        />

                        {user.avatar_url && (
                            <FilePreviewModal
                                isOpen={isAvatarModalOpen}
                                onClose={() => setIsAvatarModalOpen(false)}
                                url={user.avatar_url}
                                name={`${user.first_name} ${user.last_name || ""}`}
                                type="file"
                            />
                        )}

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-tertiary">
                            <Clock size={14} />
                            <span>Остання активність: {safeDatetime(user.last_login) || "—"}</span>
                        </div>

                        <BadgesSection badges={badges} />

                        {actions.includes("give_badge") && (
                            <Button
                                color="secondary"
                                iconLeading={Award}
                                className="w-full"
                                onClick={async () => {
                                    const res = await api.get("/v1/Hub/Badges/List");
                                    if (res.ok) setAllBadges(await res.json());
                                    setIsBadgeModalOpen(true);
                                }}
                            >
                                Керувати бейджиками
                            </Button>
                        )}

                        {/* Швидкі дії */}
                        <div className="flex w-full flex-col gap-3">
                            {actions.includes("change_role") && (
                                <Button onClick={() => setIsRoleModalOpen(true)} iconLeading={Settings}>
                                    Змінити роль
                                </Button>
                            )}
                            {actions.includes("change_org_structure") && (
                                <Button onClick={() => setIsStructureModalOpen(true)} iconLeading={Users}>
                                    Редагувати структуру
                                </Button>
                            )}
                            {actions.includes("reset_password") && (
                                <Button
                                    color="secondary"
                                    iconLeading={KeyRound}
                                    onClick={async () => {
                                        if (!window.confirm(`Скинути пароль для ${user.first_name} ${user.last_name || ""}? Старий пароль буде втрачено.`)) return;
                                        const res = await api.post(`/v1/Hub/Users/${user.id}/ResetPassword`);
                                        if (res.ok) {
                                            const data = await res.json();
                                            setResetPasswordResult(data.new_password);
                                        }
                                    }}
                                >
                                    Скинути пароль
                                </Button>
                            )}
                            {user.is_active ? (
                                <Button color="primary-destructive" onClick={handleDeactivate}>Деактивувати</Button>
                            ) : (
                                <Button onClick={handleActivate}>Активувати</Button>
                            )}
                        </div>
                    </div>

                    {/* Статистика активності */}
                    <div className="rounded-xl border border-secondary bg-primary p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-fg-brand-primary" />
                            <h3 className="m-0 text-base font-semibold text-primary">Статистика активності</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <StatItem icon={CheckCircle2} label="Завершено задач" value={taskStats.completed.toString()} />
                            <StatItem icon={Target} label="Активних задач" value={taskStats.active.toString()} />
                            {/* <StatItem icon={Users} label="Проектів" value="5" />
                            <StatItem icon={TrendingUp} label="Продуктивність" value="94%" trend="+5%" /> */}
                        </div>
                    </div>
                </div>

                {/* Центральна колонка - Детальна інформація */}
                <div className="flex flex-col gap-6">
                    {/* Активні задачі */}
                    <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ListTodo size={18} className="text-fg-brand-primary" />
                                <h3 className="m-0 text-base font-semibold text-primary">Активні задачі</h3>
                            </div>
                            <Button
                                color="link-color"
                                size="sm"
                                onClick={() => setIsTasksModalOpen(true)}
                                iconTrailing={ChevronRight}
                            >
                                Більше
                            </Button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {activeTasks.length === 0 ? (
                                <p className="text-sm text-tertiary">Немає активних задач</p>
                            ) : (
                                activeTasks.map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                ))
                            )}
                        </div>
                    </section>

                    {/* Контактна інформація */}
                    <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Mail size={18} className="text-fg-brand-primary" />
                            <h3 className="m-0 text-base font-semibold text-primary">Контактна інформація</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InfoItem icon={Mail} label="Email" value={user.email} />
                            {/* <InfoItem icon={Phone} label="Телефон" value="+380 (67) 123-45-67" /> */}
                            {/* <InfoItem icon={MapPin} label="Локація" value="Київ, Україна" />
                            <InfoItem icon={Briefcase} label="Відділ" value="Development Team" /> */}
                        </div>
                    </section>

                    {/* Підключені акаунти */}
                    <LinkedAccountsSection user={user} />

                    {/* Особиста інформація */}
                    <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-fg-brand-primary" />
                            <h3 className="m-0 text-base font-semibold text-primary">Особиста інформація</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <UserValue
                                label="День народження"
                                value={
                                    <span>
                                        {safeDate(user.birthday)} {getAge(user.birthday)}
                                    </span>
                                }
                            />
                            <UserValue label="Дата реєстрації" value={safeDatetime(user.created_at)} />
                        </div>
                    </section>

                    {/* Фінансова інформація */}
                    <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <DollarSign size={18} className="text-fg-brand-primary" />
                            <h3 className="m-0 text-base font-semibold text-primary">Фінанси</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <FinanceCard label="Поточний баланс" value={user.balance} />
                            <FinanceCard label="Виведено" value={user.withdrawn_amount} />
                            <FinanceCard label="Загалом заробив" value={user.balance + user.withdrawn_amount} highlight />
                        </div>
                    </section>

                    {/* Показники ефективності */}
                    {/* <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <BarChart3 size={18} className="text-fg-brand-primary" />
                            <h3 className="m-0 text-base font-semibold">Показники ефективності</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <PerformanceMetric label="Середній час виконання" value="2.3 дні" />
                            <PerformanceMetric label="Якість роботи" value="4.8/5.0" />
                            <PerformanceMetric label="Дотримання дедлайнів" value="92%" />
                            <PerformanceMetric label="Рейтинг команди" value="#3 з 24" />
                        </div>
                    </section> */}

                    {/* Остання активність */}
                    <UserActivitySection userId={user.id} />
                </div>

                {/* Права колонка - Структура та транзакції */}
                <div className="flex flex-col gap-6">
                    {(supervisors.length > 0 || subordinates.length > 0) && (
                        <section className="flex flex-col gap-4 rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-fg-brand-primary" />
                                <h3 className="m-0 text-base font-semibold text-primary">Організаційна структура</h3>
                            </div>

                            <UsersGroup
                                title="Керівники"
                                users={supervisors}
                            />

                            <UsersGroup
                                title="Підлеглі"
                                users={subordinates}
                            />
                        </section>
                    )}

                    {/* Транзакції з пагінацією */}
                    {transactions.length > 0 && (
                        <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <DollarSign size={18} className="text-fg-brand-primary" />
                                <h3 className="m-0 text-base font-semibold text-primary">Транзакції</h3>
                            </div>
                            <TransactionsListSection transactions={displayedTransactions} />
                            {transactions.length > TRANSACTIONS_PREVIEW_COUNT && !showAllTransactions && (
                                <Button
                                    color="link-color"
                                    className="mt-4 w-full"
                                    onClick={() => setShowAllTransactions(true)}
                                >
                                    Показати більше ({transactions.length - TRANSACTIONS_PREVIEW_COUNT})
                                </Button>
                            )}
                        </section>
                    )}
                </div>
            </div>

            {/* Модалка зміни ролі */}
            <RoleChangeModal
                isOpen={isRoleModalOpen}
                onOpenChange={setIsRoleModalOpen}
                roles={roles}
                selectedRole={selectedRole}
                onRoleChange={setSelectedRole}
                onSave={handleChangeRole}
                isLoading={changingRole}
            />

            {/* Модалка редагування структури */}
            <StructureEditModal
                isOpen={isStructureModalOpen}
                onOpenChange={setIsStructureModalOpen}
                supervisors={supervisors}
                subordinates={subordinates}
                allUsers={allUsers}
                currentUser={user}
                onAddSupervisor={handleAddSupervisor}
                onRemoveSupervisor={handleRemoveSupervisor}
                onAddSubordinate={handleAddSubordinate}
                onRemoveSubordinate={handleRemoveSubordinate}
            />

            {/* Модалка всіх задач */}
            <TasksModal
                isOpen={isTasksModalOpen}
                onOpenChange={setIsTasksModalOpen}
                userId={user.id}
                userName={`${user.first_name} ${user.last_name || ''}`}
                tasks={tasks}
            />

            {/* Модалка бейджиків */}
            <BadgeManageModal
                isOpen={isBadgeModalOpen}
                onOpenChange={setIsBadgeModalOpen}
                userId={user.id}
                userBadges={badges}
                allBadges={allBadges}
                onUpdate={refreshUserData}
            />

            {/* Password reset result */}
            <DialogTrigger isOpen={!!resetPasswordResult} onOpenChange={(open) => { if (!open) setResetPasswordResult(null); }}>
                <ModalOverlay isDismissable>
                    <Modal>
                        <Dialog>
                            <PasswordResetResult password={resetPasswordResult!} onClose={() => setResetPasswordResult(null)} />
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>
        </DefaultPage>
    );
};

// Helper Components
interface StatItemProps {
    icon: React.ElementType;
    label: string;
    value: string;
    trend?: string;
}

const StatItem = ({ icon: Icon, label, value, trend }: StatItemProps) => (
    <div className="flex items-center justify-between rounded-lg border border-secondary bg-secondary/30 px-3 py-2.5 transition-all hover:bg-secondary/50">
        <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <Icon size={16} className="text-brand-tertiary" />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-tertiary">{label}</span>
                <span className="text-sm font-semibold text-primary">{value}</span>
            </div>
        </div>
        {trend && (
            <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
            </span>
        )}
    </div>
);

interface TaskItemProps {
    task: UserTask;
}

const TaskItem = ({ task }: TaskItemProps) => {
    const isDone = task.status === 'done';
    const isOverdue = !isDone && task.deadline_at && new Date(task.deadline_at) < new Date();

    const getStatusColor = () => {
        if (isOverdue) return 'text-fg-error-primary bg-bg-error-primary border-red';
        if (isDone) return 'text-tertiary bg-secondary border-secondary opacity-70';
        return 'text-primary bg-secondary/30 border-secondary';
    };

    return (
        <div className={`flex items-center justify-between rounded-lg border p-3 transition-all hover:bg-secondary/50 ${getStatusColor()}`}>
            <div className="flex flex-col gap-0.5 flex-1">
                <span className={`text-sm font-medium ${isDone ? 'line-through text-tertiary' : ''}`}>{task.name}</span>
                <span className="text-xs text-tertiary">{task.list_name}</span>
            </div>
            {task.deadline_at && (
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-tertiary'}`}>
                    <Clock size={12} />
                    <span>{safeDatetime(task.deadline_at)}</span>
                </div>
            )}
        </div>
    );
};

interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value: string;
}

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => (
    <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary/50">
            <Icon size={16} className="text-tertiary" />
        </div>
        <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-tertiary">{label}</span>
            <span className="text-sm font-medium text-primary">{value}</span>
        </div>
    </div>
);

interface FinanceCardProps {
    label: string;
    value: number;
    highlight?: boolean;
}

const FinanceCard = ({ label, value, highlight }: FinanceCardProps) => (
    <div className={`flex flex-col gap-1.5 rounded-lg border p-4 transition-all ${highlight
        ? 'border-brand-solid bg-secondary'
        : 'border-secondary bg-secondary/30 hover:bg-secondary/50'
        }`}>
        <span className="text-xs font-medium text-tertiary">{label}</span>
        <span className={`text-xl font-bold ${highlight ? 'text-fg-brand-primary' : 'text-primary'}`}>
            {value.toLocaleString()} ₴
        </span>
    </div>
);

// interface PerformanceMetricProps {
//     label: string;
//     value: string;
// }

// const PerformanceMetric = ({ label, value }: PerformanceMetricProps) => (
//     <div className="flex items-center justify-between rounded-lg border border-secondary bg-secondary/30 px-4 py-3 transition-all hover:bg-secondary/50">
//         <span className="text-sm text-tertiary">{label}</span>
//         <span className="text-sm font-semibold text-primary">{value}</span>
//     </div>
// );


//     action: string;
//     title: string;
//     time: string;
//     type: 'task' | 'comment' | 'file';
// }

// const ActivityItem = ({ action, title, time, type }: ActivityItemProps) => {
//     const getIcon = () => {
//         switch (type) {
//             case 'task': return CheckCircle2;
//             case 'comment': return MessageSquare;
//             case 'file': return FileText;
//         }
//     };

//     const Icon = getIcon();

//     return (
//         <div className="flex gap-3 rounded-lg border border-secondary bg-secondary/30 p-3 transition-all hover:bg-secondary/50">
//             <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
//                 <Icon size={14} className="text-brand-600" />
//             </div>
//             <div className="flex flex-1 flex-col gap-0.5">
//                 <p className="text-sm text-primary">
//                     <span className="text-tertiary">{action}</span> <span className="font-medium">{title}</span>
//                 </p>
//                 <span className="text-xs text-tertiary">{time}</span>
//             </div>
//         </div>
//     );
// };

interface UsersGroupProps {
    title: string;
    users: UserType[];
}

const UsersGroup = ({ title, users }: UsersGroupProps) => {
    const navigate = useNavigate();
    if (users.length === 0) return null;
    return (
        <div className="flex flex-col gap-2.5">
            <p className="font-semibold text-primary">{title}</p>
            <div className="flex flex-col gap-3">
                {users.map((u) => (
                    <AvatarLabelGroupWithDropdown
                        key={u.id}
                        size="md"
                        title={`${u.first_name} ${u.last_name || ""}`}
                        subtitle={u.role?.name || ""}
                        badgeEmoji={u.active_badge_emoji}
                        src={u.avatar_url}
                        userId={u.id}
                        onViewProfile={() => navigate(`/users/u/${u.id}`)}
                        className="cursor-pointer hover:bg-secondary/30 rounded-lg p-2 -m-2 transition-colors"
                    />
                ))}
            </div>
        </div>
    );
}

// Modal Components
interface RoleChangeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    roles: Role[];
    selectedRole: Key | null;
    onRoleChange: (role: Key | null) => void;
    onSave: () => void;
    isLoading: boolean;
}

const RoleChangeModal = ({ isOpen, onOpenChange, roles, selectedRole, onRoleChange, onSave, isLoading }: RoleChangeModalProps) => (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalOverlay isDismissable>
            <Modal>
                <Dialog>
                    <div className="relative w-full max-w-[300px] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-primary shadow-2xl p-6 gap-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-primary">Змінити роль</h2>
                            <CloseButton onClick={() => onOpenChange(false)} />
                        </div>

                        <Select
                            value={selectedRole}
                            onChange={onRoleChange}
                            placeholder="Виберіть роль"
                            className="w-full"
                        >
                            {roles.map((role) => (
                                <Select.Item key={role.id} id={role.id} label={role.name} />
                            ))}
                        </Select>

                        <div className="flex gap-3 justify-end">
                            <Button color="secondary" onClick={() => onOpenChange(false)}>
                                Скасувати
                            </Button>
                            <Button
                                onClick={onSave}
                                disabled={isLoading || !selectedRole}
                                isLoading={isLoading}
                            >
                                Зберегти
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    </DialogTrigger>
);

interface StructureEditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    supervisors: UserType[];
    subordinates: UserType[];
    allUsers: UserType[];
    currentUser: UserType;
    onAddSupervisor: (id: Key | null) => void;
    onRemoveSupervisor: (id: string) => void;
    onAddSubordinate: (id: Key | null) => void;
    onRemoveSubordinate: (id: string) => void;
}

const StructureEditModal = ({
    isOpen,
    onOpenChange,
    supervisors,
    subordinates,
    allUsers,
    currentUser,
    onAddSupervisor,
    onRemoveSupervisor,
    onAddSubordinate,
    onRemoveSubordinate
}: StructureEditModalProps) => {
    const navigate = useNavigate();

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-primary shadow-2xl p-6 gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-primary">Редагувати структуру</h2>
                                <CloseButton onClick={() => onOpenChange(false)} />
                            </div>

                            {/* Керівники */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-base font-semibold text-primary">Керівники</h3>
                                {supervisors.map((u) => (
                                    <div key={u.id} className="flex items-center gap-2">
                                        <AvatarLabelGroupWithDropdown
                                            size="md"
                                            title={`${u.first_name} ${u.last_name || ""}`}
                                            subtitle={u.role?.name || ""}
                                            src={u.avatar_url}
                                            userId={u.id}
                                            onViewProfile={() => navigate(`/users/u/${u.id}`)}
                                            className="flex-1 cursor-pointer"
                                        />
                                        <Button
                                            color="primary-destructive"
                                            onClick={() => onRemoveSupervisor(u.id)}
                                            iconLeading={X}
                                        />
                                    </div>
                                ))}
                                <Select
                                    onChange={onAddSupervisor}
                                    placeholder="Додати керівника"
                                    placeholderIcon={User01}
                                >
                                    {allUsers
                                        .filter(u => u.id !== currentUser.id && u.is_active && !supervisors.find(s => s.id === u.id))
                                        .map(u => (
                                            <Select.Item key={u.id} id={u.id} supportingText={u.role?.name} avatarUrl={u.avatar_url}>
                                                {u.first_name} {u.last_name}
                                            </Select.Item>
                                        ))}
                                </Select>
                            </div>

                            {/* Підлеглі */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-base font-semibold text-primary">Підлеглі</h3>
                                {subordinates.map((u) => (
                                    <div key={u.id} className="flex items-center gap-2">
                                        <AvatarLabelGroupWithDropdown
                                            size="lg"
                                            title={`${u.first_name} ${u.last_name || ""}`}
                                            subtitle={u.role?.name || ""}
                                            src={u.avatar_url}
                                            userId={u.id}
                                            onViewProfile={() => navigate(`/users/u/${u.id}`)}
                                            className="flex-1 cursor-pointer"
                                        />
                                        <Button
                                            color="primary-destructive"
                                            onClick={() => onRemoveSubordinate(u.id)}
                                            iconLeading={X}
                                        />
                                    </div>
                                ))}
                                <Select
                                    onChange={onAddSubordinate}
                                    placeholder="Додати підлеглого"
                                    placeholderIcon={User01}
                                >
                                    {allUsers
                                        .filter(u => u.id !== currentUser.id && u.is_active && !subordinates.find(s => s.id === u.id))
                                        .map(u => (
                                            <Select.Item key={u.id} id={u.id} supportingText={u.role?.name} avatarUrl={u.avatar_url}>
                                                {u.first_name} {u.last_name}
                                            </Select.Item>
                                        ))}
                                </Select>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={() => onOpenChange(false)}>
                                    Готово
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

interface TasksModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userName: string;
    tasks: UserTask[];
}

const TasksModal = ({ isOpen, onOpenChange, tasks }: TasksModalProps) => {
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');

    const getTaskStatus = (task: UserTask) => {
        if (task.status === 'done') return 'completed';
        if (task.deadline_at && new Date(task.deadline_at) < new Date()) return 'overdue';
        return 'active';
    };

    const filteredTasks = tasks.filter(task => {
        const computedStatus = getTaskStatus(task);
        if (filter === 'all') return true;
        return computedStatus === filter;
    });

    const counts = {
        all: tasks.length,
        active: tasks.filter(t => getTaskStatus(t) === 'active').length,
        completed: tasks.filter(t => getTaskStatus(t) === 'completed').length,
        overdue: tasks.filter(t => getTaskStatus(t) === 'overdue').length
    };

    const FILTER_TABS = [
        { id: "all", label: `Всі`, badge: counts.all },
        { id: "active", label: `Активні`, badge: counts.active },
        { id: "completed", label: `Завершені`, badge: counts.completed },
        { id: "overdue", label: `Просрочені`, badge: counts.overdue },
    ];

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay isDismissable>
                <Modal className="max-w-3xl">
                    <Dialog>
                        <div className="relative w-full max-w-[900px] min-h-[40vh] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-primary shadow-2xl p-6 gap-6">

                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-primary">Задачі користувача</h2>
                                <CloseButton onClick={() => onOpenChange(false)} />
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                <NativeSelect
                                    value={filter as string}
                                    onChange={(e) => setFilter(e.target.value as any)}
                                    options={FILTER_TABS.map(tab => ({
                                        label: `${tab.label} (${tab.badge})`,
                                        value: tab.id,
                                    }))}
                                    className="md:hidden"
                                />

                                <Tabs selectedKey={filter} onSelectionChange={(key) => setFilter(key as any)} className="max-md:hidden">
                                    <Tabs.List type="underline" items={FILTER_TABS}>
                                        {(tab) => <Tabs.Item {...tab} />}
                                    </Tabs.List>
                                </Tabs>
                            </div>

                            <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                                {filteredTasks.length === 0 ? (
                                    <p className="text-center text-tertiary">Немає задач</p>
                                ) : (
                                    filteredTasks.map((task) => (
                                        <TaskItem key={task.id} task={task} />
                                    ))
                                )}
                            </div>

                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger >
    );
};

const linkedAccountsConfig = [
    {
        key: "google",
        label: "Google",
        Icon: GoogleIcon,
        color: "bg-white border border-border-primary",
        iconClass: "",
        idField: "google_id" as const,
        nameField: "google_email" as const,
        getLink: null,
    },
    {
        key: "discord",
        label: "Discord",
        Icon: DiscordIcon,
        color: "bg-[#5865F2]",
        iconClass: "text-white",
        idField: "discord_id" as const,
        nameField: "discord_username" as const,
        getLink: (id: string) => `https://discord.com/users/${id}`,
    },
    {
        key: "telegram",
        label: "Telegram",
        Icon: TelegramIcon,
        color: "bg-[#2AABEE]",
        iconClass: "text-white",
        idField: "telegram_id" as const,
        nameField: "telegram_username" as const,
        getLink: (_: string, username?: string) => username ? `https://t.me/${username}` : null,
    },
    {
        key: "roblox",
        label: "Roblox",
        Icon: RobloxIcon,
        color: "bg-[#E2231A]",
        iconClass: "text-white",
        idField: "roblox_id" as const,
        nameField: "roblox_username" as const,
        getLink: (id: string) => `https://www.roblox.com/users/${id}/profile`,
    },
];

const LinkedAccountsSection = ({ user }: { user: UserType }) => {
    const linked = linkedAccountsConfig.filter((p) => user[p.idField]);
    if (linked.length === 0) return null;

    return (
        <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <Link2 size={18} className="text-fg-brand-primary" />
                <h3 className="m-0 text-base font-semibold text-primary">Підключені акаунти</h3>
            </div>
            <div className="flex flex-col gap-2.5">
                {linked.map((p) => {
                    const username = user[p.nameField] as string | undefined;
                    const id = user[p.idField] as string;
                    const link = p.getLink?.(id, username ?? undefined);

                    return (
                        <div key={p.key} className="flex items-center gap-3">
                            <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${p.color}`}>
                                <p.Icon className={`size-4 ${p.iconClass}`} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs text-tertiary">{p.label}</span>
                                <span className="text-sm font-medium text-primary truncate">
                                    {username || id}
                                </span>
                            </div>
                            {link && (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto shrink-0 text-fg-quaternary hover:text-fg-brand-primary transition-colors"
                                >
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

// Badge management modal
const BadgeManageModal = ({ isOpen, onOpenChange, userId, userBadges, allBadges, onUpdate }: {
    isOpen: boolean;
    onOpenChange: (v: boolean) => void;
    userId: string;
    userBadges: Badge[];
    allBadges: Badge[];
    onUpdate: () => void;
}) => {
    const [loading, setLoading] = useState<string | null>(null);
    const userBadgeIds = new Set(userBadges.map(b => b.id));

    const handleAward = async (badgeId: string) => {
        setLoading(badgeId);
        await api.post("/v1/Hub/Badges/Award", { user_id: userId, badge_id: badgeId });
        onUpdate();
        setLoading(null);
    };

    const handleRevoke = async (badgeId: string) => {
        setLoading(badgeId);
        await api.post("/v1/Hub/Badges/Revoke", { user_id: userId, badge_id: badgeId });
        onUpdate();
        setLoading(null);
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full max-w-[480px] max-h-[80vh] flex flex-col rounded-2xl bg-primary shadow-xl p-6 gap-4">
                            <CloseButton onClick={() => onOpenChange(false)} className="absolute top-4 right-4" />
                            <h2 className="text-lg font-semibold text-fg-primary">Бейджики користувача</h2>

                            <div className="flex flex-col gap-2 overflow-y-auto">
                                {allBadges.length === 0 && (
                                    <p className="text-sm text-fg-tertiary">Бейджиків ще немає. Створіть на сторінці /users/badges</p>
                                )}
                                {allBadges.map((b) => {
                                    const has = userBadgeIds.has(b.id);
                                    return (
                                        <div key={b.id} className="flex items-center gap-3 rounded-xl border border-border-secondary p-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-secondary bg-secondary text-lg">
                                                {b.emoji || "🏅"}
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="text-sm font-medium text-fg-primary">{b.name}</span>
                                                {b.description && <span className="text-xs text-fg-tertiary truncate">{b.description}</span>}
                                            </div>
                                            {has ? (
                                                <Button size="sm" color="secondary-destructive" isLoading={loading === b.id} onClick={() => handleRevoke(b.id)}>
                                                    Забрати
                                                </Button>
                                            ) : (
                                                <Button size="sm" color="primary" isLoading={loading === b.id} onClick={() => handleAward(b.id)}>
                                                    Дати
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

const PasswordResetResult = ({ password, onClose }: { password: string; onClose: () => void }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative w-full max-w-[360px] rounded-2xl bg-primary shadow-xl p-6 flex flex-col gap-4">
            <CloseButton onClick={onClose} className="absolute top-4 right-4" />

            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-secondary">
                    <KeyRound size={20} className="text-fg-success-primary" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-fg-primary">Пароль скинуто</h3>
                    <p className="text-sm text-fg-tertiary">Збережіть або передайте користувачу</p>
                </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border-secondary bg-secondary/30 p-3">
                <code className="flex-1 text-base font-mono font-semibold text-fg-primary select-all">{password}</code>
                <button
                    onClick={handleCopy}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary hover:bg-secondary_hover transition-colors cursor-pointer"
                >
                    {copied ? <Check size={14} className="text-fg-success-primary" /> : <Copy size={14} className="text-fg-quaternary" />}
                </button>
            </div>

            <p className="text-xs text-fg-quaternary">Пароль показується лише один раз</p>
        </div>
    );
};

export default UserDetailsPage;
