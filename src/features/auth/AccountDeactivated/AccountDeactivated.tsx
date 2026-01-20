import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LifeBuoy, AlertCircle } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { Button } from "@/shared/ui/buttons/button";

const AccountDeactivated = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSupport = () => {
        // Placeholder for support action
        window.location.href = "https://t.me/VisionCoreDevBot";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center ring-8 ring-amber-50">
                        <ShieldAlert className="h-10 w-10 text-amber-600" />
                    </div>
                </div>

                {/* Main Content */}
                <div className="mt-6">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Акаунт деактивовано
                    </h2>

                    <p className="mt-4 text-lg text-gray-500">
                        Ваш доступ до Hub обмежено адміністратором організації.
                        Якщо ви вважаєте це помилкою — зверніться до підтримки або власника компанії.
                    </p>
                </div>

                {/* Help Card */}
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 text-left">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">
                                Що могло статися?
                            </h3>
                            <div className="mt-2 text-sm text-gray-500">
                                <ul role="list" className="list-disc pl-5 space-y-1">
                                    <li>Ваш акаунт вимкнено адміністратором</li>
                                    <li>Ви більше не в команді компанії</li>
                                    <li>Завершився тестовий доступ</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center mt-8">
                    <Button
                        size="lg"
                        onClick={handleLogout}
                        iconLeading={ArrowLeft}
                    >
                        Повернутись до входу
                    </Button>

                    <Button
                        size="lg"
                        onClick={handleSupport}
                        iconLeading={LifeBuoy}
                    >
                        Написати в підтримку
                    </Button>
                </div>

                {/* Footer / Error Code */}
                <p className="mt-8 text-xs text-gray-400 font-mono">
                    Код помилки: ACCOUNT_DISABLED
                </p>
            </div>
        </div>
    );
};

export default AccountDeactivated;
