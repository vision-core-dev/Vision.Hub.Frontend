import { useState, useCallback } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatContent from "./ChatContent";
import { useChatWebSocket } from "./useChatWebSocket";
import { useAuth } from "@/core/auth/AuthContext";
import type { ChatMessage } from "./types";
import CreateChatModal from "./CreateChatModal";

export default function ChatPage() {
    const { user } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [typingUsers, setTypingUsers] = useState<{ chat_id: string; user_id: string; first_name: string }[]>([]);

    // Handle new message from WebSocket
    // Handle new message from WebSocket
    const handleNewMessage = useCallback((message: ChatMessage) => {
        // Placeholder for future global message handling if needed
        console.log("New message received:", message);
    }, []);

    // Handle typing indicator
    const handleTyping = useCallback((data: { chat_id: string; user_id: string; is_typing: boolean }) => {
        setTypingUsers((prev) => {
            if (data.is_typing) {
                // Add typing user if not already in list
                if (prev.some((u) => u.user_id === data.user_id)) return prev;
                return [...prev, { chat_id: data.chat_id, user_id: data.user_id, first_name: "Користувач" }];
            } else {
                // Remove user from typing list
                return prev.filter((u) => u.user_id !== data.user_id);
            }
        });
    }, []);

    // Connect to WebSocket
    useChatWebSocket(user?.id || null, {
        onNewMessage: handleNewMessage,
        onTyping: handleTyping,
        onConnected: () => console.log("Chat WebSocket connected"),
        onDisconnected: () => console.log("Chat WebSocket disconnected"),
    });

    return (
        <div className="flex h-full overflow-hidden">
            <ChatSidebar
                onCreateChat={() => setIsCreateModalOpen(true)}
            />
            <ChatContent
                typingUsers={typingUsers}
            />

            <CreateChatModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onChatCreated={() => {
                    setIsCreateModalOpen(false);
                    // Reload chats in sidebar
                }}
            />
        </div>
    );
}
