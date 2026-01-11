import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoaderDots from "@/components/basic/LoaderDots/LoaderDots.tsx";

const ProtectedRoute = () => {
    const { isAuthenticated, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoaderDots size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!role?.menu) {
        return (
            <div style={{ padding: "2rem", color: "#ef4444", fontWeight: 600 }}>
                ❌ У вас немає доступу до цього розділу
            </div>
        );
    }

    const currentPath = location.pathname.split("/").filter(Boolean)[0];
    const allowedRoots = ["dashboard", "me"];

    if (allowedRoots.includes(currentPath) || currentPath === "") {
        return <Outlet />;
    }

    const isAllowed = role.menu.some((allowed: string) => {
        if (allowed === currentPath) return true;

        // _form → /form/**
        if (allowed.startsWith("_")) {
            return currentPath === allowed.slice(1);
        }

        return false;
    });

    if (!isAllowed) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", margin: "auto" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🚫 Доступ заборонено</h1>
                <p style={{ color: "#6b7280" }}>
                    У вас немає прав для перегляду цього розділу.<br />
                    Зверніться до адміністратора або поверніться на{" "}
                    <a href="/" style={{ color: "#00a86b", fontWeight: 600 }}>
                        головну сторінку
                    </a>.
                </p>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
