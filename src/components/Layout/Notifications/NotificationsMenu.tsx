import React, {useEffect, useState} from "react";
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

    return (
        <SlideoutMenu.Trigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <SlideoutMenu isDismissable>

                <SlideoutMenu.Header onClose={() => setIsOpen(false)} className="relative flex w-full gap-0.5 px-4 pt-6 md:px-6">
                    <h1 className="text-md font-semibold text-primary md:text-lg">Сповіщення</h1>
                </SlideoutMenu.Header>

                <SlideoutMenu.Content>
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`${styles.notification} ${notif.is_read ? styles.read : ""}`}
                        >
                            <div className={styles.notifContent}>
                                <div className="flex items-center justify-between">
                                    <h3>{notif.title}</h3>
                                    {(!notif.is_read || notif.link) && (
                                        <Button
                                            color={notif.is_read ? "link-gray" : "link-color"}
                                            size="md"
                                            onClick={() => {
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

    // return (
    //     <div className={styles.overlay} onClick={handleClose}>
    //         <div
    //             className={`${styles.panel} ${closing ? styles.slideOut : ""}`}
    //             onClick={(e) => e.stopPropagation()}
    //         >
    //             <div className={styles.header}>
    //                 <h2>🔔 Сповіщення</h2>
    //                 <button className={styles.close} onClick={handleClose}>
    //                     <X size={20} />
    //                 </button>
    //             </div>
    //
    //             <div className={styles.list}>
    //                 {notifications.map((notif) => (
    //                     <div
    //                         key={notif.id}
    //                         className={`${styles.notification} ${notif.is_read ? styles.read : ""}`}
    //                     >
    //                         <div className={styles.notifContent}>
    //                             <h3>{notif.title}</h3>
    //                             <p
    //                                 dangerouslySetInnerHTML={{ __html: notif.message }}
    //                             />
    //                             <span className={styles.timestamp}>
    //                                 <Clock strokeWidth={2.5} /> {safeDatetime(notif.created_at)}{" "}
    //                                 {notif.is_read && <CheckCheck strokeWidth={2.5} />}
    //                             </span>
    //                         </div>
    //
    //                         <div className={styles.actions}>
    //                             {(!notif.is_read || notif.link) && (
    //                                 <button
    //                                     className={styles.linkButton}
    //                                     onClick={() => {
    //                                         if (!notif.is_read) markAsRead(notif.id);
    //                                         if (notif.link) {
    //                                             navigate(notif.link)
    //                                             handleClose();
    //                                         };
    //                                     }}
    //                                 >
    //                                     {notif.link ? "Перейти" : "Добре"}
    //                                 </button>
    //                             )}
    //                         </div>
    //                     </div>
    //                 ))}
    //             </div>
    //
    //             <div className={styles.footer}>
    //                 {notifications.some((n) => !n.is_read) ? (
    //                     <button className={styles.markAll} onClick={markAllRead}>
    //                         ✅ Позначити все як переглянуте
    //                     </button>
    //                 ) : (
    //                     <span className={styles.allViewed}>👀 Всі сповіщення переглянуті</span>
    //                 )}
    //             </div>
    //         </div>
    //     </div>
    // );
};

export default NotificationsMenu;
