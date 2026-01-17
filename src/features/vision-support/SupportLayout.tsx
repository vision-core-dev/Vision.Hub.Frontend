import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import SupportSidebar from "./SupportSidebar/SupportSidebar.tsx";

export default function SupportLayout() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sidebarOpened, setSidebarOpened] = useState(true);
    const location = useLocation();

    const isMobile = windowWidth < 900;
    const isChatOpen = location.pathname.includes("/vision-support/");

    // resize
    useEffect(() => {
        const onResize = () => {
            const w = window.innerWidth;
            setWindowWidth(w);
            if (w >= 900) setSidebarOpened(true);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // mobile: коли відкрили чат → сховати sidebar
    useEffect(() => {
        if (isMobile && isChatOpen) {
            setSidebarOpened(false);
        }
    }, [isChatOpen, isMobile]);

    return (
        <div className="flex h-full w-full">
            {(!isMobile || sidebarOpened) && (
                <SupportSidebar
                    onSelectChat={() => {
                        if (isMobile) setSidebarOpened(false);
                    }}
                />
            )}

            {(!isMobile || !sidebarOpened) && (
                <Outlet context={{
                    isMobile,
                    openSidebar: () => setSidebarOpened(true),
                }} />
            )}
        </div>
    );
}









