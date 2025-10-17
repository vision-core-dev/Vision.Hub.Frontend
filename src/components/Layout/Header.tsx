import React from "react";
import { useAuth } from "../System/AuthContext";
import styles from "./Layout.module.css";

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className={styles.header}>
            <h1>Привіт, {user?.first_name || "користувач"} 👋</h1>
            <button onClick={logout} className={styles.logoutBtn}>Вийти</button>
        </header>
    );
};

export default Header;
