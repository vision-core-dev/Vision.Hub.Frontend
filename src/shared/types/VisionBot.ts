// src/types/visionBot.ts

export type VisionBotServer = {
    guild_id: string;          // bigint, але з фронта зручно як string
    name: string;              // назва гільдії з Discord
    icon_url?: string | null;  // аватар сервера
    language: string;
    logs_channel_id: string | null;
    modules_count: number;
    store_items_count: number;
};

export type GuildSettings = {
    guild_id: string;
    language: string;
    logs_channel_id: string | null;
    on_member_added_roles: string[]; // масив role_id
};

export type VisionBotModule = {
    id: number;
    server_id: string;
    name: string;
    code: string;
    meta: Record<string, unknown> | null;
    status: boolean;
    created_at: string | null;
    updated_at: string | null;
};

export type ModuleLogLevel = "info" | "warn" | "error";

export type ModuleLog = {
    id: number;
    module_id: number;
    server_id: string;
    level: ModuleLogLevel;
    message: string;
    timestamp: string; // ISO
};

export type UniversalStoreItem = {
    id: number;
    server_id: string;
    scope: string;
    module_id: number | null;
    name: string;
    key: string;
    data_type: string;
    value_type: string;
    value: unknown;
};








