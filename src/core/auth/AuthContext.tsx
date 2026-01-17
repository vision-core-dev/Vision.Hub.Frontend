import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { AuthContextType, MeUser, MyRole } from "./types";
import { authApi, tokenStorage, greetingStorage } from "./api";
import { getRandomGreeting, PUBLIC_ROUTES } from "./constants";

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState<MeUser | null>(null);
    const [role, setRole] = useState<MyRole | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const logout = useCallback((): void => {
        tokenStorage.remove();
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
        navigate("/login");
    }, [navigate]);

    const login = useCallback((token: string): void => {
        tokenStorage.set(token);
        setIsAuthenticated(true);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            const currentPath = location.pathname;

            // Skip auth check for public routes
            if (PUBLIC_ROUTES.some(route => currentPath.startsWith(route))) {
                setLoading(false);
                return;
            }

            try {
                const { ok, data } = await authApi.checkMe();

                if (ok) {
                    setIsAuthenticated(true);
                    setUser(data.user);
                    setRole(data.role);

                    // Check if user needs to accept terms
                    if (data.user.is_need_accept_terms && !data.user.is_terms_accepted) {
                        navigate("/offer-agreement");
                        return;
                    }

                    // Set random greeting
                    greetingStorage.set(getRandomGreeting());

                    // Redirect from login/root to dashboard
                    if (currentPath === "/login" || currentPath === "/") {
                        navigate("/dashboard");
                    }
                } else {
                    // Handle specific error cases
                    if (data.detail === "user_is_deactivated") {
                        navigate("/deactivated");
                    } else {
                        navigate("/login");
                    }
                }
            } catch {
                // On error, redirect to login
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const value = useMemo<AuthContextType>(
        () => ({
            isAuthenticated,
            user,
            role,
            setRole,
            login,
            logout,
            loading,
        }),
        [isAuthenticated, user, role, login, logout, loading]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
