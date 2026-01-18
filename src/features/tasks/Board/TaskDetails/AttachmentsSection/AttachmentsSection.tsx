import React, { useRef, useState, useEffect } from "react";
import { Link as LinkIcon, Trash, File as FileIcon, UploadCloud, Image as ImageIcon, ExternalLink } from "lucide-react";
import { api } from "@/shared/utils/api";
import { safeDatetime } from "@/shared/utils/safeDate";
import { ButtonUtility } from "@/shared/ui/buttons/button-utility.tsx";



/* ===================== TYPES ===================== */

export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: "file" | "link";
    created_at?: string;
}

interface Props {
    taskId: string;
    attachments: Attachment[];
    onChange?: (list: Attachment[]) => void;
}

/* ===================== COMPONENT ===================== */

const AttachmentsSection: React.FC<Props> = ({
    taskId,
    attachments,
    onChange,
}) => {
    const [localAttachments, setLocalAttachments] = useState<Attachment[]>(attachments);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalAttachments(attachments);
    }, [attachments]);

    const notifyChange = (newAttachments: Attachment[]) => {
        setLocalAttachments(newAttachments);
        onChange?.(newAttachments);
    };

    /* ===================== UPLOAD LOGIC ===================== */

    const handleUploadFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            // Assuming API handles one file at a time or check if it handles multiple.
            // Based on prev code, let's upload one by one or all?
            // Existing API usually expects 'file'.
            for (let i = 0; i < files.length; i++) {
                formData.append("file", files[i]);
            }

            // Using api wrapper which handles Auth
            const res = await api.post(`/v1/Hub/Tasks/${taskId}/Attachments/UploadFile`, formData);
            if (res.ok) {
                const data = await res.json();
                // If API returns a single object
                const newFile: Attachment = {
                    id: data.id,
                    name: data.name,
                    url: data.url,
                    type: "file",
                    created_at: new Date().toISOString(),
                };
                notifyChange([...localAttachments, newFile]);
            } else {
                console.error("Upload failed");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddLink = async () => {
        const url = prompt("Введіть посилання (URL)");
        if (!url) return;

        try {
            const res = await api.post(`/v1/Hub/Tasks/${taskId}/Attachments/AddLink`, { url });
            if (res.ok) {
                const data = await res.json();
                const newLink: Attachment = {
                    id: data.id,
                    name: data.name || url,
                    url: data.url,
                    type: "link",
                    created_at: new Date().toISOString(),
                };
                notifyChange([...localAttachments, newLink]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemove = async (att: Attachment) => {
        if (!confirm("Видалити вкладення?")) return;
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/Attachments/${att.id}/Remove`);
            notifyChange(localAttachments.filter((a) => a.id !== att.id));
        } catch (e) {
            console.error(e);
        }
    };

    /* ===================== DND HANDLERS ===================== */

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleUploadFiles(e.dataTransfer.files);
    };

    /* ===================== RENDER ===================== */

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Вкладення</h3>
            </div>

            {/* DROP ZONE */}
            <div
                className={`transition-all duration-200 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer
                    ${isDragging ? "border-primary bg-primary/10" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}
                `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => handleUploadFiles(e.target.files)}
                />

                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
                    {isUploading ? <LoaderIcon /> : <UploadCloud size={24} />}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                    {isUploading ? "Завантаження..." : "Натисніть або перетягніть файли"}
                </p>
            </div>

            {/* LINKS ACTION */}
            {/* <div className="flex gap-2">
                <ButtonUtility size="sm" onClick={handleAddLink} icon={<LinkIcon size={16} />} />
            </div> */}

            {/* LIST */}
            {localAttachments.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mt-2">
                    {localAttachments.map((att) => (
                        <div
                            key={att.id}
                            className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-900 text-primary">
                                    {att.type === "link" ? <LinkIcon size={18} /> :
                                        att.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? <ImageIcon size={18} /> : <FileIcon size={18} />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <a
                                        href={att.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-medium hover:text-primary truncate"
                                    >
                                        {att.name}
                                    </a>
                                    <span className="text-[10px] text-gray-400">
                                        {safeDatetime(att.created_at)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                                >
                                    <ExternalLink size={16} />
                                </a>
                                <button
                                    onClick={() => handleRemove(att)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ButtonUtility
                className="w-full text-xs text-center justify-center opacity-70 hover:opacity-100"
                onClick={handleAddLink}
                icon={<LinkIcon size={14} />}
            >Do you want to add a link?</ButtonUtility>

        </section>
    );
};

const LoaderIcon = () => (
    <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default AttachmentsSection;









