import styles from "./LoaderDots.module.css";
import { cx } from "@/shared/utils/cx";

interface LoaderDotsProps {
    size?: "sm" | "md" | "lg";
}

const LoaderDots = ({ size = "md" }: LoaderDotsProps) => {
    return (
        <div className={cx(styles.loader, styles[size])}>
            <span />
            <span />
            <span />
        </div>
    );
};

export default LoaderDots;









