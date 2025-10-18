import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useNavigate } from "react-router-dom";
import styles from "./Users.module.css";
import Table from "../../basic/Table/Table.tsx";

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
            setUsers(data.list);
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
                <Table
                    columns={[
                        { key: "email", label: "Email" },
                        { key: "first_name", label: "Ім’я", render: (v, row) => `${v || "—"} ${row.last_name || ""}` },
                        { key: "role", label: "Роль", render: (v) => v?.name || "—" },
                        { key: "created_at", label: "Створено", render: (v) => new Date(v).toLocaleDateString("uk-UA") },
                    ]}
                    data={users}
                    onRowClick={(row) => navigate(`/users/u/${row.id}/details`)}
                />
            )}
        </div>
    );
};

export default UsersListPage;