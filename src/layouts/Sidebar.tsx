import type { FC } from "react";
import React from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { useLocation } from "react-router-dom";

import {
    LayoutDashboard,
    CalendarDays,
    SquareKanban,
    CalendarRange,
    Users,
    Wallet,
    Landmark,
    BarChart3,
    Settings,
    BookMarked,
    Bot,
    Headset,
    ClipboardList, Folder, FolderTree
} from "lucide-react";

import type { NavItemType } from "@/shared/components/app-navigation/config";
import { SidebarNavigation } from "@/shared/components/app-navigation/sidebar-navigation/hub-sidebar";
import { getSidebarText } from "@/shared/types/Messages.ts";
import { Badge } from "@/shared/ui/badges/badges.tsx";
import { File02 } from "@untitledui/icons/File02";
import { MessageTextSquare01 } from "@untitledui/icons";

/* ================= ICON MAP ================= */

const iconMap: Record<string, FC<{ className?: string }>> = {
    dashboard: LayoutDashboard,
    calendar: CalendarDays,
    boards: SquareKanban,
    events: CalendarRange,
    users: Users,
    salary: Wallet,
    finance: Landmark,
    reports: BarChart3,
    settings: Settings,
    knowledge: BookMarked,
    drive: Folder,
    forms: File02,
    chat: MessageTextSquare01,
    "vision-bot": Bot,
    "vision-support": Headset,
    "org-structure": FolderTree,
};

/* ================= SIDEBAR ================= */

const Sidebar: React.FC = () => {
    const { user, role } = useAuth();
    const location = useLocation();

    const navItems: NavItemType[] =
        role?.menu
            ?.filter((key: string) => !key.startsWith("_"))
            .map((key: string) => ({
                label: getSidebarText(key),
                href: `/${key}`,
                icon: iconMap[key] ?? ClipboardList,
                isActive: location.pathname.startsWith(`/${key}`),
            })) ?? [];

    navItems.map((item) => {
        if (item?.href == "/dashboard") {
            if (user && !user.birthday) {
                item.badge = (<Badge size="sm" color="error">1</Badge>)
            }
        }
    })

    return (
        <SidebarNavigation
            className="z-50"
            items={navItems}
        />
    );
};

export default Sidebar;









