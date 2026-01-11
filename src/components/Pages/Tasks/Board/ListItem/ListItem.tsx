import styles from "./ListItem.module.css";
import TaskItem from "../TaskItem/TaskItem";
import { Plus, X } from "lucide-react";
import type { List, Task, TaskTag } from "../BoardPage/BoardPage.tsx";
import React, { useEffect, useState } from "react";
import { api } from "@/utils/api.ts";
import type { UserType } from "@/types/Users.ts";
import { getTextColor } from "@/utils/colors.ts";
import {useParams} from "react-router-dom";
import {Button} from "@/ui/base/buttons/button.tsx";

type ListProps = {
    isBoardPublic: boolean;
    list: List;
    onSelectTask: (task: Task) => void;
    boardTags: TaskTag[];
    boardId?: string | null;
    users: UserType[];
    onTaskMove?: (taskId: string, toListId: string, newIndex: number) => Task | null; // 👈 ось тут
};

const ListItem = ({
                      isBoardPublic=false,
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
        const handleGlobalEnd = () => {
            setDraggingTaskId(null);
            setInsertIndex(null);
        };

        window.addEventListener("mouseup", handleGlobalEnd);
        window.addEventListener("dragend", handleGlobalEnd);

        return () => {
            window.removeEventListener("mouseup", handleGlobalEnd);
            window.removeEventListener("dragend", handleGlobalEnd);
        };
    }, []);

    useEffect(() => {
        setLocalTasks(list.tasks || []);
    }, [list.id]);

    // 🧠 Create
    const createTask = async () => {
        if (isBoardPublic) {
            return;
        }
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
        if (isBoardPublic) {
            return;
        }
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("task_id", taskId);
        e.dataTransfer.setData("source_list_id", list.id);
        setDraggingTaskId(taskId);
        setInsertIndex(null);
    };

    // 🧲 over task
    const handleDragOverTask = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        if (isBoardPublic) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const before = e.clientY - rect.top < rect.height / 2;
        setInsertIndex(before ? index : index + 1);
    };

    // 🧲 over list
    const handleDragOverList = (e: React.DragEvent<HTMLDivElement>) => {
        if (isBoardPublic) {
            return;
        }
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        setInsertIndex(localTasks.length);
    };

    // 💾 drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (isBoardPublic) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const taskId = e.dataTransfer.getData("task_id");
        const sourceListId = e.dataTransfer.getData("source_list_id");
        if (!taskId) return handleDragEnd();

        const toIndex = Math.max(0, Math.min(insertIndex ?? localTasks.length, localTasks.length));

        try {
            if (sourceListId === list.id) {
                // 🔁 reorder у межах того ж списку
                const fromIndex = localTasks.findIndex(t => t.id === taskId);
                if (fromIndex === -1) return handleDragEnd();

                const updated = [...localTasks];
                const [moved] = updated.splice(fromIndex, 1);
                const normalizedTarget = fromIndex < toIndex ? toIndex - 1 : toIndex;
                updated.splice(normalizedTarget, 0, moved);
                setLocalTasks(updated);

                api.post(`/v1/Hub/Tasks/${taskId}/SetTaskOrder`, {
                    list_id: list.id,
                    order: normalizedTarget,
                }).catch(console.error);
            } else {
                // 🚀 між списками — переносимо сам об'єкт, не "…"
                let movedTask: Task | null = null;

                // 1️⃣ дістаємо саму таску з попереднього списку через callback
                if (onTaskMove) {
                    movedTask = onTaskMove(taskId, list.id, toIndex);
                }

                // 2️⃣ додаємо в локальний список одразу реальний таск
                if (movedTask) {
                    setLocalTasks(prev => {
                        const updated = [...prev];
                        const normalizedTarget = Math.min(toIndex, updated.length);
                        updated.splice(normalizedTarget, 0, movedTask!);
                        return updated;
                    });
                }

                // 3️⃣ один запит на бекенд
                api.post(`/v1/Hub/Tasks/${taskId}/SetTaskOrder`, {
                    list_id: list.id,
                    order: toIndex,
                }).catch(console.error);
            }
        } finally {
            handleDragEnd();
        }
    };





    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (isBoardPublic) {
            return;
        }
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setInsertIndex(null);
        }
    };

    const handleDragEnd = () => {
        if (isBoardPublic) {
            return;
        }
        setDraggingTaskId(null);
        setInsertIndex(null);
    };

    return (
        <div
            className={styles.list}
            onDragOver={(e) => {
                if (isBoardPublic) {
                    return;
                }
                e.preventDefault(); // 🧠 must have
                handleDragOverList(e);
            }}
            onDrop={(e) => {
                if (isBoardPublic) {
                    return;
                }
                e.preventDefault();
                handleDrop(e);
            }}
            onDragLeave={handleDragLeave}
            style={{ backgroundColor: list.color || "#f1f2f4" }}
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

            {localTasks.length > 0 && (
                <div className={styles.tasks}>
                    {localTasks.map((task, index) => (
                        <React.Fragment key={task.id}>
                            {insertIndex === index && <div className={styles.insertLine} />}
                            <div
                                draggable={!isBoardPublic}
                                onDragStart={(e) => handleDragStart(e, task.id)}
                                onDragOver={(e) => handleDragOverTask(e, index)}
                                onDragEnd={handleDragEnd} // 👈 вот это
                                onDrop={(e) => handleDrop(e)} // 👈 чтоб точно сработал drop
                                className={`${styles.taskWrapper} ${
                                    (draggingTaskId === task.id && !isBoardPublic) ? styles.dragging : ""
                                }`}
                                onClick={() => !isBoardPublic && onSelectTask(task)}
                            >
                                <TaskItem isBoardPublic={isBoardPublic} boardTags={boardTags} users={users} task={task} />
                            </div>
                        </React.Fragment>
                    ))}

                    {insertIndex === localTasks.length && <div className={styles.insertLine} />}
                </div>
            )}


            {!isBoardPublic && (
                <>
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
                                <Button color="primary" onClick={createTask} disabled={loading} isLoading={loading} showTextWhileLoading>
                                    Додати задачу
                                </Button>
                                <Button color="secondary" onClick={() => setShowCreateTask(false)} iconLeading={X} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>

    );
};

export default ListItem;
