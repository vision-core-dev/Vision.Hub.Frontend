import React, { useRef, useState } from "react";
import styles from "./AttachmentsSection.module.css";
import {File, Link as LinkIcon, MoreHorizontal, ExternalLink, Link} from "lucide-react";
import Button from "../../../../../basic/Button/Button.tsx";
import {api} from "../../../../../../utils/api.ts";

interface Attachment {
    id: string;
    name: string;
    url: string;
    type: "file" | "link";
    created_at?: string;
}

interface Props {
    attachments: Attachment[];
    onChange?: (newList: Attachment[]) => void;
}

const AttachmentsSection: React.FC<Props> = ({ attachments, onChange }) => {
    const [list, setList] = useState<Attachment[]>(attachments || []);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🖼️ Завантаження файлу
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/v1/Hub/UploadPhoto", formData);
        const data = await res.json();

        const newItem: Attachment = {
            id: crypto.randomUUID(),
            name: file.name,
            url: data.file_url,
            type: "file",
            created_at: new Date().toISOString(),
        };

        const updated = [...list, newItem];
        setList(updated);
        onChange?.(updated);
    };

    // 🔗 Додавання лінку
    const handleAddLink = () => {
        const url = prompt("Введіть посилання:");
        if (!url) return;

        const newItem: Attachment = {
            id: crypto.randomUUID(),
            name: url.replace(/^https?:\/\//, "").split("/")[0],
            url,
            type: "link",
            created_at: new Date().toISOString(),
        };

        const updated = [...list, newItem];
        setList(updated);
        onChange?.(updated);
    };

    const files = list.filter((a) => a.type === "file");
    const links = list.filter((a) => a.type === "link");

    return (
        <section className={styles.attachments}>
            <header>
                <div className={styles.titleWrap}>
                    <h3>Вкладення</h3>
                </div>
                <div className={styles.actions}>
                    <Button variant="secondary" onClick={handleAddLink}><Link /></Button>
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                        <File />
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        hidden
                        onChange={handleUpload}
                        accept="image/*,.pdf,.doc,.docx,.zip"
                    />
                </div>
            </header>

            <div className={styles.groups}>
                {links.length > 0 && (
                    <div className={styles.group}>
                        <h4>Посилання</h4>
                        <div className={styles.items}>
                            {links.map((link) => (
                                <div key={link.id} className={styles.item}>
                                    <div className={styles.icon}>
                                        <LinkIcon size={18} />
                                    </div>
                                    <div className={styles.details}>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                                            {link.name}
                                        </a>
                                        <span>
                                            {new Date(link.created_at || "").toLocaleString("uk-UA", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <button className={styles.more}>
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {files.length > 0 && (
                    <div className={styles.group}>
                        <h4>Файли</h4>
                        <div className={styles.items}>
                            {files.map((file) => (
                                <div key={file.id} className={styles.item}>
                                    <img src={file.url} alt={file.name} className={styles.thumb} />
                                    <div className={styles.details}>
                                        <span>{file.name}</span>
                                        <span>
                                            {new Date(file.created_at || "").toLocaleString("uk-UA", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <div className={styles.actionsRight}>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink size={15} />
                                        </a>
                                        <button className={styles.more}>
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AttachmentsSection;
