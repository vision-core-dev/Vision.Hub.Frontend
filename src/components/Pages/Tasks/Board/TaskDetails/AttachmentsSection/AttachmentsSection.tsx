import React, { useRef, useState } from "react";
import styles from "./AttachmentsSection.module.css";
import {File, Link as LinkIcon, Link, SquarePen, Trash} from "lucide-react";
import Button from "../../../../../basic/Button/Button.tsx";
import {api} from "../../../../../../utils/api.ts";
import {safeDatetime} from "../../../../../../utils/safeDate.ts";

export interface Attachment {
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


            <div className={styles.items}>
                {[...links, ...files].map((att) => (
                    <div key={att.id} className={styles.item}>
                        {att.type === "file" ? (
                            <img src={att.url} alt={att.name} className={styles.thumb} />
                        ) : (
                            <div className={styles.icon}>
                                <LinkIcon size={18} />
                            </div>
                        )}

                        <div className={styles.details}>
                            {att.type === "link" ? (
                                <a href={att.url} target="_blank" rel="noopener noreferrer">
                                    {att.name}
                                </a>
                            ) : (
                                <span>{att.name}</span>
                            )}
                            <span>{safeDatetime(att.created_at)}</span>
                        </div>

                        <div className={styles.actionsRight}>
                            <button>
                                <SquarePen size={18} />
                            </button>
                            <button className={styles.destructive}>
                                <Trash size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>


        </section>
    );
};

export default AttachmentsSection;
