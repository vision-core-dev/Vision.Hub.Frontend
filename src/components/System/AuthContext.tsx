import {createContext, useContext, useState, useEffect} from "react";
import type { ReactNode } from "react";
import { api } from "../../utils/api";
import type {AuthContextType, CheckMeResponse, MeUser, MyRole} from "../../types/AuthUser.ts";
import {useNavigate} from "react-router-dom";

const greetings: string[] = [
    "🎄 З Новим роком! Нехай код компілюється з першого разу ✨",
    "❄️ Новий рік — нові ідеї, нові вершини 🚀",
    "🎁 Нехай цей рік принесе тобі круті проєкти й менше багів 🧠",
    "🔥 Час апгрейду — себе, навичок і мрій",
    "⚡ Хай продуктивність буде стабільною, як 60 FPS",
    "🧩 Крок за кроком до великих результатів",
    "🌟 Світ чекає на твої ідеї — не зупиняйся",
    "🎉 Нехай цей рік буде релізом твоєї найкращої версії",
    "🧠 Менше хаосу — більше фокусу",
    "❄️ Тепла в серці й холодного розуму в розробці"
];


const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate()

    const [user, setUser] = useState<MeUser | null>(null);
    const [role, setRole] = useState<MyRole | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const path = window.location.pathname;

    const logout = (): void => {
        localStorage.removeItem("token");
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
    };

    const login = (token: string): void => {
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
    };

    const chooseGreeting = () => {
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        localStorage.setItem("greeting", greeting);
    }

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get("/v1/Hub/Auth/CheckMe");
                const data: CheckMeResponse = await response.json();

                if (response.ok) {
                    setIsAuthenticated(true);
                    setUser(data.user);
                    setRole(data.role);

                    if (data?.user.is_need_accept_terms && !data?.user.is_terms_accepted) {
                        navigate("/offer-agreement");
                        return;
                    }

                    chooseGreeting()
                    if (path === "/login" || path === "/") {
                        navigate("/dashboard");
                    }
                } else {
                    if (data.detail === "user_is_deactivated") {
                        navigate("/deactivated")
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                role,
                setRole,
                login,
                logout,
            }}
        >
            {isLoading ? <div></div> : children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

export { AuthProvider, useAuth };
