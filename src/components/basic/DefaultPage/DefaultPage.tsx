import styles from "./DefaultPage.module.css";
import type { ReactNode } from "react";
import LoaderDots from "../LoaderDots/LoaderDots.tsx";

interface DefaultPageProps {
    title?: string;
    description?: string;
    action?: ReactNode;
    children?: ReactNode;
    maxWidth?: string;
    isLoading?: boolean;
}

const DefaultPage: React.FC<DefaultPageProps> = ({
    title,
    description,
    action,
    children,
    maxWidth = "1200px",
    isLoading = false,
}) => {
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.pageHeader}>
                <div className={styles.pageTitleBlock}>
                    {title && <h1 className={styles.title}>{title}</h1>}
                    {description && <p className={styles.description}>{description}</p>}
                </div>
                {action && <div className={styles.action}>{action}</div>}
            </div>

            <div className={styles.pageContent} style={{ maxWidth }}>
                {isLoading ? <LoaderDots /> : children}
            </div>
        </div>
    );
};

export default DefaultPage;
