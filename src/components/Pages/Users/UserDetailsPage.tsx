import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../utils/api";
import styles from "./Users.module.css";

const UserDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        api.get(`/v1/Hub/Users/${id}/Details`).then(async (res) => {
            const data = await res.json();
            setUser(data);
        });
    }, [id]);

    if (!user) return <p>⏳ Завантаження...</p>;

    return (
        <div className={styles.page}>
            <button className={styles.backButton} onClick={() => navigate("/users/list")}>
                ← Назад до списку
            </button>

            <div className={styles.details}>
                <h1>{user.first_name} {user.last_name}</h1>
                <p><span className={styles.label}>📧 Email:</span> <span className={styles.value}>{user.email}</span></p>
                <p><span className={styles.label}>🎓 Роль:</span> <span className={styles.value}>{user.role?.name}</span></p>
                <p><span className={styles.label}>📅 Створено:</span> <span className={styles.value}>{new Date(user.created_at).toLocaleDateString("uk-UA")}</span></p>
            </div>
        </div>
    );
};

export default UserDetailsPage;
