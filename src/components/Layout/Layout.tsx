import React, {type ReactNode } from "react";
import styles from "./Layout.module.css";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
    children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className={styles.app}>
            <Sidebar />
            <div className={styles.mainWrapper}>
                <Header />
                <main className={styles.main}>
                    <div className={styles.pageContent}>{children}</div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Layout;