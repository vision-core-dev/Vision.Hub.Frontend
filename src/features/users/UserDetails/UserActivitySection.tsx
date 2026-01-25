import { useState, useEffect } from "react";
import { api } from "@/shared/utils/api.ts";
import { safeDatetime } from "@/shared/utils/safeDate.ts";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal";
import { Activity, ChevronRight, X, FileText, Edit, Trash2, Archive, UserPlus, UserMinus } from "lucide-react";

interface LogEntry {
    id: string;
    actor_id: string | null;
    entity_type: string;
    entity_id: string;
    entity_name: string | null;
    action: string;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    changed_fields: string[] | null;
    details: string | null;
    extra_data: Record<string, any> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

interface LogsResponse {
    logs: LogEntry[];
    total: number;
    page: number;
    page_size: number;
}

interface UserActivitySectionProps {
    userId: string;
}

const UserActivitySection = ({ userId }: UserActivitySectionProps) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
    const [totalLogs, setTotalLogs] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const PREVIEW_COUNT = 5;
    const PAGE_SIZE = 20;

    // Завантаження превью логів
    useEffect(() => {
        const fetchPreviewLogs = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/v1/Hub/logs/user/${userId}?page=1&page_size=${PREVIEW_COUNT}`);
                if (res.ok) {
                    const data: LogsResponse = await res.json();
                    setLogs(data.logs);
                    setTotalLogs(data.total);
                }
            } catch (error) {
                console.error("Failed to fetch user logs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreviewLogs();
    }, [userId]);

    // Завантаження всіх логів для модалки
    const loadAllLogs = async (page: number = 1) => {
        try {
            setLoadingMore(true);
            const res = await api.get(`/v1/Hub/logs/user/${userId}?page=${page}&page_size=${PAGE_SIZE}`);
            if (res.ok) {
                const data: LogsResponse = await res.json();
                if (page === 1) {
                    setAllLogs(data.logs);
                } else {
                    setAllLogs(prev => [...prev, ...data.logs]);
                }
                setCurrentPage(page);
                setTotalLogs(data.total);
            }
        } catch (error) {
            console.error("Failed to fetch all logs:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        loadAllLogs(1);
    };

    const handleLoadMore = () => {
        loadAllLogs(currentPage + 1);
    };

    const getActionIcon = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create':
                return FileText;
            case 'update':
                return Edit;
            case 'delete':
                return Trash2;
            case 'archive':
                return Archive;
            case 'assign':
                return UserPlus;
            case 'unassign':
                return UserMinus;
            default:
                return Activity;
        }
    };

    const getActionColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create':
                return 'text-green-600 bg-green-50';
            case 'update':
                return 'text-blue-600 bg-blue-50';
            case 'delete':
                return 'text-red-600 bg-red-50';
            case 'archive':
                return 'text-orange-600 bg-orange-50';
            case 'assign':
            case 'unassign':
                return 'text-purple-600 bg-purple-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getActionText = (action: string) => {
        const actionMap: Record<string, string> = {
            'create': 'Створено',
            'update': 'Оновлено',
            'delete': 'Видалено',
            'archive': 'Архівовано',
            'assign': 'Призначено',
            'unassign': 'Знято',
            'move': 'Переміщено',
            'complete': 'Завершено',
            'reopen': 'Відновлено',
        };
        return actionMap[action.toLowerCase()] || action;
    };

    const getEntityTypeText = (entityType: string) => {
        const typeMap: Record<string, string> = {
            'Task': 'Задачу',
            'Board': 'Дошку',
            'User': 'Користувача',
            'List': 'Список',
            'Tag': 'Тег',
        };
        return typeMap[entityType] || entityType;
    };

    if (loading) {
        return (
            <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-brand-600" />
                    <h3 className="m-0 text-base font-semibold">Остання активність</h3>
                </div>
                <p className="text-sm text-tertiary">Завантаження...</p>
            </section>
        );
    }

    return (
        <>
            <section className="rounded-xl border border-secondary bg-primary px-6 py-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={18} className="text-brand-600" />
                        <h3 className="m-0 text-base font-semibold">Остання активність</h3>
                    </div>
                    {totalLogs > PREVIEW_COUNT && (
                        <Button
                            color="link-color"
                            size="sm"
                            onClick={handleOpenModal}
                            iconTrailing={ChevronRight}
                        >
                            Більше
                        </Button>
                    )}
                </div>
                <div className="flex flex-col gap-3">
                    {logs.length === 0 ? (
                        <p className="text-sm text-tertiary">Немає записів активності</p>
                    ) : (
                        logs.map((log) => (
                            <LogItem key={log.id} log={log} getActionIcon={getActionIcon} getActionColor={getActionColor} getActionText={getActionText} getEntityTypeText={getEntityTypeText} />
                        ))
                    )}
                </div>
            </section>

            {/* Модалка з усіма логами */}
            <DialogTrigger isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
                <ModalOverlay isDismissable>
                    <Modal>
                        <Dialog>
                            <div className="relative w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-2xl">
                                <div className="flex items-center justify-between p-6 border-b border-secondary">
                                    <div className="flex items-center gap-2">
                                        <Activity size={20} className="text-brand-600" />
                                        <h2 className="text-xl font-semibold">Історія активності</h2>
                                        <span className="text-sm text-tertiary">({totalLogs})</span>
                                    </div>
                                    <Button color="link-color" onClick={() => setIsModalOpen(false)} iconLeading={X} />
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="flex flex-col gap-3">
                                        {allLogs.map((log) => (
                                            <LogItemDetailed key={log.id} log={log} getActionIcon={getActionIcon} getActionColor={getActionColor} getActionText={getActionText} getEntityTypeText={getEntityTypeText} />
                                        ))}
                                    </div>

                                    {allLogs.length < totalLogs && (
                                        <div className="mt-4 flex justify-center">
                                            <Button
                                                onClick={handleLoadMore}
                                                isLoading={loadingMore}
                                                disabled={loadingMore}
                                            >
                                                Завантажити ще ({totalLogs - allLogs.length})
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>
        </>
    );
};

// Компонент для превью логу
interface LogItemProps {
    log: LogEntry;
    getActionIcon: (action: string) => React.ElementType;
    getActionColor: (action: string) => string;
    getActionText: (action: string) => string;
    getEntityTypeText: (entityType: string) => string;
}

const LogItem = ({ log, getActionIcon, getActionColor, getActionText, getEntityTypeText }: LogItemProps) => {
    const Icon = getActionIcon(log.action);
    const colorClass = getActionColor(log.action);

    return (
        <div className="flex gap-3 rounded-lg border border-secondary bg-secondary/30 p-3 transition-all hover:bg-secondary/50">
            <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                <Icon size={14} />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-sm text-primary">
                    <span className="font-medium">{getActionText(log.action)}</span>{' '}
                    <span className="text-tertiary">{getEntityTypeText(log.entity_type)}</span>{' '}
                    {log.entity_name && <span className="font-medium">"{log.entity_name}"</span>}
                </p>
                <span className="text-xs text-tertiary">{safeDatetime(log.created_at)}</span>
            </div>
        </div>
    );
};

// Детальний компонент логу для модалки
const LogItemDetailed = ({ log, getActionIcon, getActionColor, getActionText, getEntityTypeText }: LogItemProps) => {
    const Icon = getActionIcon(log.action);
    const colorClass = getActionColor(log.action);
    const [showDetails, setShowDetails] = useState(false);

    const hasDetails = log.changed_fields && log.changed_fields.length > 0;

    return (
        <div className="flex flex-col gap-2 rounded-lg border border-secondary bg-secondary/30 p-4 transition-all hover:bg-secondary/50">
            <div className="flex gap-3">
                <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon size={16} />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm text-primary">
                        <span className="font-semibold">{getActionText(log.action)}</span>{' '}
                        <span className="text-tertiary">{getEntityTypeText(log.entity_type)}</span>{' '}
                        {log.entity_name && <span className="font-semibold">"{log.entity_name}"</span>}
                    </p>
                    {log.details && (
                        <p className="text-xs text-tertiary">{log.details}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-tertiary">
                        <span>{safeDatetime(log.created_at)}</span>
                        {log.ip_address && <span>• IP: {log.ip_address}</span>}
                    </div>
                </div>
                {hasDetails && (
                    <Button
                        color="link-color"
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        {showDetails ? 'Сховати' : 'Деталі'}
                    </Button>
                )}
            </div>

            {showDetails && hasDetails && (
                <div className="mt-2 rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs font-semibold text-primary mb-2">Змінені поля:</p>
                    <div className="flex flex-col gap-2">
                        {log.changed_fields!.map((field) => (
                            <div key={field} className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-primary">{field}:</span>
                                <div className="flex gap-2 text-xs">
                                    {log.old_values && log.old_values[field] !== undefined && (
                                        <span className="text-red-600">
                                            <span className="text-tertiary">Було:</span> {JSON.stringify(log.old_values[field])}
                                        </span>
                                    )}
                                    {log.new_values && log.new_values[field] !== undefined && (
                                        <span className="text-green-600">
                                            <span className="text-tertiary">Стало:</span> {JSON.stringify(log.new_values[field])}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserActivitySection;
