import { useEffect, useRef, useState } from "react";
import styles from "./BoardPage.module.css";
import ListItem from "../ListItem/ListItem";
import { useParams } from "react-router-dom";
import type {UserType} from "@/shared/types/Users.ts";
import {api} from "@/shared/utils/api.ts";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots.tsx";
import {useDragScroll} from "@/shared/utils/useDragScroll.ts";
import {SlidersVertical} from "lucide-react";
import BoardSettings from "./BoardSettings/BoardSettings.tsx";
import TaskDetailsModal from "../TaskDetails/TaskDetailsModal.tsx";
import {ButtonUtility} from "@/shared/ui/buttons/button-utility.tsx";


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
        members: { [userId: string]: string};
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

const BoardPage = ({ is_public=false }: Props) => {
    const { id } = useParams();
    const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
    const [boardLists, setBoardLists] = useState<List[]>([]);

    const [loading, setLoading] = useState(true);

    const [showSettings, setShowSettings] = useState(false);

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const isTaskModalOpen = Boolean(selectedTaskId);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    useDragScroll(scrollRef, { axis: "x", speed: 1.2 });

    const fetchBoard = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await api.get(`/v1/Hub/Boards/${id}/GetDetails`+(is_public ? "?only-public" : ""));
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
    };

    // 🟦 Запит на бекенд
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (id) {
            fetchBoard();
            interval = setInterval(() => {
                fetchBoard(true);
            }, 5000);
        }

        return () => clearInterval(interval);
    }, [id]);

    const handleTaskMove = (taskId: string, toListId: string, newIndex: number): Task | null => {
        let movedTask: Task | null = null;

        setBoardLists(prevLists => {
            const updated = prevLists.map(list => {
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

            // повертаємо оновлений список у state
            return updated;
        });

        return movedTask;
    };

    if (loading) return <LoaderDots />;
    if (!boardDetails) return <div className={styles.error}>Дошку не знайдено 😔</div>;

    return (
        <div className={`${is_public ? styles.publicPage : styles.page}`} style={{backgroundImage: `url(${boardDetails.board.banner_url || ""})`}}>
            <div className={styles.header}>
                <h1 className={styles.title}>{boardDetails.board.name}</h1>
                <div className={styles.extraActions}>
                    {is_public || (
                        <ButtonUtility onClick={() => setShowSettings(!showSettings)} icon={SlidersVertical} />
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
                            onSelectTask={(task) => setSelectedTaskId(task.id)}
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
                        setSelectedTaskId(null);
                    }
                }}
                taskId={selectedTaskId ?? ""}
                boardTags={boardDetails.tags}
                boardLists={boardLists}
            />

        </div>
    );
};

export default BoardPage;









