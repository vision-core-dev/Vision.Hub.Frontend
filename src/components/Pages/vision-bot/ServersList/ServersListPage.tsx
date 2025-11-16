import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultPage from "../../../basic/DefaultPage/DefaultPage.tsx";
import Table from "../../../basic/Table/Table.tsx";
import styles from "./ServersListPage.module.css";

import type { VisionBotServer } from "../../../../types/VisionBot.ts";
import { visionBotApi } from "../../../../api/visionBot.ts";

const ServersListPage: React.FC = () => {
    const [servers, setServers] = useState<VisionBotServer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        visionBotApi
            .getServers()
            .then(setServers)
            .catch((err) => setError(err.message || "Помилка завантаження"))
            .finally(() => setLoading(false));
    }, []);

    const handleOpen = (server: VisionBotServer) => {
        navigate(`/vision-bot/s/${server.guild_id}`);
    };

    const columns = [
        {
            key: "name",
            label: "Сервер",
            render: (_: any, row: VisionBotServer) => (
                <div className={styles.serverCell}>
                    {row.icon_url && (
                        <img
                            src={row.icon_url}
                            alt={row.name}
                            className={styles.serverAvatar}
                        />
                    )}
                    <div>
                        <div className={styles.serverName}>{row.name}</div>
                        <div className={styles.serverId}>ID: {row.guild_id}</div>
                    </div>
                </div>
            ),
        },
        {
            key: "language",
            label: "Мова",
            render: (v) => v || "—",
        },
        {
            key: "logs_channel_id",
            label: "Канал логів",
            render: (v) => v || "—",
        },
        {
            key: "modules_count",
            label: "Модулі",
        },
        {
            key: "store_items_count",
            label: "Store",
        }
    ];

    if (loading) {
        return (
            <DefaultPage
                isLoading={true}
                title="Vision Bot"
                description="Керуйте Discord-ботом прямо з Vision Core Hub."
            />
        );
    }

    return (
        <DefaultPage
            isLoading={loading}
            title="Vision Bot"
            description="Керуйте Discord-ботом прямо з Vision Core Hub."
        >
            {error && <div className={styles.error}>{error}</div>}
            <Table<VisionBotServer>
                columns={columns}
                data={servers}
                onRowClick={(row) => handleOpen(row)}
                emptyText="Бот поки не підключений ні до одного сервера"
                maxWidth="100%"
            />
        </DefaultPage>
    );
};

export default ServersListPage;
