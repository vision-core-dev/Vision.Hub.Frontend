import React from "react";
import { useAuth } from "../System/AuthContext";
import {
    ClipboardList,
    Users,
    Wallet,
    BarChart3,
    Settings, CalendarClock, SquareKanban,
} from "lucide-react";
import styles from "./Layout.module.css";
import {useNavigate} from "react-router-dom";

const icons: Record<string, React.ReactNode> = {
    boards: <SquareKanban size={20} />,
    events: <CalendarClock size={20} />,
    users: <Users size={20} />,
    finance: <Wallet size={20} />,
    reports: <BarChart3 size={20} />,
    settings: <Settings size={20} />,
};

const Sidebar: React.FC = () => {
    const { role } = useAuth();
    const navigate = useNavigate();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo} onClick={() => navigate("/dashboard")}>Vision Core Hub</div>

            <nav className={styles.nav}>
                {role?.menu?.map((item: string) => (
                    <button key={item} className={styles.navItem} onClick={() => navigate(`/${item}`)}>
                        {icons[item] || <ClipboardList size={20} />}
                        <span>{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
