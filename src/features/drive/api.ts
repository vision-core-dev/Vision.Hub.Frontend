import { api } from "@/shared/utils/api";
import type { DriveListResponse, TaskDiskFile, AccessType } from "./types";

export const driveApi = {
    async list(folderId?: string | null): Promise<DriveListResponse> {
        const params = folderId ? `?folder_id=${folderId}` : "";
        const res = await api.get(`/v1/Hub/Drive/List${params}`);
        if (!res.ok) throw new Error("Failed to load drive");
        return res.json();
    },

    async createFolder(data: {
        name: string;
        parent_id?: string | null;
        access_type?: AccessType;
        allowed_role_ids?: string[];
    }) {
        const res = await api.post("/v1/Hub/Drive/Folders/Create", data);
        if (!res.ok) throw new Error("Failed to create folder");
        return res.json();
    },

    async updateFolder(folderId: string, data: {
        name?: string;
        parent_id?: string | null;
        access_type?: AccessType;
        allowed_role_ids?: string[];
    }) {
        const res = await api.patch(`/v1/Hub/Drive/Folders/${folderId}`, data);
        if (!res.ok) throw new Error("Failed to update folder");
        return res.json();
    },

    async deleteFolder(folderId: string) {
        const res = await api.delete(`/v1/Hub/Drive/Folders/${folderId}`);
        if (!res.ok) throw new Error("Failed to delete folder");
        return res.json();
    },

    /**
     * Upload with WebSockets to bypass 100s timeouts for large files.
     * Returns a promise that resolves with the server response
     * and calls onProgress with 0-50 percent (client to server).
     */
    uploadFile(
        file: File,
        options: {
            folderId?: string | null;
            accessType?: AccessType;
            allowedRoleIds?: string[];
            uploadId?: string; // For server-side tracking
            onProgress?: (percent: number) => void;
            signal?: AbortSignal;
        } = {}
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            let baseUrl = import.meta.env.VITE_API_URL || "";
            // Replace http/https with ws/wss
            const wsUrl = baseUrl.replace(/^http/, "ws") + "/v1/Hub/Drive/Files/UploadWS";
            
            const token = localStorage.getItem("token");
            if (!token) return reject(new Error("No token available"));

            const ws = new WebSocket(wsUrl);

            if (options.signal) {
                options.signal.addEventListener("abort", () => {
                    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                        ws.close(1000, "Aborted");
                    }
                    reject(new Error("Upload cancelled"));
                });
            }

            ws.onopen = () => {
                // 1. Send initialization config
                ws.send(JSON.stringify({
                    token,
                    filename: file.name,
                    content_type: file.type || "application/octet-stream",
                    folder_id: options.folderId || null,
                    access_type: options.accessType || "public",
                    allowed_role_ids: options.allowedRoleIds || [],
                    upload_id: options.uploadId,
                }));
            };

            ws.onmessage = async (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    
                    if (msg.status === "ready") {
                        // 2. Start sending chunks
                        const chunkSize = 1024 * 1024; // 1MB chunks
                        let offset = 0;

                        while (offset < file.size) {
                            if (ws.readyState !== WebSocket.OPEN) break;
                            
                            // Backpressure: wait if browser has buffered > 4MB to prevent connection flood (ping timeouts)
                            while (ws.bufferedAmount > 4 * 1024 * 1024) {
                                await new Promise(r => setTimeout(r, 50));
                                if (ws.readyState !== WebSocket.OPEN) break;
                            }
                            
                            if (ws.readyState !== WebSocket.OPEN) break;
                            
                            const chunk = file.slice(offset, offset + chunkSize);
                            // We wait for the chunk to be read as ArrayBuffer, then send it via ws
                            const buffer = await chunk.arrayBuffer();
                            ws.send(buffer);
                            offset += chunk.size;
                            
                            if (options.onProgress) {
                                // Maps exactly to 0-50% progress range for client->server part
                                options.onProgress(Math.round((offset / file.size) * 50));
                            }
                        }

                        // Send End of File
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ type: "eof" }));
                        }
                    } else if (msg.status === "success" || msg.status === "processing") {
                        // 3. Backend fully received the file, returning ok
                        resolve({ status: "processing", upload_id: options.uploadId });
                    } else if (msg.type === "error") {
                        reject(new Error(msg.message || "WebSocket Error"));
                    }
                } catch(e) {
                    console.error("WS Parse error", e);
                }
            };

            ws.onerror = () => {
                reject(new Error("WebSocket upload failed for " + file.name));
            };

            ws.onclose = (e) => {
                if (e.code !== 1000) {
                    reject(new Error(`WebSocket closed early (Code: ${e.code}) for file: ${file.name}`));
                }
            };
        });
    },

    async deleteFile(fileId: string) {
        const res = await api.delete(`/v1/Hub/Drive/Files/${fileId}`);
        if (!res.ok) throw new Error("Failed to delete file");
        return res.json();
    },

    async updateFile(fileId: string, data: {
        name?: string;
        folder_id?: string | null;
        access_type?: AccessType;
        allowed_role_ids?: string[];
    }) {
        const res = await api.patch(`/v1/Hub/Drive/Files/${fileId}`, data);
        if (!res.ok) throw new Error("Failed to update file");
        return res.json();
    },

    async taskDisk(boardId?: string): Promise<{ files: TaskDiskFile[] }> {
        const params = boardId ? `?board_id=${boardId}` : "";
        const res = await api.get(`/v1/Hub/Drive/TaskDisk${params}`);
        if (!res.ok) throw new Error("Failed to load task disk");
        return res.json();
    },

    async search(query: string): Promise<DriveListResponse> {
        const res = await api.get(`/v1/Hub/Drive/Search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Search failed");
        return res.json();
    },
    async getUploadStatus(uploadId: string): Promise<{ progress: number, status: string }> {
        const res = await api.get(`/v1/Hub/Drive/Files/UploadStatus/${uploadId}`);
        if (!res.ok) throw new Error("Status failed");
        return res.json();
    },
};
