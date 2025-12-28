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

    const currentPath = location.pathname.split("/").filter(Boolean)[0];
    const allowedPaths = ["dashboard", "my"];

    if (allowedPaths.includes(currentPath) || currentPath === "") {
        return <Layout>{children}</Layout>;
    }

    const isAllowed = role.menu.some((allowed: string) => {
        // exact match
        if (allowed === currentPath) return true;

        // namespace match: _form → /form/**
        if (allowed.startsWith("_")) {
            const namespace = allowed.slice(1);
            return currentPath === namespace;
        }

        return false;
    });


    if (!isAllowed) {
        return (
            <Layout>
                <div style={{ padding: "2rem", textAlign: "center", margin: "auto auto" }}>
                    <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🚫 Доступ заборонено</h1>
                    <p style={{ color: "#6b7280" }}>
                        У вас немає прав для перегляду цього розділу.<br />
                        Зверніться до адміністратора або поверніться на <a href="/" style={{ color: "#00a86b", fontWeight: 600 }}>головну сторінку</a>.
                    </p>
                </div>
            </Layout>
        );
    }

    return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
