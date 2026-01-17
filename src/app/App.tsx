import { Providers } from "./providers";
import { AppRoutes } from "./routes";

import "@/shared/styles/globals.css";

export function App() {
    return (
        <Providers>
            <AppRoutes />
        </Providers>
    );
}








