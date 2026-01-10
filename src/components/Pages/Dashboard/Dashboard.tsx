import React from "react";
import { useAuth } from "@/components/System/AuthContext";
import LoaderDots from "@/components/basic/LoaderDots/LoaderDots";

import { FeedItem, type FeedItemType } from "@/ui/application/activity-feed/activity-feed";
import {Badge} from "@/ui/base/badges/badges.tsx";

/* ===================== FEED DATA ===================== */

const feed: FeedItemType[] = [
    {
        id: "update-communication",
        unseen: false,
        date: "10 січня 2026",
        user: {
            avatarUrl: "https://cdn.visioncore.dev/avatars/ca0413d7-6fa1-4bda-99de-d6be805d7ddd_59d3f2e8-8ead-466a-861b-92c43154d3a7.jpg",
            name: "Кирило",
            href: "",
            badge: <Badge size="sm" color="brand">Генеральний директор</Badge>,
        },
        action: {
            content: "Тепер кожне питання має свій шлях: задачі, оплата, блокери, ідеї та стратегія. Визначено",
            target: "порядок звернень",
            href: "https://vcore.b-cdn.net/updates/communications-schema.png",
        },
        labels: [
            { name: "Процеси", color: "blue" },
            { name: "Комунікація", color: "indigo" },
        ],
    },
    {
        id: "update-structure",
        unseen: false,
        date: "07 січня 2026",
        user: {
            avatarUrl: "https://cdn.visioncore.dev/avatars/ca0413d7-6fa1-4bda-99de-d6be805d7ddd_59d3f2e8-8ead-466a-861b-92c43154d3a7.jpg",
            name: "Кирило",
            href: "",
            badge: <Badge size="sm" color="brand">Генеральний директор</Badge>,
        },
        action: {
            content: "Ми впровадили нову організаційну структуру з поділом на студії, ролі та зони відповідальності. Оновлено",
            target: "структуру компанії",
            href: "https://vcore.b-cdn.net/updates/company-structure.png",
        },
        labels: [
            { name: "Організація", color: "purple" },
            { name: "Процеси", color: "blue" },
        ]
    },
    {
        id: "update-projects",
        date: "18 грудня 2025",
        user: {
            avatarUrl: "https://cdn.visioncore.dev/avatars/ca0413d7-6fa1-4bda-99de-d6be805d7ddd_59d3f2e8-8ead-466a-861b-92c43154d3a7.jpg",
            name: "Кирило",
            href: "",
            badge: <Badge size="sm" color="brand">Генеральний директор</Badge>,
        },
        action: {
            content: "Актуалізовано список активних проєктів RoVision та Vision Web. Оновлено",
            target: "структуру проєктів",
            href: "https://vcore.b-cdn.net/updates/projects-structure.png",
        },
        labels: [
            { name: "RoVision", color: "brand" },
            { name: "Vision Web", color: "success" },
        ],
    },
];

/* ===================== FEED COMPONENT ===================== */

const ActivityFeedConnected: React.FC = () => {
    return (
        <ul className="space-y-0">
            {feed.map((item, index) => (
                <li key={item.id}>
                    <FeedItem
                        {...item}
                        connector={index !== feed.length - 1}
                    />
                </li>
            ))}
        </ul>
    );
};

/* ===================== DASHBOARD PAGE ===================== */

const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <LoaderDots />;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <h2 className="text-xl font-semibold">
                Привіт,{" "}
                <span className="text-[#0a9a59] font-extrabold">
                    {user.first_name} {user.last_name || ""}
                </span>
            </h2>

            {/* Updates */}
            <div className="max-w-3xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                        📰 Останні оновлення
                    </h3>
                </div>

                <ActivityFeedConnected />
            </div>
        </div>
    );
};

export default DashboardPage;
