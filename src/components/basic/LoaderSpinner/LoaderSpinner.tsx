import React from "react";
import styles from "./LoaderSpinner.module.css";

interface LoaderSpinnerProps {
    size?: number;
    color?: string;
}

const LoaderSpinner: React.FC<LoaderSpinnerProps> = ({
                                                         size = 20,
                                                         color = "#fff",
                                                     }) => {
    return (
        <div
            className={styles.spinner}
            style={{
                width: size,
                height: size,
                borderTopColor: color,
            }}
        />
    );
};

export default LoaderSpinner;
