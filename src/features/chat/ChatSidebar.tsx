import { useState, useEffect, useCallback } from "react";
import type { Key } from "react-aria-components";
import { Tabs } from "@/shared/components/tabs/tabs";
import { Button } from "@/shared/ui/buttons/button";
import { PlusSquare, MessageTextSquare02 } from "@untitledui/icons";
import { AvatarLabelGroup } from "@/shared/ui/avatar";
import { Input } from "@/shared/ui/input/input";
import { chatApi } from "./api";
import type { Chat } from "./types";
import { cx } from "@/shared/utils/cx";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";

const tabs = [
    { id: "all", label: "Усі" },
    { id: "direct", label: "Особисті" },
    { id: "groups", label: "Групові" },
];

interface ChatSidebarProps {
    onCreateChat?: () => void;
}

export default function ChatSidebar({ onCreateChat }: ChatSidebarProps) {
    const [tab, setTab] = useState<Key>("all");
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { chatId } = useParams<{ chatId?: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const loadChats = useCallback(async () => {
        try {
            setLoading(true);
            const data = await chatApi.getChats();
            setChats(data.chats);
        } catch (error) {
            console.error("Failed to load chats:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    // Filter chats based on tab and search
    const filteredChats = chats.filter((chat) => {
        // Tab filter
        if (tab === "direct" && chat.chat_type !== "direct") return false;
        if (tab === "groups" && chat.chat_type !== "group") return false;

        // Search filter
        if (search) {
            const chatName = getChatDisplayName(chat, user?.id);
            return chatName.toLowerCase().includes(search.toLowerCase());
        }

        return true;
    });

    const handleChatClick = (chat: Chat) => {
        navigate(`/chat/${chat.id}`);
    };

    return (
        <aside className="flex w-80 shrink-0 flex-col border-secondary md:border-r">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary">
                <h3 className="text-lg font-semibold">Чати</h3>
                <Button color="tertiary" iconLeading={PlusSquare} onClick={onCreateChat} />
            </div>

            {/* Search */}
            <div className="px-4 py-2">
                <Input
                    placeholder="Пошук чатів..."
                    value={search}
                    onChange={setSearch}
                />
            </div>

            {/* Tabs */}
            <div className="px-4">
                <Tabs selectedKey={tab} onSelectionChange={setTab}>
                    <Tabs.List type="underline" items={tabs}>
                        {(tab) => <Tabs.Item {...tab} />}
                    </Tabs.List>
                </Tabs>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <LoaderDots />
                    </div>
                ) : filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-tertiary">
                        <MessageTextSquare02 className="size-8 opacity-40" />
                        <p className="text-sm">Немає чатів</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filteredChats.map((chat) => (
                            <ChatListItem
                                key={chat.id}
                                chat={chat}
                                currentUserId={user?.id}
                                isActive={chat.id === chatId}
                                onClick={() => handleChatClick(chat)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}

interface ChatListItemProps {
    chat: Chat;
    currentUserId?: string;
    isActive: boolean;
    onClick: () => void;
}

function ChatListItem({ chat, currentUserId, isActive, onClick }: ChatListItemProps) {
    const displayName = getChatDisplayName(chat, currentUserId);
    const avatarUrl = getChatAvatarUrl(chat, currentUserId);
    const lastMessage = chat.last_message;

    const lastMessagePreview = lastMessage
        ? lastMessage.is_system
            ? lastMessage.content
            : `${lastMessage.sender?.first_name || "Користувач"}: ${lastMessage.content}`
        : "Немає повідомлень";

    const formattedTime = lastMessage
        ? formatMessageTime(lastMessage.created_at)
        : "";

    return (
        <div
            className={cx(
                "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/50",
                isActive && "bg-secondary"
            )}
            onClick={onClick}
        >
            <AvatarLabelGroup
                size="md"
                src={avatarUrl}
                title={displayName}
                subtitle={
                    <span className="flex items-center gap-2">
                        <span className="truncate flex-1 text-tertiary text-xs max-w-[140px]">
                            {lastMessagePreview}
                        </span>
                        {formattedTime && (
                            <span className="text-xs text-quaternary shrink-0">{formattedTime}</span>
                        )}
                    </span>
                }
            />

            {chat.unread_count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-medium text-white">
                    {chat.unread_count > 99 ? "99+" : chat.unread_count}
                </span>
            )}
        </div>
    );
}

// Helper functions
function getChatDisplayName(chat: Chat, currentUserId?: string): string {
    if (chat.chat_type === "group") {
        return chat.name || "Груповий чат";
    }

    // For direct chats, show the other user's name
    const otherMember = chat.members?.find((m) => m.user_id !== currentUserId);
    if (otherMember?.user) {
        const user = otherMember.user;
        return `${user.first_name} ${user.last_name || ""}`.trim();
    }

    return "Особистий чат";
}

function getChatAvatarUrl(chat: Chat, currentUserId?: string): string | undefined {
    if (chat.chat_type === "group") {
        return chat.avatar_url || undefined;
    }

    // For direct chats, show the other user's avatar
    const otherMember = chat.members?.find((m) => m.user_id !== currentUserId);
    return otherMember?.user?.avatar_url || undefined;
}

function formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
        return "Вчора";
    } else if (diffDays < 7) {
        return date.toLocaleDateString("uk-UA", { weekday: "short" });
    } else {
        return date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
    }
}
