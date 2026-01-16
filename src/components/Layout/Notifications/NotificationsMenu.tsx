import React, {useEffect, useMemo, useState} from "react";
import styles from "./Notifs.module.css";
import {Clock, CheckCheck} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {safeDatetime} from "@/utils/safeDate.ts";
import {api} from "@/utils/api.ts";
import {SlideoutMenu} from "@/ui/application/slideout-menus/slideout-menu.tsx";
import {Button} from "@/ui/base/buttons/button.tsx";

interface Notification {
    id: string;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

interface Props {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onReadAll: () => void;
}

const NotificationsMenu: React.FC<Props> = ({ isOpen, setIsOpen, onReadAll }: Props) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);

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


    // --- helpers ---
    const isTodayOrYesterday = (iso: string) => {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return false;

        const now = new Date();
        new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

        return d >= startOfYesterday; // вчора або сьогодні (або навіть сьогодні+час)
    };

    // --- filtered list ---
    const visibleNotifications = useMemo(() => {
        return notifications.filter((n) => {
            if (!n.is_read) return true; // всі непрочитані
            return isTodayOrYesterday(n.created_at); // прочитані тільки за сьогодні/вчора
        });
    }, [notifications]);

    return (
        <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <SlideoutMenu className="z-100" isDismissable>

                <SlideoutMenu.Header onClose={() => setIsOpen(false)} className="relative flex w-full gap-0.5 px-4 pt-6 md:px-6">
                    <h1 className="text-md font-semibold text-primary md:text-lg">Сповіщення</h1>
                </SlideoutMenu.Header>

                <SlideoutMenu.Content>
                    {visibleNotifications.map((notif) => (
                        <div key={notif.id}
                            className={`${styles.notification} ${notif.is_read ? styles.read : ""}`}
                        >
                            <div className="z-110">
                                <div className="flex items-center justify-between">
                                    <h3>{notif.title}</h3>
                                    {(!notif.is_read || notif.link) && (
                                        <Button
                                            color={notif.is_read ? "tertiary" : "primary"}
                                            size="md"
                                            onClickCapture={() => {
                                                if (!notif.is_read) markAsRead(notif.id);
                                                if (notif.link) {
                                                    navigate(notif.link)
                                                    setIsOpen(false);
                                                };
                                            }}
                                            iconLeading={notif.link ? "Перейти" : "Добре"}
                                        >
                                            {notif.link ? "Перейти" : "Добре"}
                                        </Button>
                                    )}
                                </div>
                                <p
                                    dangerouslySetInnerHTML={{ __html: notif.message }}
                                />
                                <span className={styles.timestamp}>
                                    <Clock strokeWidth={2.5} /> {safeDatetime(notif.created_at)}{" "}
                                    {notif.is_read && <CheckCheck strokeWidth={2.5} />}
                                </span>
                            </div>
                        </div>
                    ))}
                </SlideoutMenu.Content>

                <SlideoutMenu.Footer>
                    {notifications.some((n) => !n.is_read) ? (
                        <button className={styles.markAll} onClick={markAllRead}>
                            ✅ Позначити все як переглянуте
                        </button>
                    ) : (
                        <span className={styles.allViewed}>👀 Всі сповіщення переглянуті</span>
                    )}
                </SlideoutMenu.Footer>

            </SlideoutMenu>
        </SlideoutMenu.Trigger>
    );
};

export default NotificationsMenu;
