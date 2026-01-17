import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import { Table } from "@/shared/components/table/table";
import styles from "./ServersListPage.module.css";

import type { VisionBotServer } from "@/shared/types/VisionBot.ts";
import { visionBotApi } from "@/api/visionBot.ts";

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
            <div className="overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
                <Table aria-label="Servers List">
                    <Table.Header>
                        <Table.Head isRowHeader>Сервер</Table.Head>
                        <Table.Head>Мова</Table.Head>
                        <Table.Head>Канал логів</Table.Head>
                        <Table.Head>Модулі</Table.Head>
                        <Table.Head>Store</Table.Head>
                    </Table.Header>
                    <Table.Body items={servers} renderEmptyState={() => (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-tertiary">
                            <p>Бот поки не підключений ні до одного сервера</p>
                        </div>
                    )}>
                        {(row) => (
                            <Table.Row id={row.guild_id} onAction={() => handleOpen(row)} className="cursor-pointer">
                                <Table.Cell>
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
                                </Table.Cell>
                                <Table.Cell>{row.language || "—"}</Table.Cell>
                                <Table.Cell>{row.logs_channel_id || "—"}</Table.Cell>
                                <Table.Cell>{row.modules_count}</Table.Cell>
                                <Table.Cell>{row.store_items_count}</Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </div>
        </DefaultPage >
    );
};

export default ServersListPage;









