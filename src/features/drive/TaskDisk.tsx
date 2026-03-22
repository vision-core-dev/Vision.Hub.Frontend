import { useState, useEffect } from "react";
import { driveApi } from "./api";
import type { TaskDiskFile } from "./types";
import FilePreviewModal from "./FilePreviewModal";
import { Download, Eye, Kanban } from "lucide-react";
import { File06 } from "@untitledui/icons";

export default function TaskDisk() {
    const [files, setFiles] = useState<TaskDiskFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewFile, setPreviewFile] = useState<TaskDiskFile | null>(null);

    useEffect(() => {
        loadTaskDisk();
    }, []);

    const loadTaskDisk = async () => {
        setLoading(true);
        try {
            const data = await driveApi.taskDisk();
            setFiles(data.files);
        } catch (e) {
            console.error("Failed to load task disk:", e);
        } finally {
            setLoading(false);
        }
    };

    // Group files by board
    const grouped = files.reduce<Record<string, { boardName: string; files: TaskDiskFile[] }>>((acc, file) => {
        const key = file.board_id || "no-board";
        if (!acc[key]) {
            acc[key] = { boardName: file.board_name, files: [] };
        }
        acc[key].files.push(file);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
                    <span className="text-sm">Завантаження файлів задач...</span>
                </div>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Kanban className="w-12 h-12 mb-3" />
                <p className="text-sm font-medium">Файли задач відсутні</p>
                <p className="text-xs mt-1">Прикріпіть файли до задач у дошках</p>
            </div>
        );
    }

    return (
        <>
            <div className="mb-4">
                <p className="text-sm text-gray-500">
                    Динамічний диск із файлами, прикріпленими до задач. Завантаження напряму сюди недоступне.
                </p>
            </div>

            {Object.entries(grouped).map(([boardId, group]) => (
                <div key={boardId} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Kanban size={16} className="text-gray-500" />
                        <h3 className="text-sm font-semibold text-gray-700">
                            {group.boardName}
                        </h3>
                        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                            {group.files.length}
                        </span>
                    </div>

                    <div className="space-y-1.5">
                        {group.files.map(file => (
                            <TaskFileRow
                                key={file.id}
                                file={file}
                                onPreview={() => setPreviewFile(file)}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {previewFile && (
                <FilePreviewModal
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    url={previewFile.url}
                    name={previewFile.name}
                />
            )}
        </>
    );
}

function TaskFileRow({
    file,
    onPreview,
}: {
    file: TaskDiskFile;
    onPreview: () => void;
}) {
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex items-center justify-between rounded-lg bg-white border border-gray-100 px-4 py-3 hover:bg-gray-50 transition group">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <File06 className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                        {file.task_name}
                        {file.created_at && (
                            <> · {new Date(file.created_at).toLocaleDateString("uk")}</>
                        )}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onPreview}
                    className="p-1.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                    title="Переглянути"
                >
                    <Eye size={16} />
                </button>
                <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                    title="Завантажити"
                >
                    <Download size={16} />
                </button>
            </div>
        </div>
    );
}
