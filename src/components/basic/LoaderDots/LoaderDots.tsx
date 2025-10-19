import styles from "./LoaderDots.module.css";

const LoaderDots = () => {
    return (
        <div className={styles.loader}>
            <span></span>
            <span></span>
            <span></span>
        </div>
    );
};

export default LoaderDots;
