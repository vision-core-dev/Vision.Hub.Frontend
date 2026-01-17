import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ALWAYS_ALLOWED_ROUTES } from "./constants";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";

/**
 * Check if route is allowed based on user's role menu
 */
const isRouteAllowed = (currentPath: string, menu: string[]): boolean => {
    // Always allowed routes
    if (ALWAYS_ALLOWED_ROUTES.includes(currentPath as any)) {
        return true;
    }

    return menu.some((allowed) => {
        if (allowed === currentPath) return true;

        // Handle special prefix notation: _form → allows /form/**
        if (allowed.startsWith("_")) {
            return currentPath === allowed.slice(1);
        }

        return false;
    });
};

const ProtectedRoute = () => {
    const { isAuthenticated, role, loading } = useAuth();
    const location = useLocation();

    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoaderDots size="lg" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if role has menu permissions
    if (!role?.menu) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-semibold text-red-500 mb-2">
                        ❌ Помилка доступу
                    </h1>
                    <p className="text-gray-500">
                        У вас немає налаштованих прав доступу.
                        <br />
                        Зверніться до адміністратора.
                    </p>
                </div>
            </div>
        );
    }

    // Get current path root segment
    const currentPath = location.pathname.split("/").filter(Boolean)[0] ?? "";

    // Check route permission
    if (!isRouteAllowed(currentPath, role.menu)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center p-8 max-w-md">
                    <h1 className="text-3xl font-semibold mb-4">🚫 Доступ заборонено</h1>
                    <p className="text-gray-500 mb-4">
                        У вас немає прав для перегляду цього розділу.
                    </p>
                    <a
                        href="/dashboard"
                        className="text-brand-600 font-medium hover:underline"
                    >
                        ← Повернутися на головну
                    </a>
                </div>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
