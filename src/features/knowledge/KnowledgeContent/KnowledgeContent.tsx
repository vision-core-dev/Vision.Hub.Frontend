import React, { useEffect, useState, useRef } from "react";
import styles from "./KnowledgeContent.module.css";
import { Calendar } from "lucide-react";
import { api } from "@/shared/utils/api.ts";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots.tsx";
import UserLabel from "@/shared/ui/user/UserLabel.tsx";
import { safeDatetime } from "@/shared/utils/safeDate.ts";
import type { UserType } from "@/shared/types/Users.ts";
import { useSearchParams } from "react-router-dom";

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

    const [searchParams] = useSearchParams();
    const highlightParam = searchParams.get("highlight");
    const contentRef = useRef<HTMLDivElement>(null);

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


    // Highlight logic - DOM Manipulation
    useEffect(() => {
        if (!doc || !highlightParam || !contentRef.current) return;

        const rawTerm = highlightParam.trim();
        if (!rawTerm) return;

        // Use a timeout to ensure DOM is fully rendered
        const timeoutId = setTimeout(() => {
            if (!contentRef.current) return;

            let term = rawTerm;
            try {
                term = decodeURIComponent(rawTerm);
            } catch (e) { /* ignore */ }

            const highlightInNode = (node: ChildNode) => {
                if (node.nodeType === 3) { // Text node
                    const text = node.nodeValue || "";
                    if (!text.trim()) return;

                    // Escape regex special chars
                    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`(${escapedTerm})`, "gi");

                    if (regex.test(text)) {
                        const fragment = document.createDocumentFragment();
                        let lastIdx = 0;
                        let match;
                        while ((match = regex.exec(text)) !== null) {
                            const start = match.index;
                            const end = regex.lastIndex;

                            if (start > lastIdx) {
                                fragment.appendChild(document.createTextNode(text.slice(lastIdx, start)));
                            }

                            const mark = document.createElement("mark");
                            mark.textContent = match[0];
                            mark.style.backgroundColor = "yellow";
                            mark.style.color = "black";
                            mark.className = "highlight-mark";
                            fragment.appendChild(mark);

                            lastIdx = end;
                        }

                        if (lastIdx < text.length) {
                            fragment.appendChild(document.createTextNode(text.slice(lastIdx)));
                        }

                        node.parentNode?.replaceChild(fragment, node);
                    }
                } else if (node.nodeType === 1) { // Element
                    const el = node as HTMLElement;
                    if (el.nodeName !== "SCRIPT" && el.nodeName !== "STYLE" && el.nodeName !== "MARK") {
                        Array.from(el.childNodes).forEach(highlightInNode);
                    }
                }
            };

            // Run highlight
            Array.from(contentRef.current.childNodes).forEach(highlightInNode);

            // Scroll to first mark
            const firstMark = contentRef.current.querySelector("mark");
            if (firstMark) {
                firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 300);

        return () => clearTimeout(timeoutId);

    }, [doc, highlightParam]);

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
                        <div><UserLabel avatar_url={doc.author.avatar_url} name={`${doc.author.first_name} ${doc.author.last_name || ""}`} user_id={doc.author.id} badge_emoji={doc.author.active_badge_emoji} /></div>
                        <div><Calendar size={20} /><span>{safeDatetime(doc.updated_at)}</span></div>
                    </div>
                </div>
            </div>

            <div
                ref={contentRef}
                className={styles.body}
                dangerouslySetInnerHTML={{ __html: doc.content }}
            />
        </div>
    );
};

export default KnowledgeContent;
