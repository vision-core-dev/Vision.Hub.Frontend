import React from "react";
import styles from "./User.module.css";

interface AvatarProps {
    url?: string | null;
    name?: string;
    noFallback?: boolean;
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ url, name, noFallback = false, className }) => {
    const initial = name?.charAt(0)?.toUpperCase() || "U";

    if (url) {
        return <img src={url} alt="User" className={`${styles.avatar} ${className}`} />;
    }

    if (!noFallback) {
        return (
            <div className={`${styles.avatarFallback} ${className}`}>
                {initial}
            </div>
        );
    }

    return null;
};

export default Avatar;





