import type { FC } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout: FC = () => {
    return (
        <div className="flex flex-col lg:flex-row h-full dark:bg-gray-900">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;









