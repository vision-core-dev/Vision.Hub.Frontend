import React, { useEffect, useState } from "react";
import styles from "./KnowledgeSidebar.module.css";
import {Folder, ChevronRight, ChevronDown, File, FolderOpen} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {api} from "@/shared/utils/api.ts";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots.tsx";

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
    const { id: activeDocId } = useParams(); // 👈 ID документа з URL
    const navigate = useNavigate();
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [openFolders, setOpenFolders] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
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

        fetchTree();
    }, []);

    useEffect(() => {
        // 👇 Автоматично відкриваємо шлях до активного документа
        const findFolderPath = (
            folders: FolderType[],
            docId: string,
            path: string[] = []
        ): string[] | null => {
            for (const folder of folders) {
                // Якщо документ в цьому фолдері
                if (folder.documents?.some((d) => d.id === docId)) {
                    return [...path, folder.id];
                }
                // Якщо є вкладені
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
            if (path) setOpenFolders(path);
        }
    }, [activeDocId, folders]);

    const toggleFolder = (id: string) => {
        setOpenFolders((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
    };

    const handleSelectDoc = (docId: string) => {
        onSelectDocument(docId);
        navigate(`/knowledge/d/${docId}`); // 👈 синхронізує URL
    };

    const renderFolder = (folder: FolderType) => {
        const isOpen = openFolders.includes(folder.id);
        return (
            <div key={folder.id} className={styles.folder}>
                <div
                    className={styles.folderHeader}
                    onClick={() => toggleFolder(folder.id)}
                >
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {isOpen ? <FolderOpen size={18} /> :  <Folder size={18} /> }
                    <span>{folder.name}</span>
                </div>

                {isOpen && (
                    <div className={styles.folderContent}>
                        {folder.documents?.map((doc) => (
                            <div
                                key={doc.id}
                                className={`${styles.document} ${
                                    activeDocId === doc.id ? styles.active : ""
                                }`}
                                onClick={() => handleSelectDoc(doc.id)}
                            >
                                <File size={16} />
                                <span>{doc.title}</span>
                            </div>
                        ))}
                        {folder.subfolders?.map(renderFolder)}
                    </div>
                )}
            </div>
        );
    };

    if (loading) return (
        <div className={`${styles.sidebar} ${!sidebarOpened && styles.collapsed}`}>
            <LoaderDots />
        </div>
    );

    return <div className={`${styles.sidebar} ${!sidebarOpened && styles.collapsed}`}>{folders.map(renderFolder)}</div>;
};

export default KnowledgeSidebar;









