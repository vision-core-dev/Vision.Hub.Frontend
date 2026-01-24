import styles from "./ListItem.module.css";
import TaskItem from "../TaskItem/TaskItem";
import { Plus, X } from "lucide-react";
import type { List, Task, TaskTag } from "../BoardPage/BoardPage.tsx";
import React, { useEffect, useState, useRef } from "react";
import { api } from "@/shared/utils/api.ts";
import type { UserType } from "@/shared/types/Users.ts";
import { getTextColor } from "@/shared/utils/colors.ts";
import { useParams } from "react-router-dom";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { TextArea } from "@/shared/ui/textarea/textarea.tsx";

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
    isBoardPublic = false,
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
        if (!draggingTaskId && insertIndex === null) {
            setLocalTasks(list.tasks || []);
        }
    }, [list.tasks, draggingTaskId, insertIndex]);

    const listRef = useRef<HTMLDivElement>(null);

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
        if (isBoardPublic) return;

        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("task_id", taskId);
        e.dataTransfer.setData("source_list_id", list.id);

        // Delay state update to allow browser to capture the element as drag image
        requestAnimationFrame(() => {
            setDraggingTaskId(taskId);
        });
        setInsertIndex(null);
    };

    // 🧲 Unified Drag Over Handler (Geometry-based)
    const handleDragOverList = (e: React.DragEvent<HTMLDivElement>) => {
        if (isBoardPublic) return;

        e.preventDefault();
        e.stopPropagation();

        if (!listRef.current) return;

        const tasks = Array.from(listRef.current.children).filter(child =>
            child.classList.contains(styles.taskWrapper) // Ensure we only check task wrappers
        ) as HTMLElement[];

        // Finding the closest task to the cursor
        const mouseY = e.clientY;

        let closestIndex = tasks.length;
        tasks.forEach((task, index) => {
            const rect = task.getBoundingClientRect();
            // Metadata: check distance to the vertical center of the task
            const center = rect.top + rect.height / 2;

            if (mouseY < center && index < closestIndex) {
                closestIndex = index;
            }
        });

        // Refined Logic using classic "closest" approach
        // Reduce to find the element immediately *after* the cursor
        const elementAfter = tasks.find(task => {
            const rect = task.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            return mouseY < center;
        });

        const newIndex = elementAfter
            ? tasks.indexOf(elementAfter)
            : tasks.length;

        if (newIndex !== insertIndex) {
            setInsertIndex(newIndex);
        }
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

        // Cleanup state immediately
        setDraggingTaskId(null);
        setInsertIndex(null);

        if (!taskId) return;

        if (insertIndex === null) return handleDragEnd();

        const toIndex = Math.max(0, Math.min(insertIndex, localTasks.length));

        try {
            if (sourceListId === list.id) {
                // 🔁 reorder у межах того ж списку
                const fromIndex = localTasks.findIndex(t => t.id === taskId);
                if (fromIndex === -1) return;

                // If dropping at same position, do nothing
                if (fromIndex === toIndex || fromIndex === toIndex - 1) return;

                const updated = [...localTasks];
                const [moved] = updated.splice(fromIndex, 1);
                // Adjust index if we moved from top to bottom
                const normalizedTarget = fromIndex < toIndex ? toIndex - 1 : toIndex;

                updated.splice(normalizedTarget, 0, moved);
                setLocalTasks(updated);

                // Call parent move handler to update parent state (and eventually list.tasks prop)
                onTaskMove?.(taskId, list.id, normalizedTarget);

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
        } catch (err) {
            console.error(err);
        }
    };





    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (isBoardPublic) {
            return;
        }
        // Only clear if we really left the list container (not entering a child)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setInsertIndex(null);
        }
    };

    const handleDragEnd = () => {
        setDraggingTaskId(null);
        setInsertIndex(null);
    };

    return (
        <div
            className={styles.list}
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

            <div
                className={styles.tasks}
                ref={listRef}
                onDragOver={handleDragOverList} // Handle all drag geometry here
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
            >
                {/* Visual placeholder for empty lists to easy drop */}
                {localTasks.length === 0 && (
                    <div className="h-full min-h-[50px] flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg pointer-events-none">
                        Перетягніть сюди
                    </div>
                )}

                {localTasks.map((task, index) => (
                    <React.Fragment key={task.id}>
                        {insertIndex === index && <div className={styles.insertLine} />}
                        <div
                            draggable={!isBoardPublic}
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            // Removed individual onDragOver/onDrop
                            onDragEnd={handleDragEnd}
                            className={`${styles.taskWrapper} ${(draggingTaskId === task.id) ? styles.dragging : ""
                                }`}
                            onClick={() => !isBoardPublic && onSelectTask(task)}
                        >
                            <TaskItem isBoardPublic={isBoardPublic} boardTags={boardTags} users={users} task={task} />
                        </div>
                    </React.Fragment>
                ))}

                {/* Show insert line at the very bottom if index equals length */}
                {insertIndex === localTasks.length && <div className={styles.insertLine} />}
            </div>




            {!isBoardPublic && (
                <>
                    {!showCreateTask ? (
                        <Button color="tertiary" iconLeading={Plus}
                            onClick={() => {
                                setTaskName("")
                                setShowCreateTask(true)
                            }}
                        >
                            Додати задачу
                        </Button>
                    ) : (
                        <div>
                            <TextArea
                                autoFocus
                                placeholder="Введіть назву задачі..."
                                value={taskName}
                                onChange={(value) => setTaskName(value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && (e.preventDefault(), createTask())
                                }
                            />
                            <div className="flex gap-2 mt-2">
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









