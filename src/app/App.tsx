import { Providers } from "./providers";
import { AppRoutes } from "./routes";
import { useTheme } from "@/shared/utils/use-theme";

import "@/shared/styles/globals.css";

export function App() {
    useTheme(); // Run theme effect globally

    return (
        <Providers>
            <AppRoutes />
        </Providers>
    );
}








