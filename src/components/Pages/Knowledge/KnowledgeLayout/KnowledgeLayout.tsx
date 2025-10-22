import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./KnowledgeLayout.module.css";
import KnowledgeSidebar from "../KnowledgeSidebar/KnowledgeSidebar.tsx";
import KnowledgeContent from "../KnowledgeContent/KnowledgeContent.tsx";
import { Menu } from "lucide-react";
import Button from "../../../basic/Button/Button.tsx";

const KnowledgeLayout: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [selectedDoc, setSelectedDoc] = useState<string | undefined>(id);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sidebarOpened, setSidebarOpened] = useState(true);

    useEffect(() => {
        if (id) setSelectedDoc(id);
    }, [id]);

    // 🔁 При ресайзі повертаємо sidebar якщо знову desktop
    useEffect(() => {
        if (windowWidth < 900 && !selectedDoc) setSidebarOpened(true);
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth >= 900) setSidebarOpened(true);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleSelectDocument = (docId: string) => {
        setSelectedDoc(docId);
        navigate(`/knowledge/d/${docId}`);
        if (window.innerWidth < 900) setSidebarOpened(false);
    };

    return (
        <div className={styles.layout}>
            <KnowledgeSidebar onSelectDocument={handleSelectDocument} sidebarOpened={sidebarOpened} />

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
        </div>
    );
};

export default KnowledgeLayout;
