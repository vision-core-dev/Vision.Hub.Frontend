import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import styles from "./BoardPage.module.css";
import ListItem from "../ListItem/ListItem";
import { useParams, useNavigate } from "react-router-dom";
import type { UserType } from "@/shared/types/Users.ts";
import { api } from "@/shared/utils/api.ts";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots.tsx";
import { useDragScroll } from "@/shared/utils/useDragScroll.ts";
import { SlidersVertical } from "lucide-react";
import BoardSettings from "./BoardSettings/BoardSettings.tsx";
import TaskDetailsModal from "../TaskDetails/TaskDetailsModal.tsx";
import { useBoardWebSocket, type ActiveUser } from "@/shared/hooks/useBoardWebSocket.ts";
import { useAuth } from "@/core/auth/AuthContext.tsx";
import { Avatar } from "@/shared/ui/avatar/avatar.tsx";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { Tooltip, TooltipTrigger } from "@/shared/ui/tooltip/tooltip.tsx";


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
    subtasks_total?: number,
    subtasks_completed?: number
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
    // members: UserType[];
    tags: TaskTag[];
};

interface Props {
    is_public: boolean;
}

const BoardPage = ({ is_public = false }: Props) => {
    const { id, taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
    const [boardLists, setBoardLists] = useState<List[]>([]);
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

    const [loading, setLoading] = useState(true);

    const [showSettings, setShowSettings] = useState(false);

    const isTaskModalOpen = Boolean(taskId);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    useDragScroll(scrollRef, { axis: "x", speed: 1.2 });

    const fetchBoard = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await api.get(`/v1/Hub/Boards/${id}/GetDetails` + (is_public ? "?only-public" : ""));
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
        } catch (err) {
            console.error("Помилка при оновленні дошки:", err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [id, is_public]);

    const currentUser = useMemo(() => user ? {
        user_id: user.id,
        name: `${user.first_name} ${user.last_name || ''}`.trim(),
        avatar_url: user.avatar_url ?? undefined
    } : undefined, [user]);

    const handleBoardUpdate = useCallback(() => {
        console.log("📡 Received board update via WebSocket, refreshing...");
        fetchBoard(true);
    }, [fetchBoard]);

    const handleUserPresenceChange = useCallback((users: ActiveUser[]) => {
        // console.log("👥 Active users updated:", users);
        setActiveUsers(users);
    }, []);

    // 🔌 WebSocket connection for real-time updates
    const { notifyBoardChange } = useBoardWebSocket({
        boardId: id,
        currentUser,
        onUpdate: handleBoardUpdate,
        onUserPresenceChange: handleUserPresenceChange,
        enabled: !is_public // Only enable WebSocket for non-public boards
    });

    // 🟦 Initial fetch
    useEffect(() => {
        if (id) {
            fetchBoard();
        }
    }, [id, fetchBoard]);

    // Handle initial task selection from URL params? No, handled by derived state `taskId`

    const handleTaskMove = (taskId: string, toListId: string, newIndex: number): Task | null => {
        if (!boardDetails) return null;

        let movedTask: Task | null = null;

        // Use boardDetails.lists as source of truth
        const currentLists = boardDetails.lists;

        const updatedLists = currentLists.map(list => {
            const safeTasks = Array.isArray(list.tasks) ? list.tasks : [];

            // видаляємо зі старого списку
            if (safeTasks.some(t => t.id === taskId)) {
                movedTask = safeTasks.find(t => t.id === taskId) || null;
                return { ...list, tasks: safeTasks.filter(t => t.id !== taskId) };
            }

            return list;
        }).map(list => {
            // додаємо в новий список
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

            // Notify other clients via WebSocket
            notifyBoardChange('task_moved');
        }

        return movedTask;
    };

    if (loading) return <LoaderDots />;
    if (!boardDetails) return <div className={styles.error}>Дошку не знайдено 😔</div>;

    return (
        <div className={`${is_public ? styles.publicPage : styles.page}`} style={{ backgroundImage: `url(${boardDetails.board.banner_url || ""})` }}>
            <div className={styles.header}>
                <h1 className={styles.title}>{boardDetails.board.name}</h1>

                <div className="flex items-center gap-2 ml-4">
                    {activeUsers.length > 0 && (
                        <div className="flex -space-x-2">
                            {activeUsers.slice(0, 5).map((user) => (
                                <Tooltip title={user.name}>
                                    <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2 text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                                        <Avatar
                                            key={user.user_id}
                                            size="sm"
                                            src={user.avatar_url}
                                            initials={user.name.split(' ').map(n => n[0]).join('')}
                                        />
                                    </TooltipTrigger>
                                </Tooltip>
                            ))}
                        </div>
                    )}

                    {is_public || (
                        <Button color="secondary" onClick={() => setShowSettings(!showSettings)} iconLeading={SlidersVertical} />
                    )}
                </div>
            </div>

            <div className={styles.content}>
                <div ref={scrollRef} className={styles.lists}>
                    {boardDetails.lists.map((list) => (
                        <ListItem
                            isBoardPublic={is_public}
                            // refresh={() => fetchBoard(true)}
                            boardId={id}
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
            />

        </div >
    );
};

export default BoardPage;









