import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useNavigate } from "react-router-dom";
import styles from "./Users.module.css";

interface User {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: { name: string };
    created_at: string;
}

const UsersListPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/v1/Hub/Users/List").then(async (res) => {
            const data = await res.json();
            setUsers(data.users);
            setLoading(false);
        });
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>👥 Користувачі</h1>
                <button
                    className={styles.button}
                    onClick={() => navigate("/users/add-user")}
                >
                    Додати користувача
                </button>
            </div>

            {loading ? (
                <p>⏳ Завантаження...</p>
            ) : users.length === 0 ? (
                <p>Поки немає жодного користувача.</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Email</th>
                        <th>Ім’я</th>
                        <th>Роль</th>
                        <th>Створено</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((u) => (
                        <tr key={u.id} onClick={() => navigate(`/users/u/${u.id}/details`)}>
                            <td>{u.email}</td>
                            <td>{u.first_name || "—"} {u.last_name || ""}</td>
                            <td>{u.role?.name || "—"}</td>
                            <td>{new Date(u.created_at).toLocaleDateString("uk-UA")}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UsersListPage;