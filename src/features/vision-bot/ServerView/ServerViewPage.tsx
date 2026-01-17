// src/Pages/vision-bot/ServerView/ServerViewPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ServerViewPage.module.css";
import type {
    GuildSettings,
    ModuleLog,
    UniversalStoreItem,
    VisionBotModule,
    VisionBotServer
} from "@/shared/types/VisionBot";
import { visionBotApi } from "@/api/visionBot";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { Table } from "@/shared/components/table/table";
import { Undo2 } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { Select } from "@/shared/ui/select/select";
import type { Key } from "react-aria-components";

type TabId = "overview" | "settings" | "modules" | "logs" | "store";

const ServerViewPage: React.FC = () => {
    const { guildId } = useParams<{ guildId: string }>();
    const navigate = useNavigate();

    const [server, setServer] = useState<VisionBotServer | null>(null);
    const [settings, setSettings] = useState<GuildSettings | null>(null);
    const [modules, setModules] = useState<VisionBotModule[]>([]);
    const [logs, setLogs] = useState<ModuleLog[]>([]);
    const [storeItems, setStoreItems] = useState<UniversalStoreItem[]>([]);
    const [tab, setTab] = useState<TabId>("overview");
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        if (!guildId) return;

        setLoading(true);
        Promise.all([
            visionBotApi.getServer(guildId),
            visionBotApi.getGuildSettings(guildId),
            visionBotApi.getModules(guildId),
            visionBotApi.getLogs(guildId),
            visionBotApi.getStoreItems(guildId),
        ])
            .then(([srv, setts, mods, lg, store]) => {
                setServer(srv);
                setSettings(setts);
                setModules(mods);
                setLogs(lg);
                setStoreItems(store);
            })
            .finally(() => setLoading(false));
    }, [guildId]);

    const handleSaveSettings = async () => {
        if (!guildId || !settings) return;
        setSavingSettings(true);
        try {
            const updated = await visionBotApi.updateGuildSettings(guildId, settings);
            setSettings(updated);
        } finally {
            setSavingSettings(false);
        }
    };

    const returnElement = () => {
        return (
            <Button color="secondary" iconLeading={Undo2}
                onClick={() => navigate("/finance")}
            >
                Повернутись
            </Button>)
            ;
    }

    if (!guildId) {
        return <DefaultPage>Не передано ID сервера.</DefaultPage>;
    }

    if (loading) {
        return <DefaultPage isLoading={loading} />;
    }

    return (
        <DefaultPage title={`Server ID: ${guildId}`}
            action={returnElement()}
        >
            {/* Tabs */}
            <div className={styles.tabs}>
                <Button
                    color={tab === "overview" ? "primary" : "secondary"}
                    onClick={() => setTab("overview")}
                >
                    Огляд
                </Button>
                <Button
                    color={tab === "settings" ? "primary" : "secondary"}
                    onClick={() => setTab("settings")}
                >
                    Налаштування
                </Button>
                <Button
                    color={tab === "modules" ? "primary" : "secondary"}
                    onClick={() => setTab("modules")}
                >
                    Модулі
                </Button>
                <Button
                    color={tab === "logs" ? "primary" : "secondary"}
                    onClick={() => setTab("logs")}
                >
                    Логи
                </Button>
                <Button
                    color={tab === "store" ? "primary" : "secondary"}
                    onClick={() => setTab("store")}
                >
                    Store
                </Button>
            </div>

            {loading && <div className={styles.state}>Завантаження...</div>}

            {!loading && server && (
                <>
                    {tab === "overview" && (
                        <OverviewTab server={server} modules={modules} logs={logs} />
                    )}

                    {tab === "settings" && settings && (
                        <SettingsTab
                            settings={settings}
                            setSettings={setSettings}
                            onSave={handleSaveSettings}
                            saving={savingSettings}
                        />
                    )}

                    {tab === "modules" && (
                        <ModulesTab guildId={guildId} modules={modules} />
                    )}

                    {tab === "logs" && <LogsTab logs={logs} modules={modules} />}

                    {tab === "store" && <StoreTab items={storeItems} />}
                </>
            )}
        </DefaultPage>
    );
};

export default ServerViewPage;

// ───── Tabs components ─────

type OverviewProps = {
    server: VisionBotServer;
    modules: VisionBotModule[];
    logs: ModuleLog[];
};

const OverviewTab: React.FC<OverviewProps> = ({ server, modules, logs }) => {
    const lastLogs = logs.slice(0, 5);

    return (
        <div className={styles.cardGrid}>
            <div className={styles.card}>
                <h2 className={styles.cardTitle}>Загальна інформація</h2>
                <div className={styles.infoList}>
                    <div>
                        <span className={styles.infoLabel}>Мова інтерфейсу</span>
                        <span className={styles.infoValue}>{server.language || "—"}</span>
                    </div>
                    <div>
                        <span className={styles.infoLabel}>Канал логів</span>
                        <span className={styles.infoValue}>
                            {server.logs_channel_id || "Не налаштовано"}
                        </span>
                    </div>
                    <div>
                        <span className={styles.infoLabel}>Активних модулів</span>
                        <span className={styles.infoValue}>{modules.length}</span>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <h2 className={styles.cardTitle}>Останні логи</h2>
                {lastLogs.length === 0 && (
                    <div className={styles.empty}>Поки що немає логів.</div>
                )}
                <ul className={styles.logsList}>
                    {lastLogs.map((l) => (
                        <li key={l.id} className={styles.logRow}>
                            <span className={`${styles.logLevel} ${styles[`log_${l.level}`]}`}>
                                {l.level.toUpperCase()}
                            </span>
                            <span className={styles.logMessage}>{l.message}</span>
                            <span className={styles.logTime}>
                                {new Date(l.timestamp).toLocaleString()}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

type SettingsTabProps = {
    settings: GuildSettings;
    setSettings: (val: GuildSettings) => void;
    onSave: () => void;
    saving: boolean;
};

const SettingsTab: React.FC<SettingsTabProps> = ({
    settings,
    setSettings,
    onSave,
    saving,
}) => {
    const [language, setLanguage] = useState<Key | null>(settings.language || "uk");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const prepared = {
            ...settings,
            language: language as string,
        };
        setSettings(prepared);
        await onSave();
    };

    return (
        <div className={styles.card}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Налаштування сервера</h2>

                <Select
                    value={language}
                    onChange={setLanguage}
                    placeholder="Мова"
                >
                    <Select.Item id="uk" label="Українська">uk</Select.Item>
                    <Select.Item id="en" label="English">en</Select.Item>
                </Select>

                <Button type="submit" isLoading={saving} showTextWhileLoading>
                    Зберегти
                </Button>
            </form>
        </div>
    );
};


type ModulesTabProps = {
    guildId: string;
    modules: VisionBotModule[];
};

const ModulesTab: React.FC<ModulesTabProps> = ({ modules }) => {
    const { guildId } = useParams<{ guildId: string }>();
    const navigate = useNavigate();

    return (
        <div className="overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
            <Table aria-label="Модулі">
                <Table.Header>
                    <Table.Head isRowHeader>ID</Table.Head>
                    <Table.Head>Назва</Table.Head>
                    <Table.Head>Статус</Table.Head>
                    <Table.Head>Тип</Table.Head>
                    <Table.Head></Table.Head>
                </Table.Header>
                <Table.Body items={modules} renderEmptyState={() => (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-tertiary">
                        <p>Модулів поки немає.</p>
                    </div>
                )}>
                    {(row: VisionBotModule) => (
                        <Table.Row id={row.id}>
                            <Table.Cell>{row.id}</Table.Cell>
                            <Table.Cell>{row.name}</Table.Cell>
                            <Table.Cell>
                                <span
                                    className={`${styles.statusBadge} ${row.status ? styles.statusActive : styles.statusInactive}`}
                                >
                                    {row.status ? "Активний" : "Вимкнений"}
                                </span>
                            </Table.Cell>
                            <Table.Cell>
                                {row.code.trim().includes("event(") ? "Event" : "Local cmd"}
                            </Table.Cell>
                            <Table.Cell>
                                <Button onClick={() =>
                                    navigate(`/vision-bot/s/${guildId}/m/${row.id}`)
                                }>
                                    Редагувати
                                </Button>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </div>
    );
};


type LogsTabProps = {
    logs: ModuleLog[];
    modules: VisionBotModule[];
};

// LogsTab.tsx
const LogsTab: React.FC<LogsTabProps> = ({ logs, modules }) => {
    const moduleById = new Map(modules.map((m) => [m.id, m.name]));

    return (
        <div className="overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
            <Table aria-label="Логи">
                <Table.Header>
                    <Table.Head isRowHeader>Час</Table.Head>
                    <Table.Head>Модуль</Table.Head>
                    <Table.Head>Рівень</Table.Head>
                    <Table.Head>Повідомлення</Table.Head>
                </Table.Header>
                <Table.Body items={logs} renderEmptyState={() => (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-tertiary">
                        <p>Логів поки немає.</p>
                    </div>
                )}>
                    {(row: ModuleLog) => (
                        <Table.Row id={row.id}>
                            <Table.Cell>{new Date(row.timestamp).toLocaleString()}</Table.Cell>
                            <Table.Cell>{moduleById.get(row.module_id) ?? row.module_id}</Table.Cell>
                            <Table.Cell>
                                <span className={`${styles.logLevel} ${styles[`log_${row.level}`]}`}>
                                    {row.level.toUpperCase()}
                                </span>
                            </Table.Cell>
                            <Table.Cell>{row.message}</Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </div>
    );
};


type StoreTabProps = {
    items: UniversalStoreItem[];
};

const StoreTab: React.FC<StoreTabProps> = ({ items }) => {
    return (
        <div className="overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
            <Table aria-label="Store">
                <Table.Header>
                    <Table.Head isRowHeader>ID</Table.Head>
                    <Table.Head>Scope</Table.Head>
                    <Table.Head>Key</Table.Head>
                    <Table.Head>Тип даних</Table.Head>
                    <Table.Head>Значення</Table.Head>
                </Table.Header>
                <Table.Body items={items} renderEmptyState={() => (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-tertiary">
                        <p>Записів поки немає.</p>
                    </div>
                )}>
                    {(row: UniversalStoreItem) => (
                        <Table.Row id={row.id}>
                            <Table.Cell>{row.id}</Table.Cell>
                            <Table.Cell>{row.scope}</Table.Cell>
                            <Table.Cell>{row.key}</Table.Cell>
                            <Table.Cell>{row.data_type}</Table.Cell>
                            <Table.Cell>
                                <code>
                                    {JSON.stringify(row.value)?.length > 80
                                        ? JSON.stringify(row.value).slice(0, 80) + "…"
                                        : JSON.stringify(row.value)}
                                </code>
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </div>
    );
};










