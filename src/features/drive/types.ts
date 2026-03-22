export interface DriveFolder {
    id: string;
    name: string;
    parent_id: string | null;
    owner_id: string;
    access_type: "private" | "role" | "public";
    allowed_role_ids: string[] | null;
    is_task_disk: boolean;
    created_at: string | null;
}

export interface DriveFile {
    id: string;
    folder_id: string | null;
    owner_id: string;
    name: string;
    url: string;
    size: number;
    mime_type: string | null;
    access_type: "private" | "role" | "public";
    allowed_role_ids: string[] | null;
    task_attachment_id: string | null;
    created_at: string | null;
}

export interface DriveListResponse {
    folders: DriveFolder[];
    files: DriveFile[];
    current_folder: DriveFolder | null;
    breadcrumbs: DriveFolder[];
}

export interface TaskDiskFile {
    id: string;
    name: string;
    url: string;
    task_id: string;
    task_name: string;
    board_id: string | null;
    board_name: string;
    created_at: string | null;
}

export type AccessType = "private" | "role" | "public";

export interface UploadProgress {
    id: string;
    file: File;
    progress: number;
    status: "pending" | "uploading" | "streaming" | "completed" | "error";
    error?: string;
    serverStreamingId?: string;
    result?: DriveFile;
}
