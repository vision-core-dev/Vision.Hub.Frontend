import React, { useState, useEffect } from "react";
import { useAuth } from "../System/AuthContext";
import {
    ClipboardList,
    Users,
    Wallet,
    BarChart3,
    Settings,
    SquareKanban,
    ChevronLeft,
    ChevronRight, LayoutDashboard, CalendarDays, CalendarRange, BookMarked,
} from "lucide-react";
import styles from "./Layout.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import {getSidebarText} from "../../types/Messages.ts";

const icons: Record<string, React.ReactNode> = {
    dashboard: <LayoutDashboard size={20} />,
    calendar: <CalendarDays size={20} />,
    boards: <SquareKanban size={20} />,
    events: <CalendarRange size={20} />,
    users: <Users size={20} />,
    finance: <Wallet size={20} />,
    reports: <BarChart3 size={20} />,
    settings: <Settings size={20} />,
    knowledge: <BookMarked size={20} />
};

const Sidebar: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(window.innerWidth < 900);

    // ✅ авто-колапс при зміні ширини
    useEffect(() => {
        const handleResize = () => {
            setCollapsed(window.innerWidth < 900);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <aside
            className={`${styles.sidebar} ${
                collapsed ? styles.collapsed : styles.expanded
            }`}
        >
            <div className={styles.topSection}>
                <nav className={styles.nav}>
                    {role?.menu?.map((item: string) => {
                        const path = `/${item}`;
                        const isActive = location.pathname.startsWith(path);
                        return (
                            <button
                                key={item}
                                className={`${styles.navItem} ${
                                    isActive ? styles.activeNavItem : ""
                                }`}
                                onClick={() => {
                                    navigate(path)
                                    const main = document.querySelector(".main");
                                    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            >
                                {icons[item] || <ClipboardList size={20} />}
                                {!collapsed && (
                                    <span>{getSidebarText(item)}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className={styles.minimizeButton}>
                <button
                    className={styles.navItem}
                    onClick={() => setCollapsed((prev) => !prev)}
                >
                    {collapsed ? (
                        <ChevronRight size={20} strokeWidth={2.5} />
                    ) : (
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
