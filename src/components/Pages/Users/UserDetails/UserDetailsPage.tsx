import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/utils/api.ts";
import styles from "./UserDetailsPage.module.css";
import { safeDate, safeDatetime } from "@/utils/safeDate.ts";
import type { SmallUser, UserType } from "@/types/Users.ts";
import DefaultPage from "../../../basic/DefaultPage/DefaultPage.tsx";
import {ArrowLeft, X} from "lucide-react";
import TransactionsListSection, {
    type TransactionItem
} from "../../Finance/TransactionsListSection/TransactionsListSection.tsx";
import UserValue from "./UserValue/UserValue.tsx";
import BadgesSection from "./BadgesSection/BadgesSection.tsx";
import UserLabel from "../../../basic/User/UserLabel.tsx";
import {Button} from "@/ui/base/buttons/button.tsx";

export interface Badge {
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
        setLoading(true);
        setShowRoleChanger(false);
        setEditStructure(false);
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

                        {actions.includes("change_role") && (
                            <Button onClick={() => setShowRoleChanger(!showRoleChanger)}>
                                Змінити роль
                            </Button>
                        )}
                        {actions.includes("change_org_structure") && (
                            <Button onClick={() => setEditStructure(!editStructure)}>
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

                            {/* Керівники */}
                            {supervisors.length > 0 && (
                                <div className={styles.userGroup}>
                                    <p className={styles.groupTitle}>Керівники</p>
                                    <div className={styles.userList}>
                                        {supervisors.map((u) => (
                                            <div key={u.id} className={styles.userRow}>
                                                <UserLabel user_id={u.id} avatar_url={u.avatar_url} role={u.role?.name || ""} name={`${u.first_name} ${u.last_name || ""}`} />

                                                {(actions.includes("change_org_structure") && editStructure) && (
                                                    <Button
                                                        color="primary-destructive"
                                                        onClick={() => handleRemoveSupervisor(u.id)}
                                                    ><X /></Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Підлеглі */}
                            {subordinates.length > 0 && (
                                <div className={styles.userGroup}>
                                    <p className={styles.groupTitle}>Підлеглі</p>
                                    <div className={styles.userList}>
                                        {subordinates.map((u) => (
                                            <div key={u.id} className={styles.userRow}>
                                                <UserLabel user_id={u.id} avatar_url={u.avatar_url} role={u.role?.name || ""} name={`${u.first_name} ${u.last_name || ""}`} />

                                                {(actions.includes("change_org_structure") && editStructure) && (
                                                    <Button
                                                        color="primary-destructive"
                                                        onClick={() => handleRemoveSubordinate(u.id)}
                                                    ><X /></Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Додавання, якщо можна */}
                            {(actions.includes("change_org_structure") && editStructure) && (
                                <div className={styles.addBlock}>
                                    <select
                                        onChange={(e) => handleAddSupervisor(e.target.value)}
                                    >
                                        <option value="">+ Додати керівника</option>
                                        {allUsers.filter(u => u.id !== user.id && user.is_active).map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.first_name} {u.last_name}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        onChange={(e) => handleAddSubordinate(e.target.value)}
                                    >
                                        <option value="">+ Додати підлеглого</option>
                                        {allUsers.filter(u => u.id !== user.id && user.is_active).map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.first_name} {u.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </section>
                    )}

                    <TransactionsListSection transactions={transactions} />
                </div>
            </div>
        </DefaultPage>
    )

    // return (
    //     <DefaultPage isLoading={loading}>
    //         {backButton}
    //         <div className={styles.card}>
    //             <div className={styles.header}>
    //                 {user.avatar_url && (
    //                     <img src={user.avatar_url} alt="Avatar" className={styles.avatar} />
    //                 )}
    //                 <div>
    //                     <h1 className={styles.name}>
    //                         {user.first_name} {user.last_name}
    //                     </h1>
    //                     <p className={styles.role}>{user.role?.name || "—"}</p>
    //                 </div>
    //             </div>
    //
    //             {badges.length > 0 && (
    //                 <div className={styles.topBadges}>
    //                     {badges.map((badge) => (
    //                         <div key={badge.id} className={styles.badgeIcon}>
    //                             <div className={styles.tooltip}>
    //                                 <div className={styles.tooltipContent}>
    //                                     <p className={styles.tooltipTitle}>{badge.name}</p>
    //                                     <p className={styles.tooltipDesc}>{badge.description}</p>
    //                                     <p className={styles.tooltipDate}>
    //                                         📅 Отримано: {safeDatetime(badge.awarded_at)}
    //                                     </p>
    //                                 </div>
    //                             </div>
    //                             {badge.emoji ? (
    //                                 <span className={styles.badgeEmoji}>{badge.emoji}</span>
    //                             ) : (
    //                                 <img src={badge.icon_url} alt={badge.name} className={styles.badgeImg} />
    //                             )}
    //                         </div>
    //                     ))}
    //                 </div>
    //             )}
    //
    //             <div className={styles.info}>
    //                 <div>
    //                     <p className={styles.label}>📧 Email</p>
    //                     <p className={styles.value}>{user.email}</p>
    //                 </div>
    //                 <div>
    //                     <p className={styles.label}>🎉 День народження</p>
    //                     <p className={styles.value}>
    //                         {safeDate(user.birthday)} {getAge(user.birthday)}
    //                     </p>
    //                 </div>
    //                 <div>
    //                     <p className={styles.label}>🧭 Остання активність</p>
    //                     <p className={styles.value}>{safeDatetime(user.last_login)}</p>
    //                 </div>
    //                 <div>
    //                     <p className={styles.label}>📅 Зареєстрований</p>
    //                     <p className={styles.value}>{safeDatetime(user.created_at)}</p>
    //                 </div>
    //                 <div>
    //                     <p className={styles.label}>🔖 Статус</p>
    //                     <p className={styles.value}>{user.is_active ? "Активний" : "Деактивований"}</p>
    //                 </div>
    //             </div>
    //
    //             {editStructure ? (
    //                 <>
    //                     <div className={styles.section}>
    //                         <h3>👨‍💼 Керівники</h3>
    //                         <div className={styles.userList}>
    //                             {supervisors.map((s) => (
    //                                 <div key={s.id} className={styles.userItem}>
    //                                     <UserValue user={s} />
    //                                     <button onClick={() => handleRemoveSupervisor(s.id)} className={styles.dangerSmall}>✖</button>
    //                                 </div>
    //                             ))}
    //                         </div>
    //
    //                         <select onChange={(e) => handleAddSupervisor(e.target.value)} className={styles.addSelect}>
    //                             <option value="">+ Додати керівника</option>
    //                             {allUsers.filter(u => u.id !== user?.id).map(u => (
    //                                 <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
    //                             ))}
    //                         </select>
    //                     </div>
    //
    //                     <div className={styles.section}>
    //                         <h3>👥 Підлеглі</h3>
    //                         <div className={styles.userList}>
    //                             {subordinates.map((s) => (
    //                                 <div key={s.id} className={styles.userItem}>
    //                                     <UserValue user={s} />
    //                                     <button onClick={() => handleRemoveSubordinate(s.id)} className={styles.dangerSmall}>✖</button>
    //                                 </div>
    //                             ))}
    //                         </div>
    //
    //                         <select onChange={(e) => handleAddSubordinate(e.target.value)} className={styles.addSelect}>
    //                             <option value="">+ Додати підлеглого</option>
    //                             {allUsers.filter(u => u.id !== user?.id).map(u => (
    //                                 <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
    //                             ))}
    //                         </select>
    //                     </div>
    //                 </>
    //             ) : (
    //                 <>
    //                     {supervisors.length > 0 && (
    //                         <div className={styles.section}>
    //                             <h3>👨‍💼 Керівники</h3>
    //                                 <div className={styles.userList}>
    //                                 {supervisors.map((s) => (
    //                                     <UserValue key={s.id} user={s} />
    //                                 ))}
    //                             </div>
    //                         </div>
    //                     )}
    //
    //                     {subordinates.length > 0 && (
    //                         <div className={styles.section}>
    //                             <h3>👥 Підлеглі</h3>
    //                             <div className={styles.userList}>
    //                                 {subordinates.map((s) => (
    //                                     <UserValue key={s.id} user={s} />
    //                                 ))}
    //                             </div>
    //                         </div>
    //                     )}
    //                 </>
    //             )}
    //
    //             {actions && actions.length > 0 && (
    //                 <div className={styles.section}>
    //                     <h3>⚙️ Дії</h3>
    //
    //                     {(actions.includes("change_role") && showRoleChanger) && (
    //                         <div className={styles.roleChanger}>
    //                             <div className={styles.customSelectWrapper}>
    //                                 <select
    //                                     value={selectedRole}
    //                                     onChange={(e) => setSelectedRole(e.target.value)}
    //                                     className={styles.customSelect}
    //                                 >
    //                                     {roles.map((role) => (
    //                                         <option key={role.id} value={role.id}>
    //                                             {role.name}
    //                                         </option>
    //                                     ))}
    //                                 </select>
    //                                 <span className={styles.selectArrow}>▼</span>
    //                             </div>
    //                             <button
    //                                 className={styles.secondary}
    //                                 onClick={handleChangeRole}
    //                                 disabled={changingRole}
    //                             >
    //                                 {changingRole ? "⏳ Зміна..." : "Змінити роль"}
    //                             </button>
    //                             <button
    //                                 className={styles.secondary}
    //                                 onClick={() => setShowRoleChanger(false)}
    //                                 disabled={changingRole}
    //                             >
    //                                 Скасувати
    //                             </button>
    //                         </div>
    //                     )}
    //
    //                     <div className={styles.section2}>
    //                         {(actions.includes("change_role") && !showRoleChanger) && (
    //                             <button className={styles.secondary} onClick={() => setShowRoleChanger(true)}>
    //                                 Змінити роль
    //                             </button>
    //                         )}
    //
    //                         {(actions.includes("change_org_structure")) && (
    //                             <button className={styles.secondary} onClick={() => setEditStructure(!editStructure)}>
    //                                 {editStructure ? "Не редагувати структуру" : "Редагувати структуру"}
    //                             </button>
    //                         )}
    //
    //                         {actions.includes("activate_user") && (
    //                             <button className={styles.secondary} onClick={handleActivate}>
    //                                 Активувати
    //                             </button>
    //                         )}
    //
    //                         {actions.includes("deactivate_user") && (
    //                             <button className={styles.danger} onClick={handleDeactivate}>
    //                                 Деактивувати
    //                             </button>
    //                         )}
    //                     </div>
    //                 </div>
    //             )}
    //
    //

    // );
};

export default UserDetailsPage;
