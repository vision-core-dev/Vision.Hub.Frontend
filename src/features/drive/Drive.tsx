import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs } from "@/shared/components/tabs/tabs";
import { Breadcrumbs } from "@/shared/components/breadcrumbs/breadcrumbs.tsx";
import { HomeLine, UploadCloud01 } from "@untitledui/icons";
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
    
    // Drag & Drop State
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current += 1;
        if (e.dataTransfer.types && e.dataTransfer.types.includes("Files")) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // needed to allow drop
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);
        
        if (activeTab !== "drive") return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            handleUploadFiles(droppedFiles, "public", []);
        }
    };

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

    const processUpload = async (upload: UploadProgress) => {
        updateUploadProgress(upload.id, 0, "uploading");
        
        let pollingActive = true;
        const streamingId = upload.serverStreamingId!;

        try {
            // Phase 1: Upload to Server (Green)
            const res = await driveApi.uploadFile(upload.file, {
                folderId: upload.folderId !== undefined ? upload.folderId : currentFolderId,
                accessType: upload.accessType || "private",
                allowedRoleIds: upload.allowedRoleIds || [],
                uploadId: streamingId,
                onProgress: (percent) => {
                    if (!pollingActive) return;
                    updateUploadProgress(upload.id, percent, "uploading");
                },
            });

            // Phase 2: Stream from Server to Bunny (Blue)
            if (res && res.status === "processing") {
                updateUploadProgress(upload.id, 0, "streaming");
                await new Promise<void>((resolve, reject) => {
                    const poll = setInterval(async () => {
                        if (!pollingActive) {
                            clearInterval(poll);
                            reject(new Error("Upload cancelled"));
                            return;
                        }
                        try {
                            const statusData = await driveApi.getUploadStatus(streamingId);
                            if (!pollingActive) return;
                            
                            if (statusData.status === "streaming") {
                                updateUploadProgress(upload.id, statusData.progress, "streaming");
                            } else {
                                clearInterval(poll);
                                resolve();
                            }
                        } catch (e) {
                            clearInterval(poll);
                            reject(e);
                        }
                    }, 1000);
                });
            }

            // Phase 3: Finished
            pollingActive = false;
            updateUploadProgress(upload.id, 100, "completed");
            setTimeout(() => loadDrive(upload.folderId !== undefined ? upload.folderId : currentFolderId), 500); 
        } catch (err: any) {
            pollingActive = false;
            updateUploadProgress(upload.id, 0, "error", err.message || "Upload failed");
        }
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
            serverStreamingId: crypto.randomUUID(),
            accessType,
            allowedRoleIds,
            folderId: currentFolderId
        }));
        
        setUploads(prev => [...prev, ...newUploads]);

        newUploads.forEach(processUpload);
    };

    const handleRetryUpload = (uploadId: string) => {
        setUploads(prev => {
            const upload = prev.find(u => u.id === uploadId);
            if (!upload) return prev;
            
            const retryUpload: UploadProgress = {
                ...upload,
                status: "pending",
                progress: 0,
                error: undefined,
                serverStreamingId: crypto.randomUUID()
            };
            
            processUpload(retryUpload);
            return prev.map(u => u.id === uploadId ? retryUpload : u);
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
        <div 
            className="flex flex-col gap-4 p-6 relative min-h-full flex-1"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Drag & Drop Overlay */}
            {isDragging && activeTab === "drive" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-green-50/90 rounded-xl border-2 border-dashed border-green-400 m-4 pointer-events-none">
                    <div className="flex flex-col items-center text-green-600">
                        <UploadCloud01 className="w-16 h-16 mb-4 animate-bounce" />
                        <h2 className="text-2xl font-bold">Відпустіть файли для завантаження</h2>
                        <p className="text-green-500 mt-2">Файли будуть збережені у поточну папку</p>
                    </div>
                </div>
            )}

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
                    onRetry={handleRetryUpload}
                />
            )}
        </div>
    );
}
