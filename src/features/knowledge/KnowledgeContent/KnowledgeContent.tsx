import React, { useEffect, useState, useRef } from "react";
import styles from "./KnowledgeContent.module.css";
import { Calendar } from "lucide-react";
import { api } from "@/shared/utils/api.ts";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots.tsx";
import { safeDatetime } from "@/shared/utils/safeDate.ts";
import type { UserType } from "@/shared/types/Users.ts";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext.tsx";
import { Copy, History, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { AvatarLabelGroup } from "@/shared/components/base/avatar/avatar-label-group";

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
    const [versions, setVersions] = useState<any[]>([]);
    const [showVersions, setShowVersions] = useState(false);

    const { role } = useAuth();
    const isAdmin = role && role.order <= 1;
    const navigate = useNavigate();

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

    const fetchVersions = async () => {
        try {
            const res = await api.get(`/v1/Hub/Knowledge/${documentId}/Versions`);
            const data = await res.json();
            if (res.ok) {
                setVersions(data.versions);
                setShowVersions(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteVersion = async (versionId: string) => {
        if (!confirm("Ви впевнені, що хочете видалити цю версію?")) return;
        try {
            const res = await api.post(`/v1/Hub/Knowledge/Admin/Version/${versionId}/Delete`);
            if (res.ok) {
                setVersions(prev => prev.filter((v: any) => v.id !== versionId));
            }
        } catch (e) {
            console.error(e);
        }
    };


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
        return <div className={styles.content}><div className="text-gray-500 dark:text-gray-500">📄 Виберіть документ у меню</div></div>;

    return (
        <div className={`${styles.content} dark:text-gray-200 dark:bg-gray-900/90`}
            onClick={() => {
                if (sidebarClose && window.innerWidth < 900) sidebarClose();
            }}
        >
            <div className="flex flex-col items-start gap-2">
                {sidebarButton}
                <div>
                    <h1 className="text-xl font-semibold dark:text-gray-100">{doc.title}</h1>

                    <div className={`${styles.meta} dark:text-gray-400 flex items-center gap-4 mt-2`}>
                        <div className="flex items-center gap-2"><AvatarLabelGroup
                            size="sm"
                            src={doc.author?.avatar_url?.toString()}
                            title={`${doc.author?.first_name || ""} ${doc.author?.last_name || ""}`}
                            subtitle={undefined}
                        /></div>
                        <div className="flex items-center gap-2 text-sm"><Calendar size={16} /><span>{safeDatetime(doc.updated_at)}</span></div>

                        {isAdmin && (
                            <div className="flex gap-2 ml-auto">
                                <Button
                                    onClick={fetchVersions}
                                    color="secondary"
                                    iconLeading={History}
                                >
                                    Історія версій
                                </Button>
                                <Button
                                    onClick={() => navigate(`/knowledge/d/${doc.id}/edit`)}
                                    color="primary"
                                    iconLeading={Edit3}
                                >
                                    Редагувати
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div
                ref={contentRef}
                className={`${styles.body} dark:text-gray-300 [&>blockquote]:dark:border-gray-600 [&>blockquote]:dark:text-gray-400`}
                dangerouslySetInnerHTML={{ __html: doc.content }}
            />

            {/* Versions Modal */}
            {showVersions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto w-full h-full p-6">
                    <div className="relative w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b dark:border-gray-800 px-6 py-4">
                            <h3 className="text-lg font-semibold dark:text-white">Історія версій</h3>
                            <CloseButton onClick={() => setShowVersions(false)} />
                        </div>
                        <div className="overflow-y-auto px-6 py-4 space-y-4">
                            {versions.length === 0 ? <p className="text-gray-500">Немає збережених версій.</p> : null}
                            {versions.map((ver: any, index: number) => (
                                <div key={ver.id} className="flex flex-col gap-4 border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-semibold dark:text-gray-200">
                                                Версія від {safeDatetime(ver.created_at)}
                                            </div>
                                            {(ver.author_first_name || ver.author_last_name) && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-gray-500">Автор:</span>
                                                    <AvatarLabelGroup
                                                        size="sm"
                                                        src={ver.author_avatar_url?.toString()}
                                                        title={`${ver.author_first_name || ""} ${ver.author_last_name || ""}`}
                                                        subtitle={undefined}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {index === 0 && (
                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded dark:bg-emerald-900/30 dark:text-emerald-400">Поточна</span>
                                            )}
                                            {isAdmin && index !== 0 && (
                                                <Button
                                                    size="sm"
                                                    color="tertiary-destructive"
                                                    iconLeading={Trash2}
                                                    onClick={() => deleteVersion(ver.id)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 p-3 rounded border dark:border-gray-800 h-32 overflow-y-auto" dangerouslySetInnerHTML={{ __html: ver.content }} />
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(ver.content);
                                            alert("HTML вміст версії скопійовано");
                                        }}
                                        color="link-gray"
                                        iconLeading={Copy}
                                    >
                                        Скопіювати HTML код
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KnowledgeContent;
