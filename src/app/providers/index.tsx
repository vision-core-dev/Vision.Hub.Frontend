import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/core/auth/AuthContext";
import { OnlineUsersProvider } from "@/shared/contexts/OnlineUsersContext";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <BrowserRouter>
            <AuthProvider>
                <OnlineUsersProvider>
                    {children}
                </OnlineUsersProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}








