import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../../utils/api";
import type {AuthContextType, CheckMeResponse, MeUser, MyRole} from "../../types/AuthUser.ts";

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<MeUser | null>(null);
    const [role, setRole] = useState<MyRole | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get("/v1/Hub/Auth/CheckMe");

                if (response.ok) {
                    const data: CheckMeResponse = await response.json();

                    setIsAuthenticated(true);
                    setUser(data.user);
                    setRole(data.role);
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
