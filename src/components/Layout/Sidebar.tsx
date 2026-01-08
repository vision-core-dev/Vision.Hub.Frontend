import type { FC } from "react";
import React from "react";
import { useAuth } from "../System/AuthContext";
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
    ClipboardList,
} from "lucide-react";

import type { NavItemType } from "@/ui/application/app-navigation/config";
import { SidebarNavigationSimple } from "@/ui/application/app-navigation/sidebar-navigation/sidebar-simple";
import { getSidebarText } from "@/types/Messages.ts";

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
    "vision-bot": Bot,
    "vision-support": Headset,
};

/* ================= SIDEBAR ================= */

const Sidebar: React.FC = () => {
    const { role } = useAuth();
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

    return (
        <SidebarNavigationSimple
            className="z-50"
            items={navItems}
        />
    );
};

export default Sidebar;
