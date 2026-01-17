import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api.ts";
import styles from "./UserDetailsPage.module.css";
import { safeDate, safeDatetime } from "@/shared/utils/safeDate.ts";
import type { UserType } from "@/shared/types/Users.ts";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import { ArrowLeft, X } from "lucide-react";
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
        return <span className={styles.age}>({age} років)</span>;
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

            <div className={styles.layout}>
                {/* Ліва колонка */}
                <div className={styles.left}>
                    <img src={user.avatar_url} className={styles.avatarBig} />

                    <h1 className={styles.name}>
                        {user.first_name} {user.last_name}
                    </h1>
                    <p className={styles.role}>{user.role?.name || "—"}</p>

                    <BadgesSection badges={badges} />

                    <div className={styles.actionsBlock}>

                        {(actions.includes("change_role") && showRoleChanger) && (
                            <div className={styles.roleChanger}>
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

                {/* Права колонка */}
                <div className={styles.right}>
                    <section className={styles.section}>
                        <h3>Основне</h3>
                        <div className={styles.grid}>
                            <UserValue label="Email" value={user.email} />
                            <UserValue
                                label="День народження"
                                value={
                                    <span>
                                        {safeDate(user.birthday)} {getAge(user.birthday)}
                                    </span>
                                }
                            />
                            <UserValue label="Остання активність" value={safeDatetime(user.last_login)} />
                            <UserValue label="Зареєстрований" value={safeDatetime(user.created_at)} />
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h3>Фінанси</h3>
                        <div className={styles.grid}>
                            <UserValue label="Баланс" value={user.balance + " ₴"} />
                            <UserValue label="Вивів" value={user.withdrawn_amount + " ₴"} />
                            <UserValue label="Загалом заробив" value={user.balance + user.withdrawn_amount + " ₴"} />
                        </div>
                    </section>

                    {(supervisors.length > 0 || subordinates.length > 0) && (
                        <section className={styles.section}>
                            <h3>Структура</h3>

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
                                <>
                                    <AddUser placeholder="Додати керівника" allUsers={allUsers} handleAdd={handleAddSupervisor} user={user} />
                                    <AddUser placeholder="Додати підлеглого" allUsers={allUsers} handleAdd={handleAddSubordinate} user={user} />
                                </>
                            )}
                        </section>
                    )}

                    <TransactionsListSection transactions={transactions} />
                </div>
            </div>
        </DefaultPage>
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
        <div className={styles.userGroup}>
            <p className={styles.groupTitle}>{title}</p>
            <div className="flex flex-col gap-4">
                {users.map((u) => (
                    <div className="flex gap-2">
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









