import React, { useEffect, useState } from "react";
import styles from "./KnowledgeContent.module.css";
import { Calendar, User } from "lucide-react";
import { api } from "../../../../utils/api.ts";
import LoaderDots from "../../../basic/LoaderDots/LoaderDots.tsx";
import {safeDatetime} from "../../../../utils/safeDate.ts";

interface DocumentData {
    id: string;
    title: string;
    content: string;
    author: string;
    updated_at: string;
}

interface Props {
    documentId?: string;
}

const KnowledgeContent: React.FC<Props> = ({ documentId }) => {
    const [doc, setDoc] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

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
                } else {
                    console.warn("⚠️ Document not found:", data.detail);
                    setDoc(null);
                }
            } catch (err) {
                console.error("❌ Помилка при завантаженні документа:", err);
                setDoc(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDoc();
    }, [documentId]);

    if (loading)
        return <LoaderDots />;

    if (!doc)
        return <div className={styles.empty}>📄 Виберіть документ у меню</div>;

    return (
        <div className={styles.content}>
            <h1 className={styles.title}>{doc.title}</h1>

            <div className={styles.meta}>
                <span><User size={16} /> {doc.author}</span>
                <span><Calendar size={16} /> {safeDatetime(doc.updated_at)}</span>
            </div>

            <div
                className={styles.body}
                dangerouslySetInnerHTML={{ __html: doc.content }}
            />
        </div>
    );
};

export default KnowledgeContent;
