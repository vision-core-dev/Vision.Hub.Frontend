import React from "react";
import styles from "./KnowledgeCard.module.css";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import {ExternalLink} from "lucide-react";

interface KnowledgeCardProps {
    type?: "info" | "warning" | "success";
    icon?: keyof typeof Icons; // будь-яка іконка з lucide
    html: string; // основний текст (можна HTML)
    link?: string; // шлях типу /knowledge/finance/rate
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
                                                         type = "info",
                                                         icon = "Info",
                                                         html,
                                                         link,
                                                     }) => {
    const navigate = useNavigate();

    // 🛠️ Приводимо іконку до React-компонента
    const Icon = Icons[icon] as React.ElementType;

    return (
        <div className={`${styles.card} ${styles[type]}`}
             onClick={() => link && navigate(link)}
        >
            <div className={styles.content}>
                {Icon && <Icon className={styles.icon} />}
                <div
                    className={styles.text}
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </div>

            {link && (
                <button
                    className={styles.linkBtn}
                    type="button"
                >
                    <ExternalLink strokeWidth={2.25} />
                </button>
            )}
        </div>
    );
};

export default KnowledgeCard;
