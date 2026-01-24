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
    TrendingUp,
    CheckCircle2,
    Target,
    Phone,
    MapPin,
    Briefcase,
    Award,
    Activity,
    Users,
    DollarSign,
    BarChart3,
    FileText,
    MessageSquare
} from "lucide-react";
import TransactionsListSection, {
    type TransactionItem
} from "../../finance/TransactionsListSection/TransactionsListSection";
import UserValue from "./UserValue/UserValue.tsx";
import BadgesSection from "./BadgesSection/BadgesSection.tsx";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { Select } from "@/shared/ui/select/select.tsx";
import { AvatarLabelGroup } from "@/shared/ui/avatar/avatar-label-group.tsx";
import type { Key } from "react-aria-components";
import { User01 } from "@untitledui/icons";
import { Avatar } from "@/shared/ui/avatar/avatar.tsx";

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

    const [selectedRole, setSelectedRole] = useState<Key | null>("");

    const [allUsers, setAllUsers] = useState<UserType[]>([]);

    const [showRoleChanger, setShowRoleChanger] = useState(false);
    const [editStructure, setEditStructure] = useState(false);

    const [loading, setLoading] = useState(true);
    const [changingRole, setChangingRole] = useState(false);

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
            setShowRoleChanger(false);
            setEditStructure(false);

            const res = await api.get(`/v1/Hub/Users/${id}/Details`);
            const data: Response = await res.json();

            setUser(data.user);

            setSupervisors(data.supervisors);
            setSubordinates(data.subordinates);

            setBadges(data.badges ?? []);
            setActions(data.actions ?? []);
            setTransactions(data.transactions ?? []);

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
        <Button color="link-color" onClick={() => navigate("/users/list")}>
            <ArrowLeft size={20} /> Назад до списку
        </Button>
    );

    if (!user || loading) return (
        <DefaultPage isLoading={loading}>
            {backButton}
            <p>Користувача не знайдено.</p>
        </DefaultPage>
    );

    return (
        <DefaultPage>
            {backButton}

            <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[300px_1fr_380px]">
                {/* Ліва колонка - Профіль */}
                <div className="flex flex-col gap-5">
                    {/* Основна картка профілю */}
                    <div className="flex flex-col items-center gap-5 rounded-xl border border-secondary bg-primary p-6 shadow-sm">
                        <div className="relative">
                            <Avatar
                                size="2xl"
                                src={user.avatar_url}
                            />
                            <div className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${user.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>

                        <div className="flex w-full flex-col items-center gap-1">
                            <h1 className="m-0 text-center text-xl font-semibold">
                                {user.first_name} {user.last_name}
                            </h1>
                            <p className="text-sm text-tertiary">{user.role?.name || "—"}</p>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-tertiary">
                                <Clock size={14} />
                                <span>Остання активність: {safeDatetime(user.last_login) || "—"}</span>
                            </div>
                        </div>

                        <BadgesSection badges={badges} />

                        {/* Швидкі дії */}
                        <div className="flex w-full flex-col gap-3">
                            {(actions.includes("change_role") && showRoleChanger) && (
                                <div className="flex flex-col items-center gap-3">
                                    <Select
                                        value={selectedRole}
                                        onChange={(value) => setSelectedRole(value)}
                                        placeholder="Виберіть роль"
                                        className="w-full"
                                    >
                                        {roles.map((role) => (
                                            <Select.Item key={role.id} id={role.id} label={role.name} />
                                        ))}
                                    </Select>
                                    <Button
                                        color="secondary"
                                        onClick={handleChangeRole}
                                        disabled={changingRole}
                                        isLoading={changingRole}
                                        showTextWhileLoading
                                        className="w-full"
                                    >
                                        Змінити роль
                                    </Button>
                                    <Button
                                        className="w-full"
                                        color="secondary"
                                        onClick={() => setShowRoleChanger(false)}
                                        disabled={changingRole}
                                    >
                                        Скасувати
                                    </Button>
                                </div>
                            )}

                            {(actions.includes("change_role") && !showRoleChanger) && (
                                <Button onClick={() => setShowRoleChanger(!showRoleChanger)}>
                                    Змінити роль
                                </Button>
                            )}
                            {actions.includes("change_org_structure") && (
                                <Button onClick={() => setEditStructure(!editStructure)} color={editStructure ? "secondary" : "primary"}>
                                    Редагувати структуру
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
                            <Activity size={18} className="text-brand-600" />
                            <h3 className="m-0 text-base font-semibold">Статистика активності</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <StatItem icon={CheckCircle2} label="Завершено задач" value="47" trend="+12%" />
                            <StatItem icon={Target} label="Активних задач" value="8" />
                            <StatItem icon={Users} label="Проектів" value="5" />
                            <StatItem icon={TrendingUp} label="Продуктивність" value="94%" trend="+5%" />
                        </div>
                    </div>
                </div>

                {/* Центральна колонка - Детальна інформація */}
                <div className="flex flex-col gap-6">
                    {/* Контактна інформація */}
                    <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Mail size={18} className="text-brand-600" />
                            <h3 className="m-0 text-base font-semibold">Контактна інформація</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InfoItem icon={Mail} label="Email" value={user.email} />
                            <InfoItem icon={Phone} label="Телефон" value="+380 (67) 123-45-67" />
                            <InfoItem icon={MapPin} label="Локація" value="Київ, Україна" />
                            <InfoItem icon={Briefcase} label="Відділ" value="Development Team" />
                        </div>
                    </section>

                    {/* Особиста інформація */}
                    <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-brand-600" />
                            <h3 className="m-0 text-base font-semibold">Особиста інформація</h3>
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
                            <UserValue label="Часовий пояс" value="UTC+2 (Київ)" />
                            <UserValue label="Мова" value="Українська" />
                        </div>
                    </section>

                    {/* Фінансова інформація */}
                    <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <DollarSign size={18} className="text-brand-600" />
                            <h3 className="m-0 text-base font-semibold">Фінанси</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <FinanceCard label="Поточний баланс" value={user.balance} />
                            <FinanceCard label="Виведено" value={user.withdrawn_amount} />
                            <FinanceCard label="Загалом заробив" value={user.balance + user.withdrawn_amount} highlight />
                        </div>
                    </section>

                    {/* Показники ефективності */}
                    <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <BarChart3 size={18} className="text-brand-600" />
                            <h3 className="m-0 text-base font-semibold">Показники ефективності</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <PerformanceMetric label="Середній час виконання" value="2.3 дні" />
                            <PerformanceMetric label="Якість роботи" value="4.8/5.0" />
                            <PerformanceMetric label="Дотримання дедлайнів" value="92%" />
                            <PerformanceMetric label="Рейтинг команди" value="#3 з 24" />
                        </div>
                    </section>

                    {/* Остання активність */}
                    <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-brand-600" />
                            <h3 className="m-0 text-base font-semibold">Остання активність</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            <ActivityItem
                                action="Завершив задачу"
                                title="Реалізація нового UI компонента"
                                time="2 години тому"
                                type="task"
                            />
                            <ActivityItem
                                action="Додав коментар до"
                                title="Обговорення архітектури проекту"
                                time="5 годин тому"
                                type="comment"
                            />
                            <ActivityItem
                                action="Створив нову задачу"
                                title="Оптимізація продуктивності"
                                time="1 день тому"
                                type="task"
                            />
                            <ActivityItem
                                action="Завантажив файл до"
                                title="Документація API"
                                time="2 дні тому"
                                type="file"
                            />
                        </div>
                    </section>
                </div>

                {/* Права колонка - Структура та транзакції */}
                <div className="flex flex-col gap-6">
                    {(supervisors.length > 0 || subordinates.length > 0) && (
                        <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Users size={18} className="text-brand-600" />
                                <h3 className="m-0 text-base font-semibold">Організаційна структура</h3>
                            </div>

                            <UsersGroup
                                title="Керівники"
                                users={supervisors}
                                actions={actions}
                                editStructure={editStructure}
                                handleRemoveUser={handleRemoveSupervisor}
                            />

                            <UsersGroup
                                title="Підлеглі"
                                users={subordinates}
                                actions={actions}
                                editStructure={editStructure}
                                handleRemoveUser={handleRemoveSubordinate}
                            />

                            {/* Додавання, якщо можна */}
                            {(actions.includes("change_org_structure") && editStructure) && (
                                <div className="mt-4 flex flex-col gap-3">
                                    <AddUser placeholder="Додати керівника" allUsers={allUsers} handleAdd={handleAddSupervisor} user={user} />
                                    <AddUser placeholder="Додати підлеглого" allUsers={allUsers} handleAdd={handleAddSubordinate} user={user} />
                                </div>
                            )}
                        </section>
                    )}

                    <TransactionsListSection transactions={transactions} />
                </div>
            </div>
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
                <Icon size={16} className="text-brand-600" />
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
            ? 'border-brand-200 bg-brand-50/50 hover:bg-brand-50'
            : 'border-secondary bg-secondary/30 hover:bg-secondary/50'
        }`}>
        <span className="text-xs font-medium text-tertiary">{label}</span>
        <span className={`text-xl font-bold ${highlight ? 'text-brand-700' : 'text-primary'}`}>
            {value.toLocaleString()} ₴
        </span>
    </div>
);

interface PerformanceMetricProps {
    label: string;
    value: string;
}

const PerformanceMetric = ({ label, value }: PerformanceMetricProps) => (
    <div className="flex items-center justify-between rounded-lg border border-secondary bg-secondary/30 px-4 py-3 transition-all hover:bg-secondary/50">
        <span className="text-sm text-tertiary">{label}</span>
        <span className="text-sm font-semibold text-primary">{value}</span>
    </div>
);

interface ActivityItemProps {
    action: string;
    title: string;
    time: string;
    type: 'task' | 'comment' | 'file';
}

const ActivityItem = ({ action, title, time, type }: ActivityItemProps) => {
    const getIcon = () => {
        switch (type) {
            case 'task': return CheckCircle2;
            case 'comment': return MessageSquare;
            case 'file': return FileText;
        }
    };

    const Icon = getIcon();

    return (
        <div className="flex gap-3 rounded-lg border border-secondary bg-secondary/30 p-3 transition-all hover:bg-secondary/50">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                <Icon size={14} className="text-brand-600" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-sm text-primary">
                    <span className="text-tertiary">{action}</span> <span className="font-medium">{title}</span>
                </p>
                <span className="text-xs text-tertiary">{time}</span>
            </div>
        </div>
    );
};

interface AddUserProps {
    placeholder: string;
    allUsers: UserType[];
    handleAdd: (userId: Key | null) => void;
    user: UserType;
}
const AddUser = ({ placeholder, allUsers, handleAdd, user }: AddUserProps) => {
    return (
        <Select
            onChange={(value) => handleAdd(value)}
            placeholder={placeholder}
            placeholderIcon={User01}
        >
            {allUsers
                .filter(u => u.id !== user.id && u.is_active)
                .map(u => (
                    <Select.Item key={u.id} id={u.id} supportingText={u.role?.name} avatarUrl={u.avatar_url}>
                        {u.first_name} {u.last_name}
                    </Select.Item>
                )
                )}
        </Select>
    )
}


interface UsersGroupProps {
    title: string;
    users: UserType[];
    actions: string[];
    editStructure: boolean;
    handleRemoveUser: (userId: string) => void;
}

const UsersGroup = ({ title, users, actions, editStructure, handleRemoveUser }: UsersGroupProps) => {
    const navigate = useNavigate();
    if (users.length === 0) return null;
    return (
        <div className="flex flex-col gap-2.5">
            <p className="font-semibold text-primary">{title}</p>
            <div className="flex flex-col gap-4">
                {users.map((u) => (
                    <div key={u.id} className="flex gap-2">
                        <AvatarLabelGroup size="lg" title={`${u.first_name} ${u.last_name || ""}`} subtitle={u.role?.name || ""} src={u.avatar_url} className="cursor-pointer"
                            onClick={() => navigate(`/users/u/${u.id}`)}
                        />

                        {(actions.includes("change_org_structure") && editStructure) && (
                            <Button
                                color="primary-destructive"
                                onClick={() => handleRemoveUser(u.id)}
                                iconLeading={X}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserDetailsPage;
