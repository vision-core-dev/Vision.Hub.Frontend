// Chat Types
export interface ChatUser {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
}

export interface ChatMember {
    id: string;
    user_id: string;
    role: 'admin' | 'member';
    notifications_enabled: boolean;
    joined_at: string;
    user: ChatUser | null;
}

export interface ChatMessage {
    id: string;
    chat_id: string;
    sender_id: string | null;
    content: string;
    reply_to_id: string | null;
    is_system: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    sender: ChatUser | null;
    reply_to: ChatMessage | null;

    // Optional media fields
    message_type?: 'text' | 'audio' | 'image' | 'file';
    audio_url?: string | null;
    audio_duration?: number | null;  // in seconds
    attachment_url?: string | null;
    attachment_name?: string | null;
    attachment_size?: number | null;
}

export interface Chat {
    id: string;
    chat_type: 'direct' | 'group';
    name: string | null;
    avatar_url: string | null;
    created_by_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    members: ChatMember[] | null;
    last_message: ChatMessage | null;
    unread_count: number;
}

export interface ChatListResponse {
    chats: Chat[];
    total: number;
}

export interface MessagesListResponse {
    messages: ChatMessage[];
    total: number;
    has_more: boolean;
}
