import React, {type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header/Header.tsx";
import Footer from "./Footer";
import styles from "./Layout.module.css";

interface LayoutProps {
    children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className={styles.app}>
            <Header />
            <div className={styles.wrapper}>
                <Sidebar />
                <main className={styles.main}>{children}</main>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;
