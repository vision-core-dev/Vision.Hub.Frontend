import { useEffect, useRef, useState } from "react";
import styles from "./BoardPage.module.css";
import ListItem from "../ListItem/ListItem";
import { useParams } from "react-router-dom";
import type {UserType} from "../../../../../types/Users.ts";
import {api} from "../../../../../utils/api.ts";
import LoaderDots from "../../../../basic/LoaderDots/LoaderDots.tsx";
import {useDragScroll} from "../../../../../utils/useDragScroll.ts";
import {Ellipsis} from "lucide-react";
import BoardSettings from "./BoardSettings/BoardSettings.tsx";
import TaskDetailsModal from "../TaskDetails/TaskDetailsModal.tsx";


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

type BoardDetails = {
    board: {
        id: string;
        name: string;
        description?: string;
        banner_url?: string;
    };
    lists: List[];
    tasks: Task[];
    users: UserType[];
    // members: UserType[];
    tags: TaskTag[];
};

const BoardPage = () => {
    const { id } = useParams();
    const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
    const [boardLists, setBoardLists] = useState<List[]>([]);

    const [loading, setLoading] = useState(true);

    const [showSettings, setShowSettings] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    useDragScroll(scrollRef, { axis: "x", speed: 1.2 });

    const fetchBoard = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await api.get(`/v1/Hub/Boards/${id}/GetDetails`);
            const data: BoardDetails = await res.json();

            setBoardLists(data.lists)

            const listsWithTasks: List[] = data.lists.map((list) => ({
                ...list,
                tasks: data.tasks.filter((task) => task.list_id === list.id),
            }));

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
        <div className={styles.page} style={{backgroundImage: `url(${boardDetails.board.banner_url || ""})`}}>
            <div className={styles.header}>
                <h1 className={styles.title}>{boardDetails.board.name}</h1>
                <div className={styles.extraActions}>
                    <button onClick={() => setShowSettings(!showSettings)}><Ellipsis /></button>
                </div>
            </div>

            <div className={styles.content}>
                <div ref={scrollRef} className={styles.lists}>
                    {boardDetails.lists.map((list) => (
                        <ListItem
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

                <div className={styles.settingsWrapper}>
                    <div className={`${styles.slideIn} ${showSettings ? styles.active : ""}`}>
                        <BoardSettings boardId={boardDetails.board.id} />
                    </div>
                </div>

            </div>

            {selectedTaskId && (
                <TaskDetailsModal
                    taskId={selectedTaskId}
                    boardTags={boardDetails.tags}
                    boardLists={boardLists}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}

        </div>
    );
};

export default BoardPage;
