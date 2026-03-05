import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api.ts";
import { useAuth } from "@/core/auth/AuthContext.tsx";
import { Lock, Mail } from "lucide-react";
import { getErrorText } from "@/shared/types/Messages.ts";
import { Input } from "@/shared/ui/input/input.tsx";
import { Button } from "@/shared/ui/buttons/button.tsx";

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
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 align-center justify-center w-[360px] max-w-[90%] m-auto mt-10 p-10">
            <h1 className="font-extrabold text-display-md text-fg-brand-primary w-full text-center">Vision Core Hub</h1>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                <Input
                    className="w-full"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(value) => setEmail(value)}
                    isRequired={true}
                    icon={Mail}
                />

                <Input
                    className="w-full"
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(value) => setPassword(value)}
                    isRequired={true}
                    icon={Lock}
                />

                {error && <p className="text-error-primary">{error}</p>}

                <Button
                    className="w-full"
                    type="submit" size="md" isLoading={isLoading} showTextWhileLoading>
                    Увійти
                </Button>
            </form>
        </div>
    );
};

export default LoginPage;









