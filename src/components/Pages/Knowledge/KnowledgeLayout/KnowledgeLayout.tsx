import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./KnowledgeLayout.module.css";
import KnowledgeSidebar from "../KnowledgeSidebar/KnowledgeSidebar";
import KnowledgeContent from "../KnowledgeContent/KnowledgeContent";
import KnowledgeContentEdit from "../KnowledgeContent/KnowledgeContentEdit.tsx"; // 👈 новий компонент
import { Menu } from "lucide-react";
import Button from "../../../basic/Button/Button.tsx";

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
        <div className={styles.layout}>
            {/* SIDEBAR */}
            <KnowledgeSidebar
                onSelectDocument={handleSelectDocument}
                sidebarOpened={sidebarOpened}
            />

            {/* CONTENT */}
            {isEditing ? (
                <KnowledgeContentEdit
                    documentId={selectedDoc}
                    sidebarButton={
                        windowWidth < 900 && !sidebarOpened && (
                            <Button variant="secondary" onClick={() => setSidebarOpened(true)}>
                                <Menu size={22} />
                            </Button>
                        )
                    }
                    sidebarClose={() => sidebarOpened && setSidebarOpened(false)}
                />
            ) : (
                <KnowledgeContent
                    documentId={selectedDoc}
                    sidebarButton={
                        windowWidth < 900 && !sidebarOpened && (
                            <Button variant="secondary" onClick={() => setSidebarOpened(true)}>
                                <Menu size={22} />
                            </Button>
                        )
                    }
                    sidebarClose={() => sidebarOpened && setSidebarOpened(false)}
                />
            )}
        </div>
    );
};

export default KnowledgeLayout;
