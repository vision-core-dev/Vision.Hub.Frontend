import { useNavigate, useParams } from "react-router-dom";
import styles from "./SupportSidebar.module.css";
import Input from "../../../basic/Input/Input.tsx";
import {useEffect, useState} from "react";
import LoaderDots from "../../../basic/LoaderDots/LoaderDots.tsx";
import {api} from "../../../../utils/api.ts";

interface VisionSupportUser {
    telegram_id: number
    first_name: string
    last_name: string
    username: string
    is_active: boolean
    new_messages: number
}

interface GetBotUsersResponse {
    users: VisionSupportUser[]
}

function SupportSidebar() {
    const navigate = useNavigate();
    const { telegramUserId } = useParams();

    const [botUsers, setBotUsers] = useState<VisionSupportUser[]>([]);
    const [isLoading, setLoading] = useState(false);

    const fetchBotUsers = async () => {
        try {
            const res = await api.get("/v1/VisionSupport/GetBotUsers");
            const data: GetBotUsersResponse = await res.json();
            if (res.ok) {
                setBotUsers(data.users);
            }
        } catch (err) {
            console.error("❌ Помилка при завантаженні користувачів бота:", err);
        }
    };

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;

        const load = async () => {
            setLoading(true);
            await fetchBotUsers();
            setLoading(false);
        };

        load();

        timer = setInterval(() => {
            fetchBotUsers();
        }, 5000); // ⏱ кожні 5 секунд

        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.sidebar}>
            <Input type="text" placeholder="Пошук..." />

            {isLoading ? (
                <LoaderDots />
            ) : (
                <>
                    {botUsers.map(u => (
                        <div
                            key={u.telegram_id}
                            className={`${styles.item} ${
                                String(u.telegram_id) === telegramUserId ? styles.active : ""
                            }`}
                            onClick={() => navigate(`/vision-support/${u.telegram_id}`)}
                        >
                            <div className={styles.text}>
                                <span className={styles.title}>{u.username || `ID ${u.telegram_id}`}</span>
                                <span className={styles.subtitle}>
                                    {u.first_name || ""} {u.last_name || ""}
                                </span>
                            </div>

                            {u.new_messages > 0 && String(u.telegram_id) !== telegramUserId && (
                                <span className={styles.badge}>{u.new_messages}</span>
                            )}
                        </div>
                    ))}

                </>
            )}
        </div>
    );
}

export default SupportSidebar;