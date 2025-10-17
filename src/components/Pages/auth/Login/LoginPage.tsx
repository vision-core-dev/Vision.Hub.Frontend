import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../../utils/api.ts";
import { useAuth } from "../../../System/AuthContext.tsx";
import { Lock, Mail } from "lucide-react";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await api.post("/v1/Hub/Auth/Login", { email, password });
            if (response.ok) {
                const data = await response.json();
                login(data.token);
                navigate("/dashboard");
                window.location.reload();
            } else {
                const err = await response.json();
                setError(err.detail || "Невірні дані");
            }
        } catch {
            setError("Помилка підключення до сервера");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <img src="https://cdn.visioncore.dev/public/VisionCoreDev/logo/light/logo.svg" alt="Vision Core Hub" className={styles.logo} />
                <h1 className={styles.title}>Vision Core Hub</h1>
                <p className={styles.subtitle}>Увійди до внутрішньої системи</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <Mail size={18} className={styles.icon} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Lock size={18} className={styles.icon} />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.button}>
                        Увійти
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
