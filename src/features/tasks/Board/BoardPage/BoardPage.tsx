import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import styles from "./BoardPage.module.css";
import ListItem from "../ListItem/ListItem";
import { useParams, useNavigate } from "react-router-dom";
import type { UserType } from "@/shared/types/Users.ts";
import { api } from "@/shared/utils/api.ts";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots.tsx";
import { useDragScroll } from "@/shared/utils/useDragScroll.ts";
import { Avatar } from "@/shared/ui/avatar/avatar.tsx";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { Tooltip, TooltipTrigger } from "@/shared/ui/tooltip/tooltip.tsx";
import { SearchLg, FilterLines, XClose, Check, Eye, Settings01 } from "@untitledui/icons";
import { MenuTrigger, Popover, Dialog } from "react-aria-components";
import { useDebouncedCallback } from "use-debounce";
import BoardSettings from "./BoardSettings/BoardSettings.tsx";
import TaskDetailsModal from "../TaskDetails/TaskDetailsModal.tsx";
import { useBoardWebSocket } from "@/shared/hooks/useBoardWebSocket.ts";
import { useAuth } from "@/core/auth/AuthContext.tsx";
import { Input } from "@/shared/components/base/input/input.tsx";
import { AvatarLabelGroup } from "@/shared/components/base/avatar/avatar-label-group.tsx";
import { Badge } from "@/shared/ui/base/badges/badges.tsx";

export type Task = {
    id: string;
    name: string;
    banner_url?: string;
    list_id: string;
    status: string;
    priority: string;
    started_at?: string;
    deadline_at?: string;
    assignees: string[];
    tags: string[];
    subtasks_total?: number;
    subtasks_completed?: number;
    has_description?: boolean;
    accruals_count?: number;
    accruals_sum?: number;
};

export type List = {
    id: string;
    name: string;
    color?: string;
    order?: number;
    tasks: Task[];
};

export type TaskTag = {
    id: string;
    name: string;
    color: string;
}

export type BoardDetails = {
    board: {
        id: string;
        name: string;
        description?: string;
        banner_url?: string;
        members: { [userId: string]: string };
    };
    lists: List[];
    tasks: Task[];
    users: UserType[];
    tags: TaskTag[];
};

interface Props {
    is_public: boolean;
}

/* ===== FilterDropdown — compact dropdown for participants/tags ===== */

interface FilterDropdownProps {
    label: string;
    count: number;
    selectedPreviews: React.ReactNode;
    children: (searchQuery: string) => React.ReactNode;
}

const FilterDropdown = ({ label, count, selectedPreviews, children }: FilterDropdownProps) => {
    const [search, setSearch] = useState("");

    return (
        <div className={styles.filterDropdownWrapper}>
            <MenuTrigger>
                <Button
                    size="sm"
                    color={count > 0 ? "primary" : "secondary"}
                    iconTrailing={count > 0 && <Badge size="sm" color="success">{count}</Badge>}
                >
                    {label}
                </Button>
                <Popover
                    placement="bottom start"
                    className={styles.filterDropdownPanel}
                >
                    <Dialog className="outline-none">
                        <div className={styles.filterDropdownSearch}>
                            <SearchLg size={16} className="text-fg-quaternary" />
                            <input
                                type="text"
                                placeholder="Пошук..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                className="bg-transparent border-none outline-none text-sm w-full"
                            />
                        </div>
                        <div className={styles.filterDropdownList}>
                            {children(search)}
                        </div>
                    </Dialog>
                </Popover>
            </MenuTrigger>
            {selectedPreviews}
        </div>
    );
};

const BoardPage = ({ is_public = false }: Props) => {
    const { id, taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
    const [boardLists, setBoardLists] = useState<List[]>([]);

    const [loading, setLoading] = useState(true);

    const [showSettings, setShowSettings] = useState(false);

    // Filter state
    const [showFilters, setShowFilters] = useState(false);
    const [filterName, setFilterName] = useState("");
    const [filterAssignees, setFilterAssignees] = useState<string[]>([]);
    const [filterTags, setFilterTags] = useState<string[]>([]);

    const hasActiveFilters = filterName.trim() !== "" || filterAssignees.length > 0 || filterTags.length > 0;

    const clearAllFilters = () => {
        setFilterName("");
        setFilterAssignees([]);
        setFilterTags([]);
    };

    const toggleAssigneeFilter = (userId: string) => {
        setFilterAssignees(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleTagFilter = (tagId: string) => {
        setFilterTags(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    const isTaskModalOpen = Boolean(taskId);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    useDragScroll(scrollRef, { axis: "x", speed: 1.2 });

    const lastLocalAction = useRef(0);

    const fetchBoard = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await api.get(`/v1/Hub/Boards/${id}` + (is_public ? "/GetPublicDetails" : "/GetDetails"));
            const data: BoardDetails = await res.json();

            setBoardLists(data.lists)

            const listsWithTasks: List[] = data.lists
                .map((list) => ({
                    ...list,
                    tasks: data.tasks.filter((task) => task.list_id === list.id),
                }))
                .filter((list) => {
                    if (!is_public) return true;
                    return list.tasks.length > 0;
                });

            setBoardDetails({ ...data, lists: listsWithTasks });
        } catch (err: any) {
            console.error("Помилка при оновленні дошки:", err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [id, is_public]);

    const guestId = useRef(is_public ? crypto.randomUUID() : null);

    const currentUser = useMemo(() => {
        if (user) return {
            user_id: user.id,
            name: `${user.first_name} ${user.last_name || ''}`.trim(),
            avatar_url: user.avatar_url ?? undefined
        };
        if (is_public && guestId.current) return {
            user_id: `guest_${guestId.current}`,
            name: "Гість",
            is_guest: true
        };
        return undefined;
    }, [user, is_public]);

    const handleBoardUpdate = useDebouncedCallback(() => {
        if (Date.now() - lastLocalAction.current < 3000) return;
        fetchBoard(true);
    }, 2000);

    const { notifyBoardChange, activeUsers } = useBoardWebSocket({
        boardId: id,
        currentUser,
        onUpdate: handleBoardUpdate,
        enabled: true
    });

    useEffect(() => {
        if (id) {
            fetchBoard();
        }
    }, [id, fetchBoard]);

    const handleTaskMove = (taskId: string, toListId: string, newIndex: number): Task | null => {
        if (!boardDetails) return null;

        let movedTask: Task | null = null;
        const currentLists = boardDetails.lists;

        const updatedLists = currentLists.map(list => {
            const safeTasks = Array.isArray(list.tasks) ? list.tasks : [];
            if (safeTasks.some(t => t.id === taskId)) {
                movedTask = safeTasks.find(t => t.id === taskId) || null;
                return { ...list, tasks: safeTasks.filter(t => t.id !== taskId) };
            }
            return list;
        }).map(list => {
            const safeTasks = Array.isArray(list.tasks) ? list.tasks : [];
            if (list.id === toListId && movedTask) {
                const newTasks = [...safeTasks];
                newTasks.splice(newIndex, 0, movedTask);
                return { ...list, tasks: newTasks };
            }
            return list;
        });

        if (movedTask) {
            setBoardDetails({ ...boardDetails, lists: updatedLists });
            setBoardLists(updatedLists);
            lastLocalAction.current = Date.now();
            notifyBoardChange('task_moved');
        }

        return movedTask;
    };

    const filteredLists = useMemo(() => {
        if (!boardDetails) return [];
        if (!hasActiveFilters) return boardDetails.lists;

        const nameLower = filterName.trim().toLowerCase();

        return boardDetails.lists.map(list => {
            const filteredTasks = list.tasks.filter(task => {
                if (nameLower && !task.name.toLowerCase().includes(nameLower)) {
                    return false;
                }
                if (filterAssignees.length > 0) {
                    const hasMatch = task.assignees?.some(a => filterAssignees.includes(a));
                    if (!hasMatch) return false;
                }
                if (filterTags.length > 0) {
                    const hasMatch = task.tags?.some(t => filterTags.includes(t));
                    if (!hasMatch) return false;
                }
                return true;
            });
            return { ...list, tasks: filteredTasks };
        }).filter(list => {
            if (is_public) return list.tasks.length > 0;
            return true;
        });
    }, [boardDetails, filterName, filterAssignees, filterTags, hasActiveFilters, is_public]);

    if (loading) return <LoaderDots />;
    if (!boardDetails) return <div className={styles.error}>Дошку не знайдено 😔</div>;

    return (
        <div className={`${is_public ? styles.publicPage : styles.page}`} style={{ backgroundImage: `url(${boardDetails.board.banner_url || ""})` }}>
            <div className={styles.header}>
                <h1 className="text-lg font-bold text-fg-primary dark:text-fg-primary_dark">{boardDetails.board.name}</h1>

                <div className="flex items-center gap-3 ml-4">
                    <div className="flex items-center gap-1">
                        {activeUsers.filter((u: any) => !u.is_guest).length > 0 && (
                            <div className="flex -space-x-2">
                                {activeUsers.filter((u: any) => !u.is_guest).slice(0, 5).map((user: any) => (
                                    <Tooltip key={user.user_id} title={user.name}>
                                        <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                                            <Avatar
                                                size="sm"
                                                src={user.avatar_url}
                                                initials={user.name.split(' ').map((n: string) => n[0]).join('')}
                                            />
                                        </TooltipTrigger>
                                    </Tooltip>
                                ))}
                            </div>
                        )}

                        {activeUsers.filter((u: any) => u.is_guest).length > 0 && (
                            <Tooltip title={`${activeUsers.filter((u: any) => u.is_guest).length} ${activeUsers.filter((u: any) => u.is_guest).length === 1 ? "гість" : "гостей"} онлайн`}>
                                <TooltipTrigger className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary">
                                    <Avatar size="sm" className="ring-[1.5px] ring-bg-primary" placeholder={<span className="flex items-center justify-center text-sm font-semibold text-quaternary"><Eye size={14} /></span>} />
                                </TooltipTrigger>
                            </Tooltip>
                        )}
                    </div>

                    {is_public || (
                        <>
                            <Button
                                color={hasActiveFilters ? "primary" : "secondary"}
                                onClick={() => setShowFilters(!showFilters)}
                                iconLeading={FilterLines}
                            />
                            <Button color="secondary" onClick={() => setShowSettings(!showSettings)} iconLeading={Settings01} />
                        </>
                    )}
                </div>
            </div>

            {/* ===== FILTER BAR ===== */}
            {showFilters && !is_public && (
                <div className={styles.filterBar}>
                    {/* Пошук за назвою */}
                    <Input
                        size="sm"
                        icon={SearchLg}
                        placeholder="Пошук за назвою..."
                        value={filterName}
                        onChange={(value) => setFilterName(value)}
                        className="max-w-xs"
                        autoFocus
                    />

                    {/* Учасники — dropdown */}
                    {boardDetails.users && boardDetails.users.length > 0 && (
                        <FilterDropdown
                            label="Учасники"
                            count={filterAssignees.length}
                            selectedPreviews={
                                filterAssignees.length > 0 ? (
                                    <div className={styles.filterSelectedAvatars}>
                                        {filterAssignees.slice(0, 3).map(id => {
                                            const u = boardDetails.users.find(u => u.id === id);
                                            if (!u) return null;
                                            return (
                                                <AvatarLabelGroup
                                                    key={id}
                                                    src={u.avatar_url}
                                                    initials={`${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`}
                                                    size="sm"
                                                    title={undefined}
                                                    subtitle={undefined}
                                                />
                                            );
                                        })}
                                        {filterAssignees.length > 3 && (
                                            <span className={styles.filterMiniMore}>+{filterAssignees.length - 3}</span>
                                        )}
                                    </div>
                                ) : null
                            }
                        >
                            {(searchQuery: string) => {
                                const filtered = boardDetails.users.filter((u: UserType) => {
                                    const name = `${u.first_name} ${u.last_name || ""}`.toLowerCase();
                                    return name.includes(searchQuery.toLowerCase());
                                });
                                return filtered.map((u: UserType) => {
                                    const isActive = filterAssignees.includes(u.id);
                                    return (
                                        <button
                                            key={u.id}
                                            className={`${styles.filterDropdownItem} ${isActive ? styles.filterDropdownItemActive : ""}`}
                                            onClick={() => toggleAssigneeFilter(u.id)}
                                        >
                                            <AvatarLabelGroup
                                                size="sm"
                                                src={u.avatar_url}
                                                initials={`${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`}
                                                title={undefined}
                                                subtitle={undefined}
                                            />
                                            <span className={styles.filterDropdownItemName}>{u.first_name} {u.last_name || ""}</span>
                                            {isActive && <Check size={14} className={styles.filterDropdownCheck} />}
                                        </button>
                                    );
                                });
                            }}
                        </FilterDropdown>
                    )}

                    {/* Теги — dropdown */}
                    {boardDetails.tags && boardDetails.tags.length > 0 && (
                        <FilterDropdown
                            label="Мітки"
                            count={filterTags.length}
                            selectedPreviews={
                                filterTags.length > 0 ? (
                                    <div className={styles.filterSelectedDots}>
                                        {filterTags.slice(0, 5).map(id => {
                                            const tag = boardDetails.tags.find(t => t.id === id);
                                            if (!tag) return null;
                                            return <span key={id} className={styles.filterChipDot} style={{ backgroundColor: tag.color }} />;
                                        })}
                                        {filterTags.length > 5 && (
                                            <span className={styles.filterMiniMore}>+{filterTags.length - 5}</span>
                                        )}
                                    </div>
                                ) : null
                            }
                        >
                            {(searchQuery: string) => {
                                const filtered = boardDetails.tags.filter((t: any) =>
                                    t.name.toLowerCase().includes(searchQuery.toLowerCase())
                                );
                                return filtered.map((tag: any) => {
                                    const isActive = filterTags.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            className={`${styles.filterDropdownItem} ${isActive ? styles.filterDropdownItemActive : ""}`}
                                            onClick={() => toggleTagFilter(tag.id)}
                                        >
                                            <span className={styles.filterChipDot} style={{ backgroundColor: tag.color }} />
                                            <span className={styles.filterDropdownItemName}>{tag.name}</span>
                                            {isActive && <Check size={14} className={styles.filterDropdownCheck} />}
                                        </button>
                                    );
                                });
                            }}
                        </FilterDropdown>
                    )}

                    {/* Скинути фільтри */}
                    {hasActiveFilters && (
                        <Button color="tertiary-destructive" iconLeading={XClose} onClick={clearAllFilters}>
                            Скинути фільтри
                        </Button>
                    )}
                </div>
            )
            }

            <div className={styles.content}>
                <div ref={scrollRef} className={styles.lists}>
                    {filteredLists.map((list) => (
                        <ListItem
                            isBoardPublic={is_public}
                            boardId={id!}
                            boardTags={boardDetails.tags}
                            users={boardDetails.users}
                            key={list.id}
                            list={list}
                            onSelectTask={(task) => navigate(is_public ? `/public/boards/b/${id}/t/${task.id}` : `/boards/b/${id}/t/${task.id}`)}
                            onTaskMove={handleTaskMove}
                        />
                    ))}
                </div>

                {is_public || (
                    <BoardSettings
                        isOpen={showSettings}
                        onOpenChange={(open) => {
                            if (!open) {
                                setShowSettings(false);
                            }
                        }}
                        boardId={boardDetails.board.id} />
                )}
            </div>

            <TaskDetailsModal
                isOpen={isTaskModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        navigate(is_public ? `/public/boards/b/${id}` : `/boards/b/${id}`);
                    }
                }}
                taskId={taskId ?? ""}
                boardTags={boardDetails.tags}
                boardLists={boardLists}
                isReadOnly={is_public}
            />
        </div >
    );
};

export default BoardPage;
