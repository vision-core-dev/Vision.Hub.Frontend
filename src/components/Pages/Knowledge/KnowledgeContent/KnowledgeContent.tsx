import React, { useEffect, useState } from "react";
import styles from "./KnowledgeContent.module.css";
import { Calendar } from "lucide-react";
import { api } from "../../../../utils/api.ts";
import LoaderDots from "../../../basic/LoaderDots/LoaderDots.tsx";
import UserLabel from "../../../basic/User/UserLabel.tsx";
import {safeDatetime} from "../../../../utils/safeDate.ts";
import type {UserType} from "../../../../types/Users.ts";

interface DocumentData {
    id: string;
    title: string;
    content: string;
    author: UserType;
    updated_at: string;
}

interface Props {
    documentId?: string;
    sidebarButton?: React.ReactNode;
    sidebarClose?: () => void;
}

const KnowledgeContent: React.FC<Props> = ({ documentId, sidebarButton, sidebarClose }) => {
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
        return <div className={styles.content}><LoaderDots /></div>;

    if (!doc)
        return <div className={styles.content}><div className={styles.empty}>📄 Виберіть документ у меню</div></div>;

    return (
        <div className={styles.content}
            onClick={() => {
                if (sidebarClose && window.innerWidth < 900) sidebarClose();
            }}
        >
            <div className={styles.info}>
                {sidebarButton}
                <div>
                    <h1 className={styles.title}>{doc.title}</h1>

                    <div className={styles.meta}>
                        <div><UserLabel avatar_url={doc.author.avatar_url} name={`${doc.author.first_name} ${doc.author.last_name || ""}`} user_id={doc.author.id} /></div>
                        <div><Calendar size={20} /><span>{safeDatetime(doc.updated_at)}</span></div>
                    </div>
                </div>
            </div>

            <div
                className={styles.body}
                dangerouslySetInnerHTML={{ __html: doc.content }}
            />
        </div>
    );
};

export default KnowledgeContent;
