import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { EmptyState } from "@/shared/components/empty-state/empty-state";
import { MessageItem, type Message } from "@/shared/components/messaging/messaging";
import { chatApi } from "./api";
import { api } from "@/shared/utils/api";
import type { Chat, ChatMessage } from "./types";
import { useAuth } from "@/core/auth/AuthContext";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";
import { ContentDivider } from "@/shared/ui/application/content-divider/content-divider";
import { MessageInput } from "./MessageInput";

interface ChatContentProps {
    onNewMessage?: (message: ChatMessage) => void;
    typingUsers?: { user_id: string; first_name: string }[];
}

export default function ChatContent({ onNewMessage, typingUsers = [] }: ChatContentProps) {
    const { chatId } = useParams<{ chatId?: string }>();
    const { user } = useAuth();

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLOListElement>(null);

    // Load chat and messages
    const loadChat = useCallback(async () => {
        if (!chatId) return;

        try {
            setLoading(true);
            const [chatData, messagesData] = await Promise.all([
                chatApi.getChat(chatId),
                chatApi.getMessages(chatId, 50, 0),
            ]);
            setChat(chatData);
            setMessages(messagesData.messages.reverse()); // Reverse to show oldest first
        } catch (error) {
            console.error("Failed to load chat:", error);
        } finally {
            setLoading(false);
        }
    }, [chatId]);

    useEffect(() => {
        loadChat();
    }, [loadChat]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);



    // Expose addMessage via callback
    useEffect(() => {
        if (onNewMessage) {
            // This will be called by parent with the new message
        }
    }, [onNewMessage]);

    // Send message with optional attachments
    const handleSendMessage = async (content: string, attachments?: File[]) => {
        if (!chatId) return;

        try {
            // If there are attachments, upload them first
            let uploadedUrls: string[] = [];
            if (attachments && attachments.length > 0) {
                const formData = new FormData();
                attachments.forEach((file) => {
                    formData.append("files", file);
                });

                const uploadRes = await api.post("/v1/Hub/Uploads/Chat", formData);
                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    uploadedUrls = data.urls || [];
                }
            }

            // If single file, send as structured message
            if (uploadedUrls.length === 1 && attachments && attachments.length === 1) {
                const file = attachments[0];
                const isImage = file.type.startsWith("image/");


                const newMessage = await chatApi.sendMessage(
                    chatId,
                    content, // Optional text content
                    {
                        message_type: isImage ? "image" : "file",
                        attachment_url: uploadedUrls[0],
                        attachment_name: file.name,
                        attachment_size: file.size,
                    }
                );
                setMessages((prev) => [...prev, newMessage]);
                return;
            }

            // Multiple files: use markdown links (legacy / fallback)
            const messageContent = uploadedUrls.length > 0
                ? `${content}\n\n${uploadedUrls.map(url => `[Файл](${url})`).join("\n")}`
                : content;

            const newMessage = await chatApi.sendMessage(chatId, messageContent);
            setMessages((prev) => [...prev, newMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    // Send voice message
    const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
        if (!chatId) return;

        try {
            // Upload audio file
            const formData = new FormData();
            formData.append("files", audioBlob, `voice_${Date.now()}.webm`);

            const uploadRes = await api.post("/v1/Hub/Uploads/Chat", formData);
            if (uploadRes.ok) {
                const data = await uploadRes.json();
                const audioUrl = data.urls?.[0];

                if (audioUrl) {
                    // Send as structured audio message
                    const newMessage = await chatApi.sendMessage(
                        chatId,
                        "", // Empty content for audio message
                        {
                            message_type: "audio",
                            attachment_url: audioUrl,
                            audio_duration: Math.round(duration),
                            attachment_name: "Voice Message",
                            attachment_size: audioBlob.size
                        }
                    );
                    setMessages((prev) => [...prev, newMessage]);
                }
            }
        } catch (error) {
            console.error("Failed to send voice message:", error);
        }
    };

    // Convert ChatMessage to Message format for MessageItem component
    const toMessageItemFormat = (msg: ChatMessage): Message => {
        const baseMessage: Message = {
            id: msg.id,
            sentAt: formatMessageTime(msg.created_at),
            user: msg.sender
                ? {
                    name: `${msg.sender.first_name} ${msg.sender.last_name || ""}`.trim(),
                    avatarUrl: msg.sender.avatar_url || undefined,
                    status: "online" as const,
                    me: msg.sender_id === user?.id,
                }
                : undefined,
            reply: msg.reply_to
                ? {
                    text: msg.reply_to.content,
                }
                : undefined,
        };

        // Handle audio messages
        if (msg.message_type === "audio" && msg.audio_duration) {
            const mins = Math.floor(msg.audio_duration / 60);
            const secs = msg.audio_duration % 60;
            const duration = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
            return {
                ...baseMessage,
                audio: {
                    duration,
                    src: msg.attachment_url || undefined
                },
            };
        }

        // Handle image messages
        if (msg.message_type === "image" && msg.attachment_url) {
            return {
                ...baseMessage,
                image: {
                    src: msg.attachment_url,
                    alt: msg.attachment_name || "Image",
                    name: msg.attachment_name || "image.jpg",
                    size: msg.attachment_size ? formatFileSize(msg.attachment_size) : "",
                },
            };
        }

        // Handle file attachments
        if (msg.message_type === "file" && msg.attachment_url) {
            const ext = msg.attachment_name?.split(".").pop()?.toLowerCase() || "txt";
            const type = ext === "pdf" ? "pdf" : ext === "mp4" ? "mp4" : ext === "jpg" || ext === "jpeg" || ext === "png" ? "jpg" : "txt";
            return {
                ...baseMessage,
                text: msg.content || undefined,
                attachment: {
                    name: msg.attachment_name || "file",
                    size: msg.attachment_size ? formatFileSize(msg.attachment_size) : "",
                    type: type as "jpg" | "txt" | "pdf" | "mp4",
                },
            };
        }

        // Helper to parse legacy text audio messages
        if (msg.message_type === "text" && msg.content && msg.content.startsWith("🎤 Голосове повідомлення")) {
            const match = msg.content.match(/🎤 Голосове повідомлення \((.*?)\)\n\[Прослухати\]\((.*?)\)/);
            if (match) {
                const [, duration, url] = match;
                return {
                    ...baseMessage,
                    audio: {
                        duration,
                        src: url
                    },
                };
            }
        }

        // Default: text message
        return {
            ...baseMessage,
            text: msg.is_deleted ? "[Повідомлення видалено]" : msg.content,
        };
    };

    // Format file size helper
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Get chat display name
    const getChatDisplayName = (): string => {
        if (!chat) return "Чат";
        if (chat.chat_type === "group") {
            return chat.name || "Груповий чат";
        }
        const otherMember = chat.members?.find((m) => m.user_id !== user?.id);
        if (otherMember?.user) {
            return `${otherMember.user.first_name} ${otherMember.user.last_name || ""}`.trim();
        }
        return "Особистий чат";
    };

    // Group messages by date
    const groupedMessages = groupMessagesByDate(messages);

    if (!chatId) {
        return (
            <section className="flex flex-1 flex-col items-center justify-center">
                <EmptyState size="md">
                    <EmptyState.Header>
                        <EmptyState.FeaturedIcon color="gray" />
                    </EmptyState.Header>
                    <EmptyState.Content>
                        <EmptyState.Title>Оберіть чат</EmptyState.Title>
                        <EmptyState.Description>
                            Виберіть чат зі списку або створіть новий, щоб розпочати спілкування.
                        </EmptyState.Description>
                    </EmptyState.Content>
                </EmptyState>
            </section>
        );
    }

    return (
        <section className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-secondary px-6 py-4">
                <h3 className="text-md font-semibold">{getChatDisplayName()}</h3>
                {chat?.chat_type === "group" && chat.members && (
                    <span className="text-sm text-tertiary">
                        {chat.members.length} учасників
                    </span>
                )}
            </div>

            {/* Messages */}
            <ol
                ref={messagesContainerRef}
                className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6 md:px-6"
            >
                {loading ? (
                    <div className="flex flex-1 items-center justify-center">
                        <LoaderDots />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center">
                        <EmptyState size="sm">
                            <EmptyState.Content>
                                <EmptyState.Title>Немає повідомлень</EmptyState.Title>
                                <EmptyState.Description>
                                    Відправте перше повідомлення, щоб розпочати спілкування.
                                </EmptyState.Description>
                            </EmptyState.Content>
                        </EmptyState>
                    </div>
                ) : (
                    <>
                        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                            <div key={date}>
                                <ContentDivider type="single-line" className="my-4">
                                    <span className="text-sm font-medium text-tertiary">{date}</span>
                                </ContentDivider>

                                {dayMessages.map((msg) => (
                                    <MessageItem
                                        key={msg.id}
                                        msg={toMessageItemFormat(msg)}
                                        showUserLabel={chat?.chat_type === "group"}
                                        className="mb-4"
                                    />
                                ))}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {typingUsers.length > 0 && (
                            <MessageItem
                                msg={{
                                    id: "typing",
                                    typing: true,
                                    user: {
                                        name: typingUsers.map((u) => u.first_name).join(", "),
                                        status: "online",
                                    },
                                }}
                            />
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </ol>

            {/* Input */}
            <div className="border-t border-secondary p-4">
                <MessageInput
                    onSendMessage={handleSendMessage}
                    onSendVoiceMessage={handleSendVoiceMessage}
                    disabled={loading}
                />
            </div>
        </section>
    );
}

// Helper functions
function formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Сьогодні";
    } else if (diffDays === 1) {
        return "Вчора";
    } else {
        return date.toLocaleDateString("uk-UA", {
            day: "numeric",
            month: "long",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
    }
}

function groupMessagesByDate(messages: ChatMessage[]): Record<string, ChatMessage[]> {
    const groups: Record<string, ChatMessage[]> = {};

    messages.forEach((msg) => {
        const dateKey = formatDateLabel(msg.created_at);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(msg);
    });

    return groups;
}

// Export addMessage helper for WebSocket integration
export function useAddMessageToChat() {
    const [, setMessages] = useState<ChatMessage[]>([]);

    const addMessage = useCallback((message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
    }, []);

    return { addMessage };
}
