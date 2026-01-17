import { useNavigate } from "react-router-dom";
import styles from "./AccountDeactivated.module.css";
import { AlertTriangle } from "lucide-react";
import {useAuth} from "@/core/auth/AuthContext.tsx";

const AccountDeactivated = () => {
    const {logout} = useAuth()
    const navigate = useNavigate();

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <AlertTriangle className={styles.icon} size={48} />
                <h1 className={styles.title}>Акаунт деактивований</h1>
                <p className={styles.text}>
                    Ваш акаунт було <strong>реально</strong> деактивовано адміністратором.
                    Якщо ви вважаєте це помилкою — зверніться до підтримки або власника системи.
                </p>
                <button className={styles.button} onClick={() => {
                    logout()
                    navigate("/login")
                }}>
                    ← Повернутись до входу
                </button>
            </div>
        </div>
    );
};

export default AccountDeactivated;









