import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./KnowledgeLayout.module.css";
import KnowledgeSidebar from "../KnowledgeSidebar/KnowledgeSidebar.tsx";
import KnowledgeContent from "../KnowledgeContent/KnowledgeContent.tsx";

const KnowledgeLayout: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // 👈 зчитуємо параметр /knowledge/d/:id
    const [selectedDoc, setSelectedDoc] = useState<string | undefined>(id);

    useEffect(() => {
        if (id) setSelectedDoc(id);
    }, [id]);

    const handleSelectDocument = (docId: string) => {
        setSelectedDoc(docId);
        navigate(`/knowledge/d/${docId}`); // 👈 оновлюємо URL
    };

    return (
        <div className={styles.layout}>
            <KnowledgeSidebar onSelectDocument={handleSelectDocument} />
            <KnowledgeContent documentId={selectedDoc} />
        </div>
    );
};

export default KnowledgeLayout;
