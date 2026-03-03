import React, { useEffect, useState } from "react";
import styles from "./KnowledgeContent.module.css";
import { Calendar, User, Save } from "lucide-react";
import { api } from "@/shared/utils/api.ts";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots.tsx";
import { safeDatetime } from "@/shared/utils/safeDate.ts";
import TextEditor from "@/shared/ui/text-editor-basic/TextEditor.tsx";

interface DocumentData {
    id: string;
    title: string;
    content: string;
    author: string;
    updated_at: string;
}

interface Props {
    documentId?: string;
    sidebarButton?: React.ReactNode;
    sidebarClose?: () => void;
}

const KnowledgeContentEdit: React.FC<Props> = ({ documentId, sidebarButton, sidebarClose }) => {
    const [doc, setDoc] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [saving, setSaving] = useState(false);

    // -------------------------------
    //   LOAD DOCUMENT
    // -------------------------------
    useEffect(() => {
        if (!documentId) {
            setDoc(null);
            return;
        }

        const fetchDoc = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/v1/Hub/Knowledge/${documentId}/GetDocument`);
                const data = await res.json();

                if (res.ok) {
                    setDoc(data.document);
                    setEditTitle(data.document.title);
                    setEditContent(data.document.content);
                } else {
                    setDoc(null);
                }
            } catch (err) {
                console.error("❌ Error loading document:", err);
                setDoc(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDoc();
    }, [documentId]);

    // -------------------------------
    //   SAVE DOCUMENT
    // -------------------------------
    const handleSave = async () => {
        if (!doc) return;
        setSaving(true);

        try {
            const res = await api.post(`/v1/Hub/Knowledge/${doc.id}/UpdateDocument`, {
                title: editTitle,
                content: editContent,
            });

            const data = await res.json();

            if (res.ok) {
                setDoc({
                    ...doc,
                    title: editTitle,
                    content: editContent,
                    updated_at: new Date().toISOString(),
                });
            } else {
                console.warn("⚠️ Save error:", data.detail);
            }
        } catch (err) {
            console.error("❌ Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    // -------------------------------
    //          RENDER
    // -------------------------------

    if (loading)
        return (
            <div className={`${styles.content} dark:bg-gray-900/90`}>
                <LoaderDots />
            </div>
        );

    if (!doc)
        return (
            <div className={`${styles.content} dark:bg-gray-900/90`}>
                <div className={`${styles.empty} dark:text-gray-500`}>📄 Виберіть документ у меню</div>
            </div>
        );

    return (
        <div
            className={`${styles.content} dark:text-gray-200 dark:bg-gray-900/90`}
            onClick={() => {
                if (sidebarClose && window.innerWidth < 900) sidebarClose();
            }}
        >
            {/* HEADER */}
            <div className={styles.info}>
                {sidebarButton}

                <div>
                    <input
                        className={`${styles.titleInput} dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700`}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Назва документа..."
                    />

                    <div className={`${styles.meta} dark:text-gray-400`}>
                        <span>
                            <User size={16} /> {doc.author}
                        </span>
                        <span>
                            <Calendar size={16} /> {safeDatetime(doc.updated_at)}
                        </span>
                    </div>
                </div>

                {/* SAVE BUTTON */}
                <button
                    className={styles.saveButton}
                    disabled={saving}
                    onClick={handleSave}
                >
                    <Save size={18} />
                    {saving ? "Збереження..." : "Зберегти"}
                </button>
            </div>

            {/* BODY EDITOR */}
            <div className={styles.editorContainer}>
                <TextEditor
                    mode="edit"
                    value={editContent}
                    onChange={(html) => setEditContent(html)}
                    onUploadImage={async (file) => {
                        const form = new FormData();
                        form.append("file", file);

                        const res = await api.post(`/v1/Hub/UploadImage`, form);
                        const data = await res.json();
                        return data.file_url;
                    }}
                />
            </div>
        </div>
    );
};

export default KnowledgeContentEdit;









