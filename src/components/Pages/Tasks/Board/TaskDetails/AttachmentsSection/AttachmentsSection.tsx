import { useEffect, useState } from "react";
import { Link as LinkIcon, Trash, File } from "lucide-react";
import { api } from "@/utils/api";
import { safeDatetime } from "@/utils/safeDate";
import {ButtonUtility} from "@/ui/base/buttons/button-utility.tsx";

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
    const [files, setFiles] = useState<Attachment[]>([]);
    const [links, setLinks] = useState<Attachment[]>([]);
    // const [uploading, setUploading] = useState<UploadedFile[]>([]);

    /* ===================== INIT ===================== */

    useEffect(() => {
        setFiles(attachments.filter((a) => a.type === "file"));
        setLinks(attachments.filter((a) => a.type === "link"));
    }, [attachments]);

    const sync = (nextFiles: Attachment[], nextLinks = links) => {
        onChange?.([...nextLinks, ...nextFiles]);
    };

    /* ===================== FILE UPLOAD ===================== */

    // const uploadFile = async (
    //     file: File,
    //     onProgress: (p: number) => void
    // ) => {
    //     const formData = new FormData();
    //     formData.append("file", file);
    //
    //     const xhr = new XMLHttpRequest();
    //     xhr.open(
    //         "POST",
    //         `/v1/Hub/Tasks/${taskId}/Attachments/UploadFile`
    //     );
    //
    //     xhr.upload.onprogress = (e) => {
    //         if (e.lengthComputable) {
    //             onProgress(Math.round((e.loaded / e.total) * 100));
    //         }
    //     };
    //
    //     xhr.onload = () => {
    //         const data = JSON.parse(xhr.responseText);
    //
    //         const newFile: Attachment = {
    //             id: data.id,
    //             name: data.name,
    //             url: data.url,
    //             type: "file",
    //             created_at: new Date().toISOString(),
    //         };
    //
    //         const updated = [...files, newFile];
    //         setFiles(updated);
    //         sync(updated);
    //     };
    //
    //     xhr.onerror = () => {
    //         throw new Error("Upload failed");
    //     };
    //
    //     xhr.send(formData);
    // };

    // const handleDropFiles = (fileList: FileList) => {
    //     const newFiles = Array.from(fileList);
    //
    //     const uploadItems: UploadedFile[] = newFiles.map((file) => ({
    //         id: crypto.randomUUID(),
    //         name: file.name,
    //         size: file.size,
    //         type: file.type,
    //         progress: 0,
    //         fileObject: file,
    //     }));
    //
    //     setUploading((prev) => [...uploadItems, ...prev]);
    //
    //     uploadItems.forEach(({ id, fileObject }) => {
    //         uploadFile(fileObject, (progress) => {
    //             setUploading((prev) =>
    //                 prev.map((f) =>
    //                     f.id === id ? { ...f, progress } : f
    //                 )
    //             );
    //         });
    //     });
    // };
    //
    // const handleDeleteUploaded = (id: string) => {
    //     setUploading((prev) => prev.filter((f) => f.id !== id));
    // };

    /* ===================== LINKS ===================== */

    const handleAddLink = async () => {
        const url = prompt("Введіть посилання");
        if (!url) return;

        const res = await api.post(
            `/v1/Hub/Tasks/${taskId}/Attachments/AddLink`,
            { url }
        );

        const data = await res.json();

        const newLink: Attachment = {
            id: data.id,
            name: data.name,
            url: data.url,
            type: "link",
            created_at: new Date().toISOString(),
        };

        const updated = [...links, newLink];
        setLinks(updated);
        sync(files, updated);
    };

    const handleRemoveAttachment = async (att: Attachment) => {
        await api.post(
            `/v1/Hub/Tasks/${taskId}/Attachments/${att.id}/Remove`
        );

        if (att.type === "file") {
            const updated = files.filter((f) => f.id !== att.id);
            setFiles(updated);
            sync(updated);
        } else {
            const updated = links.filter((l) => l.id !== att.id);
            setLinks(updated);
            sync(files, updated);
        }
    };

    /* ===================== RENDER ===================== */

    return (
        <section className="flex flex-col gap-4">
            <header className={"flex flex-row gap-4 items-center justify-between"}>
                <h3 className="text-sm font-medium">Вкладення</h3>
                <ButtonUtility size="sm" className="mt-2" onClick={handleAddLink} icon={<File size={16} />} />
                <ButtonUtility size="sm" className="mt-2" onClick={handleAddLink} icon={<LinkIcon size={16} />} />
            </header>

            {/* FILE UPLOAD */}
            {/*<FileUpload.Root>*/}
            {/*    <FileUpload.DropZone*/}
            {/*        onDropFiles={handleDropFiles}*/}
            {/*        hint="Перетягніть файли або натисніть для вибору"*/}
            {/*    />*/}

            {/*    <FileUpload.List>*/}
            {/*        {uploading.map((file) => (*/}
            {/*            <FileUpload.ListItemProgressBar*/}
            {/*                key={file.id}*/}
            {/*                {...file}*/}
            {/*                onDelete={() =>*/}
            {/*                    handleDeleteUploaded(file.id)*/}
            {/*                }*/}
            {/*            />*/}
            {/*        ))}*/}
            {/*    </FileUpload.List>*/}
            {/*</FileUpload.Root>*/}

            {/* FILES */}
            {files.map((file) => (
                <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                    <a
                        href={file.url}
                        target="_blank"
                        className="truncate text-sm text-primary hover:underline"
                    >
                        {file.name}
                    </a>
                    <div className="flex items-center gap-3 text-xs text-tertiary">
                        {safeDatetime(file.created_at)}
                        <button
                            onClick={() =>
                                handleRemoveAttachment(file)
                            }
                        >
                            <Trash size={14} />
                        </button>
                    </div>
                </div>
            ))}

            {/* LINKS */}
            {links.map((link) => (
                <div
                    key={link.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                    <a
                        href={link.url}
                        target="_blank"
                        className="flex items-center gap-2 truncate text-sm text-primary"
                    >
                        <LinkIcon size={14} />
                        {link.name || link.url}
                    </a>
                    <button
                        onClick={() =>
                            handleRemoveAttachment(link)
                        }
                    >
                        <Trash size={14} />
                    </button>
                </div>
            ))}

            {/*<Button*/}
            {/*    size="sm"*/}
            {/*    onClick={handleAddLink}*/}
            {/*>*/}
            {/*    <LinkIcon size={14} />*/}
            {/*    Додати посилання*/}
            {/*</Button>*/}
        </section>
    );
};

export default AttachmentsSection;
