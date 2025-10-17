import React from "react";
import { useAuth } from "../System/AuthContext";
import { LogOut } from "lucide-react";
import styles from "./Layout.module.css";

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className={styles.header}>
            <h1 className={styles.greeting}>
                👋 Привіт, <span>{user?.first_name || "користувач"}</span>
            </h1>
            <button className={styles.logout} onClick={logout}>
                <LogOut size={18} />
                Вийти
            </button>
        </header>
    );
};

export default Header;
