import { useNavigate, useParams } from "react-router-dom";
import styles from "./SupportSidebar.module.css";
import {useEffect, useState} from "react";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots.tsx";
import {api} from "@/shared/utils/api.ts";
import {AvatarLabelGroup} from "@/shared/ui/avatar/avatar-label-group.tsx";
import {Badge} from "@/shared/ui/badges/badges.tsx";

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

function SupportSidebar({ onSelectChat }: { onSelectChat?: () => void }) {
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

        // eslint-disable-next-line prefer-const
        timer = setInterval(() => {
            fetchBotUsers();
        }, 5000); // ⏱ кожні 5 секунд

        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.sidebar}>
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
                            onClick={() => {
                                navigate(`/vision-support/${u.telegram_id}`);
                                if (onSelectChat) onSelectChat();
                            }}
                        >
                            <AvatarLabelGroup size="md" title={u.username || `ID ${u.telegram_id}`} subtitle={`${u.first_name || ""} ${u.last_name || ""}`} />

                            {u.new_messages > 0 && String(u.telegram_id) !== telegramUserId && (
                                <Badge color="error">{u.new_messages}</Badge>
                            )}
                        </div>
                    ))}

                </>
            )}
        </div>
    );
}

export default SupportSidebar;








