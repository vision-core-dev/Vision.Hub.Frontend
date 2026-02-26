import styles from "./DefaultPage.module.css";
import type { ReactNode } from "react";
import LoaderDots from "../loader-dots/LoaderDots.tsx";
import { cx } from "@/shared/utils/cx";

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
    maxWidth = "100%",
    isLoading = false,
}) => {
    return (
        <div className="flex flex-col p-[28px]">
            {(title || description || action) && (
                <div className={styles.pageHeader}>
                    <div className={styles.pageTitleBlock}>
                        {title && <span className={cx(styles.title, "text-primary")}>{title}</span>}
                        {description && <p className={cx(styles.description, "text-tertiary")}>{description}</p>}
                    </div>
                    {action && <div className={styles.action}>{action}</div>}
                </div>
            )
            }

            <div className={styles.pageContent} style={{ maxWidth }}>
                {isLoading ? <LoaderDots /> : children}
            </div>
        </div>
    );
};

export default DefaultPage;





