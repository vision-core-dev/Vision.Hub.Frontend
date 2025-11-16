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
} from "../../../../types/VisionBot.ts";
import {visionBotApi} from "../../../../api/visionBot.ts";
import DefaultPage from "../../../basic/DefaultPage/DefaultPage.tsx";
import Button from "../../../basic/Button/Button.tsx";
import {Undo2} from "lucide-react";

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
        return (<Button variant="secondary" adaptive={true}
                        onClick={() => navigate("/finance")}
        ><Undo2 /> Повернутись</Button>);
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
                    variant={tab === "overview" ? "primary" : "secondary"}
                    onClick={() => setTab("overview")}
                >
                    Огляд
                </Button>
                <Button
                    variant={tab === "settings" ? "primary" : "secondary"}
                    onClick={() => setTab("settings")}
                >
                    Налаштування
                </Button>
                <Button
                    variant={tab === "modules" ? "primary" : "secondary"}
                    onClick={() => setTab("modules")}
                >
                    Модулі
                </Button>
                <Button
                    variant={tab === "logs" ? "primary" : "secondary"}
                    onClick={() => setTab("logs")}
                >
                    Логи
                </Button>
                <Button
                    variant={tab === "store" ? "primary" : "secondary"}
                    onClick={() => setTab("store")}
                >
                    Store
                </Button>
            </div>

            {loading && <div className={styles.state}>Завантаження...</div>}

            {!loading && server && (
                <div className={styles.content}>
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
                </div>
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
    const handleChange = <K extends keyof GuildSettings>(
        field: K,
        value: GuildSettings[K]
    ) => {
        setSettings({
            ...settings,
            [field]: value,
        });
    };

    return (
        <div className={styles.card}>
            <h2 className={styles.cardTitle}>Налаштування сервера</h2>

            <div className={styles.formGrid}>
                <label className={styles.field}>
                    <span className={styles.fieldLabel}>Мова</span>
                    <select
                        className={styles.select}
                        value={settings.language}
                        onChange={(e) => handleChange("language", e.target.value)}
                    >
                        <option value="uk">Українська</option>
                        <option value="en">English</option>
                    </select>
                </label>

                <label className={styles.field}>
                    <span className={styles.fieldLabel}>Канал логів (ID)</span>
                    <input
                        className={styles.input}
                        value={settings.logs_channel_id ?? ""}
                        onChange={(e) =>
                            handleChange(
                                "logs_channel_id",
                                e.target.value.trim() === "" ? null : e.target.value
                            )
                        }
                    />
                </label>

                <label className={styles.field}>
                    <span className={styles.fieldLabel}>Ролі при вході (IDs через кому)</span>
                    <input
                        className={styles.input}
                        value={settings.on_member_added_roles.join(",")}
                        onChange={(e) =>
                            handleChange(
                                "on_member_added_roles",
                                e.target.value
                                    .split(",")
                                    .map((v) => v.trim())
                                    .filter(Boolean)
                            )
                        }
                    />
                </label>
            </div>

            <div className={styles.actions}>
                <Button
                    onClick={onSave}
                    disabled={saving}
                >
                    {saving ? "Збереження..." : "Зберегти"}
                </Button>
            </div>
        </div>
    );
};

type ModulesTabProps = {
    guildId: string;
    modules: VisionBotModule[];
};

const ModulesTab: React.FC<ModulesTabProps> = ({modules }) => {
    const { guildId } = useParams<{ guildId: string }>();
    const navigate = useNavigate();
    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Модулі</h2>
            </div>

            <table className={styles.table}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Назва</th>
                    <th>Статус</th>
                    <th>Тип</th>
                    <th />
                </tr>
                </thead>
                <tbody>
                {modules.map((m) => (
                    <tr key={m.id}>
                        <td>{m.id}</td>
                        <td>{m.name}</td>
                        <td>
                <span
                    className={`${styles.statusBadge} ${
                        m.status ? styles.statusActive : styles.statusInactive
                    }`}
                >
                  {m.status ? "Активний" : "Вимкнений"}
                </span>
                        </td>
                        <td>{m.code.trim().startsWith("event(") ? "Event" : "Local cmd"}</td>
                        <td>
                            <Button
                                onClick={() => navigate(`/vision-bot/s/${guildId}/m/${m.id}`)}
                            >
                                Редагувати
                            </Button>
                        </td>
                    </tr>
                ))}

                {modules.length === 0 && (
                    <tr>
                        <td colSpan={5} className={styles.empty}>
                            Модулів поки немає.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

type LogsTabProps = {
    logs: ModuleLog[];
    modules: VisionBotModule[];
};

const LogsTab: React.FC<LogsTabProps> = ({ logs, modules }) => {
    const moduleById = new Map(modules.map((m) => [m.id, m.name]));
    return (
        <div className={styles.card}>
            <h2 className={styles.cardTitle}>Логи</h2>

            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Час</th>
                    <th>Модуль</th>
                    <th>Рівень</th>
                    <th>Повідомлення</th>
                </tr>
                </thead>
                <tbody>
                {logs.map((l) => (
                    <tr key={l.id}>
                        <td>{new Date(l.timestamp).toLocaleString()}</td>
                        <td>{moduleById.get(l.module_id) ?? l.module_id}</td>
                        <td>
                <span
                    className={`${styles.logLevel} ${styles[`log_${l.level}`]}`}
                >
                  {l.level.toUpperCase()}
                </span>
                        </td>
                        <td>{l.message}</td>
                    </tr>
                ))}

                {logs.length === 0 && (
                    <tr>
                        <td colSpan={4} className={styles.empty}>
                            Логів поки немає.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

type StoreTabProps = {
    items: UniversalStoreItem[];
};

const StoreTab: React.FC<StoreTabProps> = ({ items }) => {
    return (
        <div className={styles.card}>
            <h2 className={styles.cardTitle}>Universal Store</h2>

            <table className={styles.table}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Scope</th>
                    <th>Key</th>
                    <th>Тип даних</th>
                    <th>Значення</th>
                </tr>
                </thead>
                <tbody>
                {items.map((i) => (
                    <tr key={i.id}>
                        <td>{i.id}</td>
                        <td>{i.scope}</td>
                        <td>{i.key}</td>
                        <td>{i.data_type}</td>
                        <td>
                            <code className={styles.codeCell}>
                                {JSON.stringify(i.value)?.slice(0, 80)}
                                {JSON.stringify(i.value)?.length > 80 && "…"}
                            </code>
                        </td>
                    </tr>
                ))}

                {items.length === 0 && (
                    <tr>
                        <td colSpan={5} className={styles.empty}>
                            Записів поки немає.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};
