import React from "react";
import styles from "./User.module.css";

interface AvatarProps {
    url?: string;
    name?: string;
    noFallback?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ url, name, noFallback = false }) => {
    // ✨ беремо першу літеру імені як fallback
    const initial = name?.charAt(0)?.toUpperCase() || "U";

    if (url) {
        return <img src={url} alt="User" className={styles.avatar} />;
    }

    if (!noFallback) {
        return (
            <div className={styles.avatarFallback}>
                {initial}
            </div>
        );
    }

    return null;
};

export default Avatar;
