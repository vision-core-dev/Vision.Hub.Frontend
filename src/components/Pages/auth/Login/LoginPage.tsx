import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/utils/api.ts";
import { useAuth } from "../../../System/AuthContext.tsx";
import { Lock, Mail } from "lucide-react";
import styles from "./LoginPage.module.css";
import {getErrorText} from "@/types/Messages.ts";
import {Input} from "@/ui/base/input/input.tsx";
import {Button} from "@/ui/base/buttons/button.tsx";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const response = await api.post("/v1/Hub/Auth/Login", { email, password });
            if (response.ok) {
                const data = await response.json();
                login(data.token);
                navigate("/dashboard");
                window.location.reload();
                setIsLoading(false);
            } else {
                const err = await response.json();
                setError(getErrorText(err.detail, "Невірні дані"));
                setIsLoading(false);
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
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(value) => setEmail(value)}
                        isRequired={true}
                        icon={Mail}
                    />

                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(value) => setPassword(value)}
                        isRequired={true}
                        icon={Lock}
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <Button type="submit" size="md" isLoading={isLoading} showTextWhileLoading>
                        Увійти
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
