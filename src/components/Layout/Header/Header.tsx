import React, {useEffect, useState} from "react";
import { useAuth } from "../../System/AuthContext.tsx";
import { Bell } from "lucide-react";
import styles from "./Header.module.css";
import { useNavigate } from "react-router-dom";
import Notifs from "../Notifications/Notifs.tsx";
import {api} from "../../../utils/api.ts";

const Header: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(JSON.parse(localStorage.getItem("sidebar-collapsed") || "false"));

    const [balance, ] = useState<number>(-1);

    const [showNotifs, setShowNotifs] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const randomGreeting = localStorage.getItem("greeting")

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get("/v1/Hub/UserMe/Notifies/UnreadCount");
            const data = await response.json();
            if (response.ok) {
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error("Failed to fetch unread notifications count:", error);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const status = window.innerWidth < 500;
            setSidebarCollapsed(status);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 7000); // ⏱️ 7 сек (оптимально)
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (unreadCount > 0) {
            document.title = `🔔 (${unreadCount}) Vision Core Hub`;
        } else {
            document.title = "Vision Core Hub";
        }
    }, [unreadCount]);

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {!sidebarCollapsed && (
                    <>
                        <h1 className={styles.greeting}>
                            👋 Привіт, <span>{user?.first_name || "користувач"}</span>
                        </h1>
                        <p className={styles.subtext}>{randomGreeting}</p>
                    </>
                )}
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.iconButton}
                    title="Сповіщення"
                    onClick={() => setShowNotifs(true)}
                >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                </button>

                <button
                    className={styles.profileButton}
                    onClick={() => navigate("/my/profile")}
                    title="Мій профіль"
                >
                    <span className={styles.balance}>
                        {balance} грн.
                    </span>

                    <div className={styles.avatarWrapper}>
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Avatar" className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarFallback}>
                                {user?.first_name?.[0]?.toUpperCase() || "?"}
                            </div>
                        )}
                    </div>
                </button>
            </div>

            {showNotifs && <Notifs onClose={() => setShowNotifs(false)} onReadAll={() => setUnreadCount(0)} />}
        </header>
    );
};

export default Header;
