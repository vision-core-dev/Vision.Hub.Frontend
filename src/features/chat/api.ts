import { api } from "@/shared/utils/api";
import type { Chat, ChatListResponse, ChatMessage, MessagesListResponse } from "./types";

const BASE = "/v1/Hub/Chat";

export const chatApi = {
    /**
     * Get all chats for current user
     */
    async getChats(): Promise<ChatListResponse> {
        const res = await api.get(`${BASE}/List`);
        if (!res.ok) throw new Error("Failed to fetch chats");
        return res.json();
    },

    /**
     * Get or create a direct chat with another user
     */
    async getOrCreateDirectChat(userId: string): Promise<Chat> {
        const res = await api.post(`${BASE}/Direct`, { user_id: userId });
        if (!res.ok) throw new Error("Failed to create direct chat");
        return res.json();
    },

    /**
     * Create a new group chat
     */
    async createGroupChat(name: string, memberIds: string[]): Promise<Chat> {
        const res = await api.post(`${BASE}/Group`, { name, member_ids: memberIds });
        if (!res.ok) throw new Error("Failed to create group chat");
        return res.json();
    },

    /**
     * Get chat details by ID
     */
    async getChat(chatId: string): Promise<Chat> {
        const res = await api.get(`${BASE}/${chatId}`);
        if (!res.ok) throw new Error("Failed to fetch chat");
        return res.json();
    },

    /**
     * Get messages for a chat
     */
    async getMessages(chatId: string, limit = 50, offset = 0): Promise<MessagesListResponse> {
        const res = await api.get(`${BASE}/${chatId}/Messages?limit=${limit}&offset=${offset}`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        return res.json();
    },

    /**
     * Send a message to a chat
     */
    /**
     * Send a message to a chat
     */
    async sendMessage(
        chatId: string,
        content: string,
        options?: {
            replyToId?: string;
            message_type?: 'text' | 'audio' | 'image' | 'file';
            attachment_url?: string;
            attachment_name?: string;
            attachment_size?: number;
            audio_duration?: number;
        }
    ): Promise<ChatMessage> {
        const res = await api.post(`${BASE}/${chatId}/Messages`, {
            content,
            reply_to_id: options?.replyToId,
            message_type: options?.message_type,
            attachment_url: options?.attachment_url,
            attachment_name: options?.attachment_name,
            attachment_size: options?.attachment_size,
            audio_duration: options?.audio_duration,
        });
        if (!res.ok) throw new Error("Failed to send message");
        return res.json();
    },

    /**
     * Update chat (group name, etc.)
     */
    async updateChat(chatId: string, data: { name?: string; avatar_url?: string }): Promise<Chat> {
        const res = await api.patch(`${BASE}/${chatId}`, data);
        if (!res.ok) throw new Error("Failed to update chat");
        return res.json();
    },

    /**
     * Add member to group chat
     */
    async addMember(chatId: string, userId: string): Promise<void> {
        const res = await api.post(`${BASE}/${chatId}/Members`, { user_id: userId });
        if (!res.ok) throw new Error("Failed to add member");
    },

    /**
     * Remove member from group chat
     */
    async removeMember(chatId: string, userId: string): Promise<void> {
        const res = await api.delete(`${BASE}/${chatId}/Members/${userId}`);
        if (!res.ok) throw new Error("Failed to remove member");
    },

    /**
     * Mark messages as read
     */
    async markAsRead(chatId: string, messageId: string): Promise<void> {
        const res = await api.post(`${BASE}/${chatId}/Read`, { message_id: messageId });
        if (!res.ok) throw new Error("Failed to mark as read");
    },
};
