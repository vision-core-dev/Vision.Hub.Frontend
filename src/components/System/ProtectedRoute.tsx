import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";
import Layout from "../Layout/Layout.tsx";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, role } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!role?.menu) {
        return <div style={{ padding: "2rem", color: "#ef4444", fontWeight: 600 }}>
            ❌ У вас немає доступу до цього розділу
        </div>;
    }

    const currentPath = location.pathname.split("/")[1];

    if (currentPath === "dashboard" || currentPath === "") {
        return <Layout>{children}</Layout>;
    }

    const isAllowed = role.menu.some((allowed: string) =>
        currentPath === allowed
    );

    if (!isAllowed) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🚫 Доступ заборонено</h1>
                <p style={{ color: "#6b7280" }}>
                    У вас немає прав для перегляду цього розділу.<br />
                    Зверніться до адміністратора або поверніться на <a href="/" style={{ color: "#00a86b", fontWeight: 600 }}>головну сторінку</a>.
                </p>
            </div>
        );
    }

    return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
