import { useState, useEffect, useCallback } from "react";
import { Tabs } from "@/shared/components/tabs/tabs";
import { Breadcrumbs } from "@/shared/components/breadcrumbs/breadcrumbs.tsx";
import { HomeLine } from "@untitledui/icons";
import DriveToolbar from "./DriveToolbar";
import DriveGrid from "./DriveGrid";
import TaskDisk from "./TaskDisk";
import UploadProgressPanel from "./UploadProgressPanel";
import { useParams, useNavigate } from "react-router-dom";
import { driveApi } from "./api";
import type { DriveFolder, DriveFile, UploadProgress, AccessType } from "./types";

export default function DrivePage() {
    const { "*": folderPath } = useParams();
    const navigate = useNavigate();
    const currentFolderId = folderPath || null;
    
    const [activeTab, setActiveTab] = useState<string>("drive");
    const [folders, setFolders] = useState<DriveFolder[]>([]);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [breadcrumbs, setBreadcrumbs] = useState<DriveFolder[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [uploads, setUploads] = useState<UploadProgress[]>([]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            const hasActiveUploads = uploads.some(u => 
                u.status === "uploading" || u.status === "pending" || u.status === "streaming"
            );
            if (hasActiveUploads) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [uploads]);

    const loadDrive = useCallback(async (folderId?: string | null) => {
        setLoading(true);
        try {
            const data = await driveApi.list(folderId);
            setFolders(data.folders);
            setFiles(data.files);
            setBreadcrumbs(data.breadcrumbs);
        } catch (e) {
            console.error("Failed to load drive:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "drive") {
            loadDrive(currentFolderId);
        }
    }, [currentFolderId, activeTab, loadDrive]);

    const navigateToFolder = (folderId: string | null) => {
        if (folderId) {
            navigate(`/drive/${folderId}`);
        } else {
            navigate("/drive");
        }
        setSearchQuery("");
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            loadDrive(currentFolderId);
            return;
        }
        setLoading(true);
        try {
            const data = await driveApi.search(query);
            setFolders(data.folders);
            setFiles(data.files);
        } catch (e) {
            console.error("Search failed:", e);
        } finally {
            setLoading(false);
        }
    };

    const updateUploadProgress = (id: string, progress: number, status?: UploadProgress['status'], error?: string) => {
        setUploads(prev => prev.map(u =>
            u.id === id ? { 
                ...u, 
                progress, 
                status: (u.status === "completed" || u.status === "error") ? u.status : (status || u.status),
                error: error || u.error 
            } : u
        ));
    };

    const handleUploadFiles = async (
        filesToUpload: File[],
        accessType: AccessType,
        allowedRoleIds: string[]
    ) => {
        const newUploads: UploadProgress[] = filesToUpload.map(file => ({
            id: crypto.randomUUID(),
            file: file,
            progress: 0,
            status: "pending" as const,
            serverStreamingId: crypto.randomUUID()
        }));
        
        setUploads(prev => [...prev, ...newUploads]);

        newUploads.forEach(async (upload) => {
            updateUploadProgress(upload.id, 0, "uploading");
            
            let pollInterval: any = null;
            let pollingActive = true;
            const streamingId = upload.serverStreamingId!;

            try {
                const uploadPromise = driveApi.uploadFile(upload.file, {
                    folderId: currentFolderId,
                    accessType,
                    allowedRoleIds,
                    uploadId: streamingId,
                    onProgress: (percent) => {
                        if (!pollingActive) return;
                        updateUploadProgress(upload.id, percent);
                        
                        if (percent === 100 && !pollInterval) {
                            updateUploadProgress(upload.id, 0, "streaming");
                            pollInterval = setInterval(async () => {
                                if (!pollingActive) {
                                    clearInterval(pollInterval);
                                    return;
                                }
                                try {
                                    const statusData = await driveApi.getUploadStatus(streamingId);
                                    if (!pollingActive) return;
                                    
                                    if (statusData.status === "streaming") {
                                        updateUploadProgress(upload.id, statusData.progress, "streaming");
                                    } else if (statusData.status === "completed_or_not_found") {
                                        // Wait for the main promise to finish
                                        clearInterval(pollInterval);
                                    }
                                } catch {
                                    clearInterval(pollInterval);
                                }
                            }, 1000);
                        }
                    },
                });

                await uploadPromise;
                pollingActive = false;
                if (pollInterval) clearInterval(pollInterval);
                
                updateUploadProgress(upload.id, 100, "completed");
                setTimeout(() => loadDrive(currentFolderId), 500); // Small delay to let DB settle
            } catch (err: any) {
                pollingActive = false;
                if (pollInterval) clearInterval(pollInterval);
                updateUploadProgress(upload.id, 0, "error", err.message || "Upload failed");
            }
        });
    };

    const handleFolderCreated = () => loadDrive(currentFolderId);
    const handleItemDeleted = () => loadDrive(currentFolderId);
    const handleItemUpdated = () => loadDrive(currentFolderId);

    const clearFinishedUploads = () => {
        setUploads(prev => prev.filter(u => u.status === "uploading" || u.status === "pending" || u.status === "streaming"));
    };

    const tabItems = [
        { id: "drive", label: "Мій диск" },
        { id: "tasks", label: "Файли задач" },
    ];

    return (
        <div className="flex flex-col gap-4 p-6">
            {activeTab === "drive" && (
                <div className="flex flex-col gap-8">
                    <Breadcrumbs type="button" divider="slash" maxVisibleItems={6}>
                        <Breadcrumbs.Item
                            icon={HomeLine}
                            onClick={() => navigateToFolder(null)}
                        />
                        {breadcrumbs.map(bc => (
                            <Breadcrumbs.Item
                                key={bc.id}
                                onClick={() => navigateToFolder(bc.id)}
                            >
                                {bc.name}
                            </Breadcrumbs.Item>
                        ))}
                    </Breadcrumbs>
                </div>
            )}

            <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
                <Tabs.List type="underline" size="sm" items={tabItems}>
                    {(item) => <Tabs.Item key={item.id} id={item.id} label={item.label} />}
                </Tabs.List>

                <Tabs.Panel id="drive" className="pt-4">
                    <DriveToolbar
                        onUploadFiles={handleUploadFiles}
                        onFolderCreated={handleFolderCreated}
                        currentFolderId={currentFolderId}
                        searchQuery={searchQuery}
                        onSearch={handleSearch}
                    />

                    <div className="mt-4">
                        <DriveGrid
                            folders={folders}
                            files={files}
                            loading={loading}
                            onFolderOpen={navigateToFolder}
                            onItemDeleted={handleItemDeleted}
                            onItemUpdated={handleItemUpdated}
                        />
                    </div>
                </Tabs.Panel>

                <Tabs.Panel id="tasks" className="pt-4">
                    <TaskDisk />
                </Tabs.Panel>
            </Tabs>

            {uploads.length > 0 && (
                <UploadProgressPanel
                    uploads={uploads}
                    onClear={clearFinishedUploads}
                />
            )}
        </div>
    );
}
