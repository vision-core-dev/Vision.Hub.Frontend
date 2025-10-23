import styles from "./ListItem.module.css";
import TaskItem from "../TaskItem/TaskItem";
import { Plus, X } from "lucide-react";
import type {List, Task, TaskTag} from "../BoardPage/BoardPage.tsx";
import Button from "../../../../basic/Button/Button.tsx";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../../../utils/api.ts";

type ListProps = {
    list: List;
    onSelectTask: (task: Task) => void;
    boardTags: TaskTag[]; // 👈 опціонально, якщо потрібні теги дошки
    boardId: string | null | undefined; // 👈 додай у пропси ID дошки
    refresh: () => Promise<void>; // 👈 опціонально, щоб оновити список після створення
};

const ListItem = ({ list, onSelectTask, boardId, refresh, boardTags }: ListProps) => {
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [taskName, setTaskName] = useState("");
    const [loading, setLoading] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    // 🧠 Створення задачі
    const createTask = async () => {
        if (!taskName.trim()) return;
        if (!boardId) return;
        try {
            setLoading(true);

            await api.post(`/v1/Hub/Boards/${boardId}/Tasks/Create`, {
                list_id: list.id,
                name: taskName,
                description: "",
                assignee_ids: [],
                priority: "low",
                deadline_at: null,
                value_uah: 0,
            });

            // console.log("✅ Task created:", res.data);

            // Очищаємо поле
            setTaskName("");
            setShowCreateTask(false);

            // 🔄 Оновлення (якщо передано refresh)
            if (refresh) await refresh();
        } catch (err) {
            console.error("❌ Error creating task:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🧠 Закриття блоку створення при кліку поза ним
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (showCreateTask && listRef.current && !listRef.current.contains(e.target as Node)) {
                setShowCreateTask(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showCreateTask]);

    return (
        <div
            className={styles.list}
            style={{ backgroundColor: list.color || "#fff" }}
            ref={listRef}
        >
            <div className={styles.header}>
                <h2 className={styles.title}>{list.name}</h2>
                <span className={styles.count}>{list.tasks.length}</span>
            </div>

            {list.tasks.map((task) => (
                <div key={task.id} onClick={() => onSelectTask(task)}>
                    <TaskItem boardTags={boardTags} task={task} />
                </div>
            ))}

            {showCreateTask ? (
                <div className={styles.createTask}>
                    <textarea
                        autoFocus
                        placeholder="Введіть назву задачі..."
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className={styles.actions}>
                        <Button variant="primary" onClick={createTask} disabled={loading}>
                            {loading ? "Створюється..." : "Додати задачу"}
                        </Button>
                        <Button variant="secondary" onClick={() => setShowCreateTask(false)}>
                            <X />
                        </Button>
                    </div>
                </div>
            ) : (
                <button className={styles.addTask} onClick={() => setShowCreateTask(true)}>
                    <Plus strokeWidth={2} size={16} /> Додати задачу
                </button>
            )}
        </div>
    );
};

export default ListItem;
