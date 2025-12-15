import { useEffect, useRef, useState } from "react";
import MessageBubble from "../MessageBubble/MessageBubble";
import styles from "./ChatMessages.module.css";
import LoaderDots from "../../../../basic/LoaderDots/LoaderDots";
import { api } from "../../../../../utils/api";

type ChatItem = {
    id: string;
    text: string;
    files: string[];
    from: "user" | "operator";
    created_at: string;
};

interface Props {
    userId: string | undefined;
}

function ChatMessages({ userId }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number | null>(null);

    const [items, setItems] = useState<ChatItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMessages = async (silent = false) => {
        try {
            if (!silent) setLoading(true);

            const res = await api.post(
                "/v1/VisionSupport/GetMessages",
                { telegram_user_id: userId }
            );

            const data = await res.json();
            if (!res.ok) return;

            setItems(data.items || []);
        } catch (e) {
            console.error("❌ Chat load error:", e);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId) return;

        // 🔹 перше завантаження
        fetchMessages(false);

        // 🔹 polling
        timerRef.current = window.setInterval(() => {
            fetchMessages(true); // тихо
        }, 2500); // ⏱ 2.5 сек — ідеально для чату

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [userId]);

    useEffect(() => {
        ref.current?.scrollTo({
            top: ref.current.scrollHeight,
            behavior: "smooth",
        });
    }, [items]);

    if (loading) {
        return (
            <div className={styles.messages}>
                <LoaderDots />
            </div>
        );
    }

    return (
        <div ref={ref} className={styles.messages}>
            {items.map(item => (
                <MessageBubble
                    key={item.id}
                    from={item.from}
                    html={item.text}
                    files={item.files}
                    createdAt={item.created_at}
                />
            ))}
        </div>
    );
}

export default ChatMessages;
