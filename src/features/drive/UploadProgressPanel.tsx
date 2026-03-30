import { useState } from "react";
import { ChevronDown, ChevronUp, X, Check, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import type { UploadProgress } from "./types";

interface UploadProgressPanelProps {
    uploads: UploadProgress[];
    onClear: () => void;
    onRetry?: (uploadId: string) => void;
}

export default function UploadProgressPanel({ uploads, onClear, onRetry }: UploadProgressPanelProps) {
    const [collapsed, setCollapsed] = useState(false);

    const activeUploads = uploads.filter(u => u.status === "uploading" || u.status === "pending" || u.status === "streaming");
    const doneCount = uploads.filter(u => u.status === "completed").length;
    const errorCount = uploads.filter(u => u.status === "error").length;

    const allDone = activeUploads.length === 0;

    // Get status text
    const getStatusText = () => {
        if (allDone) {
            if (errorCount > 0) return `Завершено з ${errorCount} помилками`;
            return `Завантажено ${doneCount} файлів`;
        }
        return `В процесі: ${activeUploads.length} файлів`;
    };

    return (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer select-none"
                onClick={() => setCollapsed(!collapsed)}
            >
                <div className="flex items-center gap-2">
                    {!allDone && (
                        <Loader2 size={16} className={`animate-spin ${uploads.some(u => u.status === 'streaming') ? 'text-blue-500' : 'text-green-500'}`} />
                    )}
                    {allDone && errorCount === 0 && (
                        <Check size={16} className="text-green-500" />
                    )}
                    {allDone && errorCount > 0 && (
                        <AlertCircle size={16} className="text-red-500" />
                    )}
                    <span className="text-sm font-medium">{getStatusText()}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
                        className="p-1 hover:bg-gray-200 rounded"
                    >
                        {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {allDone && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClear(); }}
                            className="p-1 hover:bg-gray-200 rounded"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* File list */}
            {!collapsed && (
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {uploads.map((upload) => (
                        <div key={upload.id} className="px-4 py-3">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm truncate flex-1 mr-2">
                                    {upload.file.name}
                                </p>
                                {upload.status === "completed" && (
                                    <Check size={14} className="text-green-500 shrink-0" />
                                )}
                                {upload.status === "error" && (
                                    <div className="flex items-center gap-2 shrink-0">
                                        {onRetry && (
                                            <button 
                                                onClick={() => onRetry(upload.id)}
                                                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 bg-white rounded transition-colors"
                                                title="Повторити завантаження"
                                            >
                                                <RefreshCw size={14} />
                                            </button>
                                        )}
                                        <AlertCircle size={14} className="text-red-500" />
                                    </div>
                                )}
                                {upload.status === "uploading" && (
                                    <span className="text-xs text-green-500 font-medium shrink-0">
                                        {upload.progress}%
                                    </span>
                                )}
                                {upload.status === "streaming" && (
                                    <span className="text-xs text-blue-500 font-bold shrink-0">
                                         ЗБЕРЕЖЕННЯ: {upload.progress}%
                                    </span>
                                )}
                            </div>

                            {(upload.status === "uploading" || upload.status === "pending" || upload.status === "streaming") && (
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ease-out ${
                                            upload.status === "streaming" ? "bg-blue-500" : "bg-green-500"
                                        }`}
                                        style={{ width: `${upload.progress}%` }}
                                    />
                                </div>
                            )}

                            {upload.status === "error" && upload.error && (
                                <p className="text-xs text-red-400 mt-1">{upload.error}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
