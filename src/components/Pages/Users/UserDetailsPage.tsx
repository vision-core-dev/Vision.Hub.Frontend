import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import styles from "./UserDetails.module.css";
import {safeDate, safeDatetime} from "../../../utils/safeDate.ts";
import type {SmallUser, UserType} from "../../../types/Users.ts";
import UserValue from "../../basic/UserValue/UserValue.tsx";

interface Response {
    ok: boolean;
    user: UserType;
    actions: string[];
    supervisors: SmallUser[];
    subordinates: SmallUser[];
}

const UserDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserType | null>(null);
    const [actions, setActions] = useState<string[]>([]);
    const [supervisors, setSupervisors] = useState<SmallUser[]>([]);
    const [subordinates, setSubordinates] = useState<SmallUser[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/v1/Hub/Users/${id}/Details`).then(async (res) => {
            const data: Response = await res.json();
            setUser(data.user);
            setActions(data.actions);
            setSupervisors(data.supervisors);
            setSubordinates(data.subordinates);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <p>⏳ Завантаження...</p>;
    if (!user) return <p>❌ Користувача не знайдено</p>;

    return (
        <div className={styles.page}>
            <button className={styles.backButton} onClick={() => navigate("/users/list")}>
                ← Назад до списку
            </button>

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

                <div className={styles.info}>
                    <div>
                        <p className={styles.label}>📧 Email</p>
                        <p className={styles.value}>{user.email}</p>
                    </div>

                    <div>
                        <p className={styles.label}>📅 День народження</p>
                        <p className={styles.value}>
                            {safeDate(user.birthday)}
                        </p>
                    </div>

                    <div>
                        <p className={styles.label}>📅 Зареєстрований</p>
                        <p className={styles.value}>
                            {safeDatetime(user.created_at)}
                        </p>
                    </div>

                    <div>
                        <p className={styles.label}>📅 Остання активність</p>
                        <p className={styles.value}>
                            {safeDatetime(user.last_login)}
                        </p>
                    </div>
                </div>

                {supervisors.length > 0 && (
                    <div className={styles.section}>
                        <h3>👨‍💼 Керівники</h3>
                        <div className={styles.userList}>
                            {supervisors.map(s => (
                                <UserValue key={s.id} user={s} />
                            ))}
                        </div>
                    </div>
                )}

                {subordinates.length > 0 && (
                    <div className={styles.section}>
                        <h3>👥 Підлеглі</h3>
                        <div className={styles.userList}>
                            {subordinates.map(s => (
                                <UserValue key={s.id} user={s} />
                            ))}
                        </div>
                    </div>
                )}

                {actions && actions.length > 0 && (
                    <div className={styles.section}>
                        <h3>Дії</h3>
                        {actions.includes("change_role") && (
                            <button className={styles.secondary}>Змінити роль</button>
                        )}
                        {actions.includes("deactivate_user") && (
                            <button className={styles.danger}>Деактивувати</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDetailsPage;
