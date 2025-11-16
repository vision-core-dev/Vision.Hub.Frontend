import type {
    GuildSettings,
    ModuleLog,
    UniversalStoreItem,
    VisionBotModule,
    VisionBotServer
} from "../types/VisionBot.ts";

import { api } from "../utils/api.ts";

const API_BASE = "/v1/Hub/VisionBot";

async function parse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        let err: any = null;
        try {
            err = await res.json();
        } catch (_) {}
        throw new Error(err?.detail || `Request failed: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

export const visionBotApi = {
    // SERVERS

    getServers: async () =>
        parse<VisionBotServer[]>(await api.get(`${API_BASE}/Servers/GetAll`)),

    getServer: async (guildId: string) =>
        parse<VisionBotServer>(await api.get(`${API_BASE}/Servers/${guildId}/Get`)),

    getGuildSettings: async (guildId: string) =>
        parse<GuildSettings>(await api.get(`${API_BASE}/Servers/${guildId}/GetSettings`)),

    updateGuildSettings: async (guildId: string, body: Partial<GuildSettings>) =>
        parse<GuildSettings>(await api.post(`${API_BASE}/Servers/${guildId}/UpdateSettings`, body)),

    // MODULES

    getModules: async (guildId: string) =>
        parse<VisionBotModule[]>(
            await api.get(`${API_BASE}/Modules/Get?guild_id=${guildId}`)
        ),

    getModule: async (moduleId: number) =>
        parse<VisionBotModule>(
            await api.get(`${API_BASE}/Modules/${moduleId}/Get`)
        ),

    updateModule: async (moduleId: number, body: Partial<VisionBotModule>) =>
        parse<VisionBotModule>(
            await api.post(`${API_BASE}/Modules/${moduleId}/Update`, body)
        ),

    deleteModule: async (moduleId: number) =>
        parse<{ status: string }>(
            await api.post(`${API_BASE}/Modules/${moduleId}/Delete`)
        ),

    // LOGS

    getLogs: async (guildId: string, params?: { module_id?: number; level?: string }) => {
        const q = new URLSearchParams();
        q.set("guild_id", guildId);

        if (params?.module_id) q.set("module_id", String(params.module_id));
        if (params?.level) q.set("level", params.level);

        return parse<ModuleLog[]>(
            await api.get(`${API_BASE}/Logs/Get?${q.toString()}`)
        );
    },

    // STORE

    getStoreItems: async (guildId: string) =>
        parse<UniversalStoreItem[]>(
            await api.get(`${API_BASE}/Store/Get?guild_id=${guildId}`)
        ),

    getStoreItem: async (itemId: number) =>
        parse<UniversalStoreItem>(
            await api.get(`${API_BASE}/Store/${itemId}/Get`)
        ),

    setStoreItem: async (body: any) =>
        parse<UniversalStoreItem>(
            await api.post(`${API_BASE}/Store/Set`, body)
        ),

    deleteStoreItem: async (itemId: number) =>
        parse<{ status: string }>(
            await api.post(`${API_BASE}/Store/${itemId}/Delete`)
        ),
};
