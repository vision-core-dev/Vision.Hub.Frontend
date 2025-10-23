import styles from "./ListItem.module.css";
import TaskItem from "../TaskItem/TaskItem";
import { Plus, X } from "lucide-react";
import type { List, Task, TaskTag } from "../BoardPage/BoardPage.tsx";
import Button from "../../../../basic/Button/Button.tsx";
import React, { useEffect, useState } from "react";
import { api } from "../../../../../utils/api.ts";
import type { UserType } from "../../../../../types/Users.ts";
import { getTextColor } from "../../../../../utils/colors.ts";
import {useParams} from "react-router-dom";

type ListProps = {
    list: List;
    onSelectTask: (task: Task) => void;
    boardTags: TaskTag[];
    boardId?: string | null;
    users: UserType[];
    onTaskMove?: (taskId: string, toListId: string, newIndex: number) => void;
};

const ListItem = ({
                      list,
                      onSelectTask,
                      boardTags,
                      users,
                      onTaskMove,
                  }: ListProps) => {
    const { id } = useParams();
    const [localTasks, setLocalTasks] = useState<Task[]>(list.tasks || []);
    const [insertIndex, setInsertIndex] = useState<number | null>(null);
    const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [taskName, setTaskName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLocalTasks(list.tasks || []);
    }, [list.tasks]);

    // 🧠 Create
    const createTask = async () => {
        if (!taskName.trim()) return;
        setLoading(true);
        await api
            .post(`/v1/Hub/Boards/${id}/Tasks/Create`, {
                list_id: list.id,
                name: taskName,
                description: "",
                assignee_ids: [],
                priority: "low",
                deadline_at: null,
                value_uah: 0,
            })
            .catch(console.error);
        setTaskName("");
        setShowCreateTask(false);
        setLoading(false);
    };


    // 🎯 start
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("task_id", taskId);
        e.dataTransfer.setData("source_list_id", list.id);
        setDraggingTaskId(taskId);
        setInsertIndex(null);
    };

// 🧲 over на картці — визначаємо before/after відносно половини висоти
    const handleDragOverTask = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.stopPropagation(); // 👈 щоб список не перезаписав індекс
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const before = (e.clientY - rect.top) < rect.height / 2;
        setInsertIndex(before ? index : index + 1);
    };

// 🧲 over на списку — тільки коли реально над списком (а не над карткою)
    const handleDragOverList = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return; // 👈 не чіпаємо, якщо подія від дитини
        e.preventDefault();
        setInsertIndex(localTasks.length); // в кінець
    };

// 💾 drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("task_id");
        const sourceListId = e.dataTransfer.getData("source_list_id");
        if (!taskId) return;

        const toIndex = Math.max(0, Math.min(insertIndex ?? localTasks.length, localTasks.length));

        if (sourceListId === list.id) {
            // reorder в межах списку
            const fromIndex = localTasks.findIndex(t => t.id === taskId);
            if (fromIndex === -1) return;

            if (fromIndex === toIndex || fromIndex + 1 === toIndex) {
                // позиція не змінилась фактично
                setInsertIndex(null);
                setDraggingTaskId(null);
                return;
            }

            const updated = [...localTasks];
            const [moved] = updated.splice(fromIndex, 1);
            // якщо тягнули вниз, після вирізання індекс цілі зміщується на -1
            const normalizedTarget = fromIndex < toIndex ? toIndex - 1 : toIndex;
            updated.splice(normalizedTarget, 0, moved);
            setLocalTasks(updated);

            api.post(`/v1/Hub/Tasks/${taskId}/SetTaskOrder`, {
                order: normalizedTarget,
                list_id: list.id,
            }).catch(console.error);
        } else {
            // між списками
            onTaskMove?.(taskId, list.id, toIndex);
        }

        setInsertIndex(null);
        setDraggingTaskId(null);
    };

// ❌ leave — чистимо тільки коли реально вийшли зі списку
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setInsertIndex(null);
        }
    };


    return (
        <div
            className={styles.list}
            style={{ backgroundColor: list.color || "#f1f2f4" }}
            onDragOver={handleDragOverList}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
        >
            <div className={styles.header}>
                <h2
                    className={styles.title}
                    style={{ color: getTextColor(list.color || "#f1f2f4") }}
                >
                    {list.name}
                </h2>
                <span className={styles.count}>{localTasks.length}</span>
            </div>

            <div className={styles.tasks}>
                {localTasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                        {insertIndex === index && <div className={styles.insertLine} />}
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragOver={(e) => handleDragOverTask(e, index)}
                            className={`${styles.taskWrapper} ${
                                draggingTaskId === task.id ? styles.dragging : ""
                            }`}
                            onClick={() => onSelectTask(task)}
                        >
                            <TaskItem boardTags={boardTags} users={users} task={task} />
                        </div>
                    </React.Fragment>
                ))}

                {insertIndex === localTasks.length && <div className={styles.insertLine} />}
            </div>

            {!showCreateTask ? (
                <button className={styles.addTask} onClick={() => setShowCreateTask(true)}>
                    <Plus strokeWidth={2} size={16} /> Додати задачу
                </button>
            ) : (
                <div className={styles.createTask}>
            <textarea
                autoFocus
                placeholder="Введіть назву задачі..."
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), createTask())
                }
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
            )}
        </div>

    );
};

export default ListItem;
