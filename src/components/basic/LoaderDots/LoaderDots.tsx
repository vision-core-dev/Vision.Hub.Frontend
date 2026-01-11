import styles from "./LoaderDots.module.css";
import clsx from "clsx";

interface LoaderDotsProps {
    size?: "sm" | "md" | "lg";
}

const LoaderDots = ({ size = "md" }: LoaderDotsProps) => {
    return (
        <div className={clsx(styles.loader, styles[size])}>
            <span />
            <span />
            <span />
        </div>
    );
};

export default LoaderDots;
