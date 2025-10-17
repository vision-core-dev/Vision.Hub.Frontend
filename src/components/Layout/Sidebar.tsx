import React from "react";
import { useAuth } from "../System/AuthContext";
import styles from "./Layout.module.css";

const Sidebar: React.FC = () => {
    const { role } = useAuth();

    return (
        <aside className={styles.sidebar}>
            <h2 className={styles.logo}>VISION HUB</h2>
            <nav className={styles.nav}>
                {role?.menu?.map((item: string) => (
                    <a key={item} href={`/${item}`} className={styles.navItem}>
                        {item}
                    </a>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
