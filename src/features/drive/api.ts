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
     * Upload with XMLHttpRequest for progress tracking.
     * Returns a promise that resolves with the server response
     * and calls onProgress with 0-100 percent.
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
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder_id", options.folderId || "");
            formData.append("access_type", options.accessType || "public");
            formData.append(
                "allowed_role_ids",
                (options.allowedRoleIds || []).join(",")
            );

            const url = `${import.meta.env.VITE_API_URL}/v1/Hub/Drive/Files/Upload${options.uploadId ? `?upload_id=${options.uploadId}` : ''}`;

            xhr.open("POST", url.toString());

            const token = localStorage.getItem("token");
            if (token) {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && options.onProgress) {
                    options.onProgress(Math.round((e.loaded / e.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch {
                        resolve({ ok: true });
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error("Upload failed"));

            if (options.signal) {
                options.signal.addEventListener("abort", () => {
                    xhr.abort();
                    reject(new Error("Upload cancelled"));
                });
            }

            xhr.send(formData);
        });
    },

    async deleteFile(fileId: string) {
        const res = await api.delete(`/v1/Hub/Drive/Files/${fileId}`);
        if (!res.ok) throw new Error("Failed to delete file");
        return res.json();
    },

    async updateFile(fileId: string, data: {
        name?: string;
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
