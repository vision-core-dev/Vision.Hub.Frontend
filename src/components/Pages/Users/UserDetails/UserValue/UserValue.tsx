import React from "react";
import styles from "./UserValue.module.css";

interface UserValueProps {
    label: string;
    value?: React.ReactNode;
    align?: "left" | "right";
}

const UserValue: React.FC<UserValueProps> = ({ label, value, align = "left" }) => {
    return (
        <div className={`${styles.item} ${styles[align]}`}>
            <p className={styles.label}>{label}</p>
            <p className={styles.value}>
                {value ? value : "—"}
            </p>
        </div>
    );
};

export default UserValue;
