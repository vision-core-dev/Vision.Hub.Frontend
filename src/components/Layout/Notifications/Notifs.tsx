import React, {useEffect, useState} from "react";
import styles from "./Notifs.module.css";
import {Clock, X, CheckCheck} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {safeDatetime} from "../../../utils/safeDate.ts";
import {api} from "../../../utils/api.ts";

interface Notification {
    id: string;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

const Notifs: React.FC<{ onClose: () => void; onReadAll: () => void }> = ({ onClose, onReadAll }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [closing, setClosing] = useState(false);

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        onReadAll();
        api.post("/v1/Hub/UserMe/Notifies/MarkAllAsRead", {});
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        api.post(`/v1/Hub/UserMe/Notifies/MarkAsRead/${id}`, {});
    };

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => onClose(), 300);
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get("/v1/Hub/UserMe/Notifies/List");
                const data = await response.json();
                setNotifications(data.list);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        }
        fetchNotifications();
    }, []);

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div
                className={`${styles.panel} ${closing ? styles.slideOut : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2>🔔 Сповіщення</h2>
                    <button className={styles.close} onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.list}>
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`${styles.notification} ${notif.is_read ? styles.read : ""}`}
                        >
                            <div className={styles.notifContent}>
                                <h3>{notif.title}</h3>
                                <p
                                    dangerouslySetInnerHTML={{ __html: notif.message }}
                                />
                                <span className={styles.timestamp}>
                                    <Clock strokeWidth={2.5} /> {safeDatetime(notif.created_at)}{" "}
                                    {notif.is_read && <CheckCheck strokeWidth={2.5} />}
                                </span>
                            </div>

                            <div className={styles.actions}>
                                {(!notif.is_read || notif.link) && (
                                    <button
                                        className={styles.linkButton}
                                        onClick={() => {
                                            if (!notif.is_read) markAsRead(notif.id);
                                            if (notif.link) {
                                                navigate(notif.link)
                                                handleClose();
                                            };
                                        }}
                                    >
                                        {notif.link ? "Перейти" : "Добре"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    {notifications.some((n) => !n.is_read) ? (
                        <button className={styles.markAll} onClick={markAllRead}>
                            ✅ Позначити все як переглянуте
                        </button>
                    ) : (
                        <span className={styles.allViewed}>👀 Всі сповіщення переглянуті</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifs;
