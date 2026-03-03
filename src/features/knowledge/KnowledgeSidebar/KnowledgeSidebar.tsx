import React, { useEffect, useState } from "react";
import { Folder, ChevronRight, ChevronDown, File, FolderOpen, Trash2, Edit3, PlusCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api.ts";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots.tsx";
import { useAuth } from "@/core/auth/AuthContext.tsx";

interface FolderType {
    id: string;
    name: string;
    subfolders?: FolderType[];
    documents?: { id: string; title: string }[];
}

interface Props {
    onSelectDocument: (id: string) => void;
    sidebarOpened: boolean;
}

const KnowledgeSidebar: React.FC<Props> = ({ onSelectDocument, sidebarOpened }) => {
    const { id: activeDocId } = useParams();
    const navigate = useNavigate();
    const { role } = useAuth();

    // Roles 0, 1 = admin
    const isAdmin = role && role.order <= 1;

    const [folders, setFolders] = useState<FolderType[]>([]);
    const [openFolders, setOpenFolders] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchTree = async () => {
        try {
            setLoading(true);
            const res = await api.get("/v1/Hub/Knowledge/GetTree");
            const data = await res.json();
            if (res.ok) {
                setFolders(data.folders || []);
            }
        } catch (err) {
            console.error("❌ Помилка при завантаженні дерева знань:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    useEffect(() => {
        const findFolderPath = (
            folders: FolderType[],
            docId: string,
            path: string[] = []
        ): string[] | null => {
            for (const folder of folders) {
                if (folder.documents?.some((d) => d.id === docId)) {
                    return [...path, folder.id];
                }
                if (folder.subfolders) {
                    const found = findFolderPath(folder.subfolders, docId, [
                        ...path,
                        folder.id,
                    ]);
                    if (found) return found;
                }
            }
            return null;
        };

        if (activeDocId && folders.length > 0) {
            const path = findFolderPath(folders, activeDocId);
            if (path) {
                setOpenFolders((prev) => Array.from(new Set([...prev, ...path])));
            }
        }
    }, [activeDocId, folders]);

    const toggleFolder = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setOpenFolders((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
    };

    const handleSelectDoc = (docId: string) => {
        onSelectDocument(docId);
    };

    // --- Admin Actions ---

    const handleCreateFolder = async (parentId: string | null = null, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const name = prompt("Назва нової папки:");
        if (!name) return;

        try {
            const res = await api.post("/v1/Hub/Knowledge/Admin/Folder/Create", { name, parent_id: parentId });
            if (res.ok) {
                if (parentId) {
                    setOpenFolders(prev => Array.from(new Set([...prev, parentId])));
                }
                fetchTree();
            }
            else {
                alert("Помилка створення папки");
            }
        } catch (err) {
            alert("Помилка створення папки");
        }
    };

    const handleEditFolder = async (folderId: string, currentName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const name = prompt("Нова назва папки:", currentName);
        if (!name || name === currentName) return;

        try {
            const res = await api.post(`/v1/Hub/Knowledge/Admin/Folder/${folderId}/Update`, { name });
            if (res.ok) fetchTree();
        } catch (err) {
            alert("Помилка редагування папки");
        }
    };

    const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!import.meta.env.DEV && !confirm("Ви впевнені, що хочете видалити цю папку з усім вмістом?")) return;

        try {
            const res = await api.post(`/v1/Hub/Knowledge/Admin/Folder/${folderId}/Delete`);
            if (res.ok) fetchTree();
        } catch (err) {
            alert("Помилка видалення папки");
        }
    };

    const handleCreateDocument = async (folderId: string | null = null, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const title = prompt("Назва нового документа:");
        if (!title) return;

        try {
            const res = await api.post("/v1/Hub/Knowledge/CreateDocument", { title, content: "Текст документа...", folder_id: folderId });
            const data = await res.json();
            if (res.ok) {
                if (folderId) setOpenFolders(prev => Array.from(new Set([...prev, folderId])));
                fetchTree();
                navigate(`/knowledge/d/${data.document_id}/edit`);
            }
            else {
                alert("Помилка створення документа");
            }
        } catch (err) {
            alert("Помилка створення документа");
        }
    };

    const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Ви впевнені, що хочете видалити цей документ?")) return;

        try {
            const res = await api.post(`/v1/Hub/Knowledge/Admin/Document/${docId}/Delete`);
            if (res.ok) {
                if (activeDocId === docId) navigate("/knowledge");
                fetchTree();
            }
        } catch (err) {
            alert("Помилка видалення документа");
        }
    };

    // -------------------------------------------------------------------------------- //
    // -- UI Render Helpers
    // -------------------------------------------------------------------------------- //

    const renderFolder = (folder: FolderType, depth: number = 0) => {
        const isOpen = openFolders.includes(folder.id);

        // dynamic padding based on depth
        const padLeft = `${depth * 1.5 + 0.5}rem`;

        return (
            <div key={folder.id} className="flex flex-col w-full">
                <div
                    className="group relative flex w-full cursor-pointer items-center rounded-md transition duration-100 ease-linear select-none py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                    style={{ paddingLeft: padLeft, paddingRight: '0.5rem' }}
                    onClick={(e) => toggleFolder(folder.id, e)}
                >
                    <div className="mr-2 text-gray-500 dark:text-gray-400">
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>

                    <div className="mr-2 text-gray-500 dark:text-gray-400">
                        {isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
                    </div>

                    <span className="flex-1 text-[15px] font-medium text-gray-700 dark:text-gray-200 truncate group-hover:text-gray-900 dark:group-hover:text-white">
                        {folder.name}
                    </span>

                    {/* Admin Actions */}
                    {isAdmin && (
                        <div className="hidden group-hover:flex items-center gap-1 opacity-60 hover:opacity-100">
                            <span title="Додати документ" className="hover:text-emerald-500 text-gray-500 cursor-pointer" onClick={(e) => handleCreateDocument(folder.id, e)}><PlusCircle size={14} /></span>
                            <span title="Додати папку" className="hover:text-amber-500 text-gray-500 cursor-pointer" onClick={(e) => handleCreateFolder(folder.id, e)}><FolderOpen size={14} /></span>
                            <span title="Редагувати папку" className="hover:text-blue-500 text-gray-500 cursor-pointer" onClick={(e) => handleEditFolder(folder.id, folder.name, e)}><Edit3 size={14} /></span>
                            <span title="Видалити папку" className="hover:text-red-500 text-gray-500 cursor-pointer" onClick={(e) => handleDeleteFolder(folder.id, e)}><Trash2 size={14} /></span>
                        </div>
                    )}
                </div>

                {isOpen && (
                    <div className="flex flex-col">
                        {/* Documents */}
                        {folder.documents?.map((doc) => (
                            <div
                                key={doc.id}
                                className={`group relative flex w-full cursor-pointer items-center rounded-md transition duration-100 ease-linear select-none py-1.5 ${activeDocId === doc.id
                                    ? "bg-gray-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                                    }`}
                                style={{ paddingLeft: `${(depth + 1) * 1.5 + 0.5}rem`, paddingRight: '0.5rem' }}
                                onClick={() => handleSelectDoc(doc.id)}
                            >
                                <div className={`mr-2 ${activeDocId === doc.id ? "text-emerald-500" : "text-gray-400 dark:text-gray-500"}`}>
                                    <File size={16} />
                                </div>
                                <span className={`flex-1 text-[14px] font-medium truncate ${activeDocId === doc.id ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}`}>
                                    {doc.title}
                                </span>

                                {/* Admin doc actions inside folder */}
                                {isAdmin && (
                                    <div className="hidden group-hover:flex items-center gap-1 opacity-60 hover:opacity-100" onClick={e => e.stopPropagation()}>
                                        <span title="Редагувати документ" className="hover:text-blue-500 text-gray-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/knowledge/d/${doc.id}/edit`); }}><Edit3 size={14} /></span>
                                        <span title="Видалити документ" className="hover:text-red-500 text-gray-500 cursor-pointer" onClick={(e) => handleDeleteDocument(doc.id, e)}><Trash2 size={14} /></span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Subfolders */}
                        {folder.subfolders?.map(f => renderFolder(f, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (loading) return (
        <div className={`w-[280px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto px-2 py-4 transition-all duration-300 ${!sidebarOpened ? "w-0 min-w-0 p-0 m-0 opacity-0 overflow-hidden" : ""}`}>
            <LoaderDots />
        </div>
    );

    return (
        <div className={`w-[280px] flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto px-2 py-4 transition-all duration-300 ${!sidebarOpened ? "w-0 min-w-0 p-0 m-0 opacity-0 overflow-hidden hidden" : ""} h-full`}>

            {isAdmin && (
                <div className="mb-4 px-2 space-y-2">
                    <button
                        onClick={(e) => handleCreateFolder(null, e)}
                        className="w-full flex items-center justify-center gap-2 rounded-md bg-gray-100 dark:bg-gray-800 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        <Folder size={16} /> Створити папку
                    </button>
                    <button
                        onClick={(e) => handleCreateDocument(null, e)}
                        className="w-full flex items-center justify-center gap-2 rounded-md bg-emerald-50 dark:bg-emerald-900/30 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                    >
                        <File size={16} /> Створити документ
                    </button>
                </div>
            )}

            <div className="flex flex-col">
                {folders.map(f => renderFolder(f, 0))}
            </div>
        </div>
    );
};

export default KnowledgeSidebar;
