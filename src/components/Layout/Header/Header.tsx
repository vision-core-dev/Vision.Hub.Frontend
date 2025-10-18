import React, {useEffect, useState} from "react";
import { useAuth } from "../../System/AuthContext.tsx";
import { Bell, LogOut, User } from "lucide-react";
import styles from "./Header.module.css";
import { useNavigate } from "react-router-dom";
import Notifs from "../Notifications/Notifs.tsx";
import {api} from "../../../utils/api.ts";

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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

    // 📬 Фетч при першому рендері + інтервал кожні 7 секунд
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
                <h1 className={styles.greeting}>
                    👋 Привіт, <span>{user?.first_name || "користувач"}</span>
                </h1>
                <p className={styles.subtext}>{randomGreeting}</p>
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
                    className={styles.secondaryButton}
                    onClick={() => navigate("/my/profile")}
                >
                    <User size={18} />
                    <span>Профіль</span>
                </button>

                <button className={styles.dangerButton} onClick={logout}>
                    <LogOut size={18} />
                    <span>Вийти</span>
                </button>
            </div>

            {showNotifs && <Notifs onClose={() => setShowNotifs(false)} onReadAll={() => setUnreadCount(0)} />}
        </header>
    );
};

export default Header;
