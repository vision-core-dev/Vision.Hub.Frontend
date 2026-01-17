import { useEffect, useRef } from "react";
import { ChatMessageGroup } from "./ChatMessageGroup";
import type { ChatItem } from "./ChatMessagesProvider";

interface Props {
    items: ChatItem[];
}

export function ChatMessageList({ items }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        ref.current.scrollTo({
            top: ref.current.scrollHeight,
            behavior: "smooth",
        });
    }, [items.length]);

    return (
        <div
            ref={ref}
            className="flex flex-col gap-4 p-4 overflow-y-auto grow"
        >
            {items.map((msg) => (
                <ChatMessageGroup
                    key={msg.id}
                    message={msg}
                />
            ))}
        </div>
    );
}









