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
            <Sidebar />
            <div className={styles.wrapper}>
                <Header />
                <main className={styles.main}>{children}</main>
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
