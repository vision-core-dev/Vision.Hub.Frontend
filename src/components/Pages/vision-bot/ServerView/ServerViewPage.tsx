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
} from "@/types/VisionBot.ts";
import {visionBotApi} from "@/api/visionBot.ts";
import DefaultPage from "../../../basic/DefaultPage/DefaultPage.tsx";
import Table from "../../../basic/Table/Table.tsx";
import SmartForm, {type Field} from "../../../basic/SmartForm/SmartForm.tsx";
import {Undo2} from "lucide-react";
import { Button } from "@/ui/base/buttons/button.tsx";

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

    const fields = [
        {
            name: "language",
            label: "Мова",
            type: "select",
            required: true,
            options: ["uk", "en"],
        }
    ] satisfies Field[];

    const handleSubmit = async (values: Record<string, any>) => {
        // Конвертуємо строку ролей назад у масив
        const prepared = {
            ...settings,
            ...values,
            on_member_added_roles: values.on_member_added_roles
                ? values.on_member_added_roles
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                : [],
        };

        setSettings(prepared);
        await onSave();
    };

    return (
        <div className={styles.card}>
            <SmartForm
                title="Налаштування сервера"
                fields={fields}
                submitText={saving ? "Збереження..." : "Зберегти"}
                onSubmit={handleSubmit}
            />
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

    const columns = [
        {
            key: "id",
            label: "ID",
        },
        {
            key: "name",
            label: "Назва",
        },
        {
            key: "status",
            label: "Статус",
            render: (value: boolean) => (
                <span
                    className={`${styles.statusBadge} ${
                        value ? styles.statusActive : styles.statusInactive
                    }`}
                >
                    {value ? "Активний" : "Вимкнений"}
                </span>
            ),
        },
        {
            key: "type",
            label: "Тип",
            render: (_: any, row: VisionBotModule) =>
                row.code.trim().includes("event(") ? "Event" : "Local cmd",
        },
        {
            key: "actions",
            label: "",
            render: (_: any, row: VisionBotModule) => (
                <Button onClick={() =>
                    navigate(`/vision-bot/s/${guildId}/m/${row.id}`)
                }>
                    Редагувати
                </Button>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            data={modules}
            emptyText="Модулів поки немає."
            maxWidth="100%"
        />
    );
};


type LogsTabProps = {
    logs: ModuleLog[];
    modules: VisionBotModule[];
};

// LogsTab.tsx
const LogsTab: React.FC<LogsTabProps> = ({ logs, modules }) => {
    const moduleById = new Map(modules.map((m) => [m.id, m.name]));

    const columns = [
        {
            key: "timestamp",
            label: "Час",
            render: (value: string) => new Date(value).toLocaleString(),
        },
        {
            key: "module_id",
            label: "Модуль",
            render: (value: number) => moduleById.get(value) ?? value,
        },
        {
            key: "level",
            label: "Рівень",
            render: (value: string) => (
                <span className={`${styles.logLevel} ${styles[`log_${value}`]}`}>
                    {value.toUpperCase()}
                </span>
            ),
        },
        {
            key: "message",
            label: "Повідомлення",
        },
    ];

    return (
        <Table
            columns={columns}
            data={logs}
            emptyText="Логів поки немає."
            maxWidth="100%"
        />
    );
};


type StoreTabProps = {
    items: UniversalStoreItem[];
};

const StoreTab: React.FC<StoreTabProps> = ({ items }) => {
    const columns = [
        {
            key: "id",
            label: "ID",
        },
        {
            key: "scope",
            label: "Scope",
        },
        {
            key: "key",
            label: "Key",
        },
        {
            key: "data_type",
            label: "Тип даних",
        },
        {
            key: "value",
            label: "Значення",
            render: (value: any) => (
                <code>
                    {JSON.stringify(value)?.length > 80
                        ? JSON.stringify(value).slice(0, 80) + "…"
                        : JSON.stringify(value)}
                </code>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            data={items}
            emptyText="Записів поки немає."
            maxWidth="100%"
        />
    );
};

