import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {api} from "../../../utils/api.ts";
import {useAuth} from "../../System/AuthContext.tsx";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await api.post("/v1/Hub/Auth/Login", {
                email,
                password,
            });

            if (response.ok) {
                const data = await response.json();
                login(data.token); // 🔥 зберігаємо токен
                navigate("/dashboard");
            } else {
                const err = await response.json();
                setError(err.detail || "Невірні дані");
            }
        } catch {
            setError("Помилка підключення до сервера");
        }
    };

    return (
        <div className="login-page">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>VisionOps — Вхід</h2>
                {error && <p className="error">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Увійти</button>
            </form>
        </div>
    );
};

export default Login;
