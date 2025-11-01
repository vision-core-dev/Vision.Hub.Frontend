import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../../utils/api.ts";
import styles from "./UserDetailsPage.module.css";
import { safeDate, safeDatetime } from "../../../../utils/safeDate.ts";
import type { SmallUser, UserType } from "../../../../types/Users.ts";
import UserValue from "../../../basic/UserValue/UserValue.tsx";
import DefaultPage from "../../../basic/DefaultPage/DefaultPage.tsx";
import Button from "../../../basic/Button/Button.tsx";
import {ArrowLeft} from "lucide-react";
import TransactionsListSection, {
    type TransactionItem
} from "../../Finance/TransactionsListSection/TransactionsListSection.tsx";

interface Badge {
    id: string;
    name: string;
    description?: string;
    icon_url?: string;
    emoji?: string;
    awarded_at: string;
}

interface Role {
    id: string;
    name: string;
    order: number;
}

interface Response {
    ok: boolean;
    user: UserType;
    actions: string[];
    supervisors: SmallUser[];
    subordinates: SmallUser[];
    transactions: TransactionItem[];
    badges: Badge[];
}

const UserDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserType | null>(null);
    const [actions, setActions] = useState<string[]>([]);
    const [supervisors, setSupervisors] = useState<SmallUser[]>([]);
    const [subordinates, setSubordinates] = useState<SmallUser[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);

    const [selectedRole, setSelectedRole] = useState<string>("");

    const [allUsers, setAllUsers] = useState<SmallUser[]>([]);

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
        api.get(`/v1/Hub/Users/${id}/Details`).then(async (res) => {
            const data: Response = await res.json();
            setUser(data.user);
            setSupervisors(data.supervisors);
            setSubordinates(data.subordinates);
            setBadges(data.badges);
            setActions(data.actions);
            setTransactions(data.transactions || []);
            setLoading(false);

            if (data.user?.role?.id) {
                setSelectedRole(data.user.role.id);
            }
        });
    }

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
    const handleAddSupervisor = async (supervisorId: string) => {
        await api.post(`/v1/Hub/Users/${user?.id}/Supervisors/Add/${supervisorId}`);
        refreshUserData()
    };

    const handleRemoveSupervisor = async (supervisorId: string) => {
        await api.post(`/v1/Hub/Users/${user?.id}/Supervisors/Remove/${supervisorId}`);
        refreshUserData()
    };

    const handleAddSubordinate = async (subordinateId: string) => {
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
        <Button variant="link" onClick={() => navigate("/users/list")}>
            <ArrowLeft size={20} /> Назад до списку
        </Button>
    );

    if (!user) return (
        <DefaultPage isLoading={loading}>
            {backButton}
            <p>Користувача не знайдено.</p>
        </DefaultPage>
    );

    return (
        <DefaultPage isLoading={loading}>
            {backButton}
            <div className={styles.card}>
                <div className={styles.header}>
                    {user.avatar_url && (
                        <img src={user.avatar_url} alt="Avatar" className={styles.avatar} />
                    )}
                    <div>
                        <h1 className={styles.name}>
                            {user.first_name} {user.last_name}
                        </h1>
                        <p className={styles.role}>{user.role?.name || "—"}</p>
                    </div>
                </div>

                {badges.length > 0 && (
                    <div className={styles.topBadges}>
                        {badges.map((badge) => (
                            <div key={badge.id} className={styles.badgeIcon}>
                                <div className={styles.tooltip}>
                                    <div className={styles.tooltipContent}>
                                        <p className={styles.tooltipTitle}>{badge.name}</p>
                                        <p className={styles.tooltipDesc}>{badge.description}</p>
                                        <p className={styles.tooltipDate}>
                                            📅 Отримано: {safeDatetime(badge.awarded_at)}
                                        </p>
                                    </div>
                                </div>
                                {badge.emoji ? (
                                    <span className={styles.badgeEmoji}>{badge.emoji}</span>
                                ) : (
                                    <img src={badge.icon_url} alt={badge.name} className={styles.badgeImg} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.info}>
                    <div>
                        <p className={styles.label}>📧 Email</p>
                        <p className={styles.value}>{user.email}</p>
                    </div>
                    <div>
                        <p className={styles.label}>🎉 День народження</p>
                        <p className={styles.value}>
                            {safeDate(user.birthday)} {getAge(user.birthday)}
                        </p>
                    </div>
                    <div>
                        <p className={styles.label}>🧭 Остання активність</p>
                        <p className={styles.value}>{safeDatetime(user.last_login)}</p>
                    </div>
                    <div>
                        <p className={styles.label}>📅 Зареєстрований</p>
                        <p className={styles.value}>{safeDatetime(user.created_at)}</p>
                    </div>
                    <div>
                        <p className={styles.label}>🔖 Статус</p>
                        <p className={styles.value}>{user.is_active ? "Активний" : "Деактивований"}</p>
                    </div>
                </div>

                {editStructure ? (
                    <>
                        <div className={styles.section}>
                            <h3>👨‍💼 Керівники</h3>
                            <div className={styles.userList}>
                                {supervisors.map((s) => (
                                    <div key={s.id} className={styles.userItem}>
                                        <UserValue user={s} />
                                        <button onClick={() => handleRemoveSupervisor(s.id)} className={styles.dangerSmall}>✖</button>
                                    </div>
                                ))}
                            </div>

                            <select onChange={(e) => handleAddSupervisor(e.target.value)} className={styles.addSelect}>
                                <option value="">+ Додати керівника</option>
                                {allUsers.filter(u => u.id !== user?.id).map(u => (
                                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.section}>
                            <h3>👥 Підлеглі</h3>
                            <div className={styles.userList}>
                                {subordinates.map((s) => (
                                    <div key={s.id} className={styles.userItem}>
                                        <UserValue user={s} />
                                        <button onClick={() => handleRemoveSubordinate(s.id)} className={styles.dangerSmall}>✖</button>
                                    </div>
                                ))}
                            </div>

                            <select onChange={(e) => handleAddSubordinate(e.target.value)} className={styles.addSelect}>
                                <option value="">+ Додати підлеглого</option>
                                {allUsers.filter(u => u.id !== user?.id).map(u => (
                                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                                ))}
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        {supervisors.length > 0 && (
                            <div className={styles.section}>
                                <h3>👨‍💼 Керівники</h3>
                                    <div className={styles.userList}>
                                    {supervisors.map((s) => (
                                        <UserValue key={s.id} user={s} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {subordinates.length > 0 && (
                            <div className={styles.section}>
                                <h3>👥 Підлеглі</h3>
                                <div className={styles.userList}>
                                    {subordinates.map((s) => (
                                        <UserValue key={s.id} user={s} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {actions && actions.length > 0 && (
                    <div className={styles.section}>
                        <h3>⚙️ Дії</h3>

                        {(actions.includes("change_role") && showRoleChanger) && (
                            <div className={styles.roleChanger}>
                                <div className={styles.customSelectWrapper}>
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className={styles.customSelect}
                                    >
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className={styles.selectArrow}>▼</span>
                                </div>
                                <button
                                    className={styles.secondary}
                                    onClick={handleChangeRole}
                                    disabled={changingRole}
                                >
                                    {changingRole ? "⏳ Зміна..." : "Змінити роль"}
                                </button>
                                <button
                                    className={styles.secondary}
                                    onClick={() => setShowRoleChanger(false)}
                                    disabled={changingRole}
                                >
                                    Скасувати
                                </button>
                            </div>
                        )}

                        <div className={styles.section2}>
                            {(actions.includes("change_role") && !showRoleChanger) && (
                                <button className={styles.secondary} onClick={() => setShowRoleChanger(true)}>
                                    Змінити роль
                                </button>
                            )}

                            {(actions.includes("change_org_structure")) && (
                                <button className={styles.secondary} onClick={() => setEditStructure(!editStructure)}>
                                    {editStructure ? "Не редагувати структуру" : "Редагувати структуру"}
                                </button>
                            )}

                            {actions.includes("activate_user") && (
                                <button className={styles.secondary} onClick={handleActivate}>
                                    Активувати
                                </button>
                            )}

                            {actions.includes("deactivate_user") && (
                                <button className={styles.danger} onClick={handleDeactivate}>
                                    Деактивувати
                                </button>
                            )}
                        </div>
                    </div>
                )}


                <div className={styles.info}>
                    <div>
                        <p className={styles.label}>Balance</p>
                        <p className={styles.value}>{user.balance}</p>
                    </div>
                    <div>
                        <p className={styles.label}>Withdrawn amount</p>
                        <p className={styles.value}>{user.withdrawn_amount}</p>
                    </div>
                    <div>
                        <p className={styles.label}>All earned</p>
                        <p className={styles.value}>{user.balance + user.withdrawn_amount}</p>
                    </div>
                </div>

                <TransactionsListSection transactions={transactions} />
            </div>
        </DefaultPage>
    );
};

export default UserDetailsPage;
