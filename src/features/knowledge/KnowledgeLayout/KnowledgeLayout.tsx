import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./KnowledgeLayout.module.css";
import KnowledgeSidebar from "../KnowledgeSidebar/KnowledgeSidebar";
import KnowledgeContent from "../KnowledgeContent/KnowledgeContent";
import KnowledgeContentEdit from "../KnowledgeContent/KnowledgeContentEdit.tsx"; // 👈 новий компонент
import { Menu } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button.tsx";

const KnowledgeLayout: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // document ID
    const isEditing = location.pathname.endsWith("/edit");

    const [selectedDoc, setSelectedDoc] = useState<string | undefined>(id);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sidebarOpened, setSidebarOpened] = useState(true);

    // При зміні URL — оновлюємо selectedDoc
    useEffect(() => {
        setSelectedDoc(id);
    }, [id]);

    // При ресайзі
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            setWindowWidth(w);

            // desktop → sidebar завжди відкритий
            if (w >= 900) setSidebarOpened(true);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Коли обираємо документ із сайдбару
    const handleSelectDocument = (docId: string) => {
        setSelectedDoc(docId);
        navigate(`/knowledge/d/${docId}`);
        if (window.innerWidth < 900) setSidebarOpened(false);
    };

    return (
        <div className={`${styles.layout} dark:bg-gray-900`}>
            {/* SIDEBAR */}
            <div className="dark:bg-gray-900 dark:border-gray-800">
                <KnowledgeSidebar
                    onSelectDocument={handleSelectDocument}
                    sidebarOpened={sidebarOpened}
                />
            </div>

            {/* CONTENT */}
            {isEditing ? (
                <KnowledgeContentEdit
                    documentId={selectedDoc}
                    sidebarButton={
                        windowWidth < 900 && !sidebarOpened && (
                            <Button color="secondary" onClick={() => setSidebarOpened(true)} iconLeading={Menu} />
                        )
                    }
                    sidebarClose={() => sidebarOpened && setSidebarOpened(false)}
                />
            ) : (
                <div className="flex-1 dark:bg-gray-900/90 w-full overflow-hidden">
                    <KnowledgeContent
                        documentId={selectedDoc}
                        sidebarButton={
                            windowWidth < 900 && !sidebarOpened && (
                                <Button color="secondary" onClick={() => setSidebarOpened(true)} iconLeading={Menu} />
                            )
                        }
                        sidebarClose={() => sidebarOpened && setSidebarOpened(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default KnowledgeLayout;









