import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Trash, File as FileIcon, Image as ImageIcon, ExternalLink, MoreVertical, Pencil } from "lucide-react";
import { api } from "@/shared/utils/api";
import { safeDatetime } from "@/shared/utils/safeDate";
import { ButtonUtility } from "@/shared/ui/buttons/button-utility.tsx";
import { FileUpload } from "@/shared/components/file-upload/file-upload-base.tsx";
import { Dropdown } from "@/shared/ui/base/dropdown/dropdown";
import { Input } from "@/shared/ui/input/input";
import { Button } from "@/shared/ui/buttons/button";
import FilePreviewModal from "@/features/drive/FilePreviewModal";
import { cx } from "@/shared/utils/cx";



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
    isReadOnly?: boolean;
}

/* ===================== COMPONENT ===================== */

const AttachmentsSection: React.FC<Props> = ({
    taskId,
    attachments,
    onChange,
    isReadOnly = false,
}) => {
    const [localAttachments, setLocalAttachments] = useState<Attachment[]>(attachments);
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [previewFile, setPreviewFile] = useState<Attachment | null>(null);

    useEffect(() => {
        setLocalAttachments(attachments);
    }, [attachments]);

    const notifyChange = (newAttachments: Attachment[]) => {
        setLocalAttachments(newAttachments);
        onChange?.(newAttachments);
    };

    /* ===================== UPLOAD LOGIC ===================== */

    const handleUploadFiles = async (files: FileList) => {
        console.log("📁 Files received:", files, "Length:", files.length);
        if (!files || files.length === 0) {
            console.warn("No files to upload");
            return;
        }

        const newAttachments: Attachment[] = [];

        // Upload files sequentially
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("file", files[i]);

            console.log(`⬆️ Uploading file ${i + 1}/${files.length}:`, files[i].name);

            try {
                const res = await api.post(`/v1/Hub/Tasks/${taskId}/Attachments/UploadFile`, formData);
                if (res.ok) {
                    const data = await res.json();
                    console.log("✅ Upload successful:", data);
                    newAttachments.push({
                        id: data.id,
                        name: data.name,
                        url: data.url,
                        type: "file",
                        created_at: new Date().toISOString(),
                    });
                } else {
                    console.error(`❌ Failed to upload file: ${files[i].name}`, res.status);
                }
            } catch (e) {
                console.error("❌ Upload error:", e);
            }
        }

        if (newAttachments.length > 0) {
            console.log("✅ Adding attachments to list:", newAttachments);
            notifyChange([...localAttachments, ...newAttachments]);
        }
    };

    const handleAddLink = async () => {
        if (!linkUrl) return;

        try {
            const res = await api.post(`/v1/Hub/Tasks/${taskId}/Attachments/AddLink`, { url: linkUrl });
            if (res.ok) {
                const data = await res.json();
                const newLink: Attachment = {
                    id: data.id,
                    name: data.name || linkUrl,
                    url: data.url,
                    type: "link",
                    created_at: new Date().toISOString(),
                };
                notifyChange([...localAttachments, newLink]);
                setLinkUrl("");
                setIsLinkPopoverOpen(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemove = async (att: Attachment) => {
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/Attachments/${att.id}/Remove`);
            notifyChange(localAttachments.filter((a) => a.id !== att.id));
        } catch (e) {
            console.error(e);
        }
    };

    const handleRename = async (att: Attachment) => {
        const newName = prompt("Введіть нову назву", att.name);
        if (!newName || newName === att.name) return;

        try {
            // Assuming simplified update for now as discussed
            notifyChange(localAttachments.map(a => a.id === att.id ? { ...a, name: newName } : a));
        } catch (e) {
            console.error(e);
        }
    };

    /* ===================== RENDER ===================== */

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Вкладення</h3>
            </div>

            {/* DROP ZONE */}
            {!isReadOnly && (
                <FileUpload.Root>
                    <FileUpload.DropZone
                        hint="Будь-який файл"
                        accept="*"
                        maxSize={1024 * 1024 * 1000}
                        allowsMultiple={true}
                        onDropFiles={handleUploadFiles}
                    />
                </FileUpload.Root>
            )}

            {/* LIST */}
            {localAttachments.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 mt-2">
                    {localAttachments.map((att) => (
                        <div
                            key={att.id}
                            className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm transition-all hover:shadow-md"
                        >
                            <div
                                className={cx(
                                    "flex items-center gap-3 overflow-hidden flex-1 min-w-0",
                                    att.type === "file" && "cursor-pointer hover:opacity-80 transition-opacity"
                                )}
                                onClick={() => {
                                    if (att.type === "file") {
                                        setPreviewFile(att);
                                    }
                                }}
                            >
                                <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-900 text-primary">
                                    {att.type === "link" ? <LinkIcon size={18} /> :
                                        att.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? <ImageIcon size={18} /> : <FileIcon size={18} />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    {att.type === "link" ? (
                                        <a
                                            href={att.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm font-medium hover:text-primary truncate"
                                        >
                                            {att.name}
                                        </a>
                                    ) : (
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {att.name}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-gray-400">
                                        {safeDatetime(att.created_at)}
                                    </span>
                                </div>
                            </div>

                            {isReadOnly ? (
                                <Button size="sm" color="secondary" iconLeading={ExternalLink} onClick={() => window.open(att.url, "_blank")} />
                            ) : (
                                <Dropdown.Root>
                                    <Button size="sm" color="secondary" iconLeading={MoreVertical} />
                                    <Dropdown.Popover className="w-40">
                                        <Dropdown.Menu onAction={(key) => {
                                            if (key === "open") window.open(att.url, "_blank");
                                            if (key === "rename") handleRename(att);
                                            if (key === "delete") handleRemove(att);
                                        }}>
                                            <Dropdown.Item key="open" id="open" icon={ExternalLink} label="Відкрити" />
                                            <Dropdown.Item key="rename" id="rename" icon={Pencil} label="Перейменувати" />
                                            <Dropdown.Item key="delete" id="delete" icon={Trash} label="Видалити" />
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown.Root>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-sm text-gray-400 italic">Немає вкладень</div>
            )}

            {/* ADD LINK BUTTON with POPOVER */}
            {!isReadOnly && (
                <Dropdown.Root onOpenChange={setIsLinkPopoverOpen} isOpen={isLinkPopoverOpen}>
                    <ButtonUtility
                        className="w-full text-xs text-center justify-center opacity-70 hover:opacity-100"
                        icon={<LinkIcon size={14} />}
                    >
                        Додати посилання
                    </ButtonUtility>
                    <Dropdown.Popover className="p-3 w-[320px]">
                        <Input
                            placeholder="google.com"
                            value={linkUrl}
                            onChange={(v) => setLinkUrl(v as string)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" color="tertiary" onClick={() => setIsLinkPopoverOpen(false)}>Скасувати</Button>
                            <Button size="sm" color="primary" onClick={handleAddLink} disabled={!linkUrl}>Додати</Button>
                        </div>
                    </Dropdown.Popover>
                </Dropdown.Root>
            )}

            {/* File Preview Modal */}
            {previewFile && (
                <FilePreviewModal
                    url={previewFile.url}
                    name={previewFile.name}
                    type={previewFile.type}
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </section>
    );
};



export default AttachmentsSection;









