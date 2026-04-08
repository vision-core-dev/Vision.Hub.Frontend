import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Trash, File as FileIcon, Image as ImageIcon, ExternalLink, MoreVertical, Pencil, Download, CheckSquare, Square } from "lucide-react";
import { api } from "@/shared/utils/api";
import { safeDatetime } from "@/shared/utils/safeDate";
import { ButtonUtility } from "@/shared/ui/buttons/button-utility.tsx";
import { FileUpload } from "@/shared/components/file-upload/file-upload-base.tsx";
import { Dropdown } from "@/shared/ui/base/dropdown/dropdown";
import { Input } from "@/shared/ui/input/input";
import { Button } from "@/shared/ui/buttons/button";
import FilePreviewModal from "@/features/drive/FilePreviewModal";

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

/* ===================== HELPERS ===================== */

async function downloadFile(url: string, name: string) {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = name;
        a.click();
        URL.revokeObjectURL(blobUrl);
    } catch {
        // Fallback: open in new tab
        window.open(url, "_blank");
    }
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
    const [selected, setSelected] = useState<Set<string>>(new Set());

    useEffect(() => {
        setLocalAttachments(attachments);
    }, [attachments]);

    const notifyChange = (newAttachments: Attachment[]) => {
        setLocalAttachments(newAttachments);
        onChange?.(newAttachments);
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const downloadSelected = () => {
        localAttachments
            .filter(a => selected.has(a.id) && a.type === "file")
            .forEach((a, i) => setTimeout(() => downloadFile(a.url, a.name), i * 200));
        setSelected(new Set());
    };

    /* ===================== UPLOAD LOGIC ===================== */

    const handleUploadFiles = async (files: FileList) => {
        if (!files || files.length === 0) return;
        const newAttachments: Attachment[] = [];
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("file", files[i]);
            try {
                const res = await api.post(`/v1/Hub/Tasks/${taskId}/Attachments/UploadFile`, formData);
                if (res.ok) {
                    const data = await res.json();
                    newAttachments.push({ id: data.id, name: data.name, url: data.url, type: "file", created_at: new Date().toISOString() });
                }
            } catch (e) { console.error(e); }
        }
        if (newAttachments.length > 0) notifyChange([...localAttachments, ...newAttachments]);
    };

    const handleAddLink = async () => {
        if (!linkUrl) return;
        try {
            const res = await api.post(`/v1/Hub/Tasks/${taskId}/Attachments/AddLink`, { url: linkUrl });
            if (res.ok) {
                const data = await res.json();
                notifyChange([...localAttachments, { id: data.id, name: data.name || linkUrl, url: data.url, type: "link", created_at: new Date().toISOString() }]);
                setLinkUrl("");
                setIsLinkPopoverOpen(false);
            }
        } catch (e) { console.error(e); }
    };

    const handleRemove = async (att: Attachment) => {
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/Attachments/${att.id}/Remove`);
            notifyChange(localAttachments.filter((a) => a.id !== att.id));
        } catch (e) { console.error(e); }
    };

    const handleRename = async (att: Attachment) => {
        const newName = prompt("Введіть нову назву", att.name);
        if (!newName || newName === att.name) return;
        notifyChange(localAttachments.map(a => a.id === att.id ? { ...a, name: newName } : a));
    };

    const hasSelection = selected.size > 0;

    /* ===================== RENDER ===================== */

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Вкладення</h3>
                {hasSelection && (
                    <Button size="sm" color="secondary" iconLeading={Download} onClick={downloadSelected}>
                        Завантажити ({selected.size})
                    </Button>
                )}
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
                            <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                                {/* Checkbox / icon */}
                                {att.type === "file" ? (
                                    <button
                                        onClick={() => toggleSelect(att.id)}
                                        className="p-2 rounded-md bg-gray-50 dark:bg-gray-900 text-primary cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        {selected.has(att.id) ? (
                                            <CheckSquare size={18} className="text-fg-brand-primary" />
                                        ) : (
                                            <span className="group-hover:hidden">
                                                {att.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? <ImageIcon size={18} /> : <FileIcon size={18} />}
                                            </span>
                                        )}
                                        {!selected.has(att.id) && (
                                            <span className="hidden group-hover:block">
                                                <Square size={18} className="text-fg-quaternary" />
                                            </span>
                                        )}
                                    </button>
                                ) : (
                                    <div className="p-2 rounded-md bg-gray-50 dark:bg-gray-900 text-primary">
                                        <LinkIcon size={18} />
                                    </div>
                                )}

                                <div
                                    className="flex flex-col min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setPreviewFile(att)}
                                >
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {att.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {safeDatetime(att.created_at)}
                                    </span>
                                </div>
                            </div>

                            {isReadOnly ? (
                                <div className="flex items-center gap-1">
                                    {att.type === "file" && (
                                        <Button size="sm" color="secondary" iconLeading={Download} onClick={() => downloadFile(att.url, att.name)} />
                                    )}
                                    <Button size="sm" color="secondary" iconLeading={ExternalLink} onClick={() => window.open(att.url, "_blank")} />
                                </div>
                            ) : (
                                <Dropdown.Root>
                                    <Button size="sm" color="secondary" iconLeading={MoreVertical} />
                                    <Dropdown.Popover className="w-44">
                                        <Dropdown.Menu onAction={(key) => {
                                            if (key === "open") window.open(att.url, "_blank");
                                            if (key === "download") downloadFile(att.url, att.name);
                                            if (key === "rename") handleRename(att);
                                            if (key === "delete") handleRemove(att);
                                        }}>
                                            <Dropdown.Item key="open" id="open" icon={ExternalLink} label="Відкрити" />
                                            {att.type === "file" && (
                                                <Dropdown.Item key="download" id="download" icon={Download} label="Завантажити" />
                                            )}
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

            {/* ADD LINK BUTTON */}
            {!isReadOnly && (
                <Dropdown.Root onOpenChange={setIsLinkPopoverOpen} isOpen={isLinkPopoverOpen}>
                    <ButtonUtility
                        className="w-full text-xs text-center justify-center opacity-70 hover:opacity-100"
                        icon={<LinkIcon size={14} />}
                    >
                        Додати посилання
                    </ButtonUtility>
                    <Dropdown.Popover className="p-3 w-[320px]">
                        <Input placeholder="google.com" value={linkUrl} onChange={(v) => setLinkUrl(v as string)} autoFocus />
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
