import React from "react";
import styles from "./Layout.module.css";

const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            © 2025 <strong>Vision Core Hub</strong> — внутрішня система управління
        </footer>
    );
};

export default Footer;
