// SupportChat/ChatMessagesProvider.tsx
import { useEffect, useRef, useState } from "react";
import { api } from "@/utils/api";
import LoaderDots from "@/components/basic/LoaderDots/LoaderDots";
import { ChatMessageList } from "./ChatMessageList";

export type ChatItem = {
    id: string;
    text: string;
    files: string[];
    from: "user" | "operator";
    created_at: string;
};

interface Props {
    telegramUserId?: string;
}

export function ChatMessagesProvider({ telegramUserId }: Props) {
    const timerRef = useRef<number | null>(null);
    const [items, setItems] = useState<ChatItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMessages = async (silent = false) => {
        if (!telegramUserId) return;

        try {
            if (!silent) setLoading(true);

            const res = await api.post(
                "/v1/VisionSupport/GetMessages",
                { telegram_user_id: telegramUserId }
            );

            const data = await res.json();
            if (!res.ok) return;

            setItems(data.items || []);
        } catch (e) {
            console.error("Chat fetch error", e);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();

        timerRef.current = window.setInterval(
            () => fetchMessages(true),
            2500
        );

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [telegramUserId]);

    if (loading) {
        return <LoaderDots />;
    }

    return <ChatMessageList items={items} />;
}
