import React, { useState } from "react";
import { X, Download, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";

interface FilePreviewModalProps {
    /** File URL to preview */
    url: string;
    /** File name */
    name: string;
    /** File type/extension */
    type?: string;
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal should close */
    onClose: () => void;
}

/**
 * Determines the preview type based on file extension
 */
const getPreviewType = (fileName: string): "image" | "document" | "unsupported" => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    // Image types
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) {
        return "image";
    }

    // Document types that can be previewed
    if (["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) {
        return "document";
    }

    return "unsupported";
};

/**
 * FilePreviewModal - A reusable modal for previewing files
 * Supports images, documents (PDF, Office), and shows download option for unsupported types
 */
export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
    url,
    name,
    isOpen,
    onClose,
}) => {
    const [imageError, setImageError] = useState(false);
    const previewType = getPreviewType(name);

    if (!isOpen) return null;

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="text-gray-400 shrink-0" size={20} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {name}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            color="secondary"
                            iconLeading={Download}
                            onClick={handleDownload}
                        >
                            Завантажити
                        </Button>
                        <Button
                            size="sm"
                            color="tertiary"
                            iconLeading={X}
                            onClick={onClose}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-800">
                    {/* Image Preview */}
                    {previewType === "image" && !imageError && (
                        <div className="flex items-center justify-center h-full">
                            <img
                                src={url}
                                alt={name}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                onError={() => setImageError(true)}
                            />
                        </div>
                    )}

                    {/* Document Preview (PDF, Office files) */}
                    {previewType === "document" && (
                        <div className="h-full w-full">
                            <iframe
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
                                className="w-full h-full rounded-lg border-0"
                                title={name}
                            />
                        </div>
                    )}

                    {/* Unsupported File Type or Image Error */}
                    {(previewType === "unsupported" || imageError) && (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                            <div className="p-4 rounded-full bg-gray-200 dark:bg-gray-700">
                                <AlertCircle size={48} className="text-gray-400" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Неможливо показати передогляд файлу
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                                    {imageError
                                        ? "Не вдалося завантажити зображення. Спробуйте завантажити файл."
                                        : "Цей тип файлу не підтримує передогляд. Ви можете завантажити файл для перегляду."}
                                </p>
                            </div>
                            <Button
                                size="md"
                                color="primary"
                                iconLeading={Download}
                                onClick={handleDownload}
                            >
                                Завантажити файл
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
