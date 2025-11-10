import React, { useState, useEffect } from "react";
import styles from "./SubtasksSection.module.css";
import {Check, Circle, Ellipsis, Plus, Trash2} from "lucide-react";
import { api } from "../../../../../../utils/api.ts";
import Button from "../../../../../basic/Button/Button.tsx";
import type { UserType } from "../../../../../../types/Users.ts";
import Input from "../../../../../basic/Input/Input.tsx";
import DropdownMenu from "../../../../../basic/DropdownMenu/DropdownMenu.tsx";

export interface Subtask {
    id: string;
    name: string;
    status: "no_status" | "in_progress" | "completed";
    assignee_id?: string | null;
    deadline_at?: string | null;
}

interface Props {
    taskId: string;
    users: UserType[];
    initialSubtasks?: Subtask[];
}

const SubtasksSection: React.FC<Props> = ({ taskId, initialSubtasks }) => {
    const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks ?? []);
    const [newName, setNewName] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState("");

    const completedCount = subtasks.filter((s) => s.status === "completed").length;
    const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

    const fetchSubtasks = async () => {
        // 🔥 Якщо initialSubtasks є — то не фетчимо
        if (initialSubtasks && initialSubtasks.length > 0) return;

        try {
            const res = await api.get(`/v1/Hub/Tasks/${taskId}/Subtasks/Get`);
            const data = await res.json();
            if (res.ok) setSubtasks(data);
        } catch (err) {
            console.error("❌ Не вдалося отримати підзадачі:", err);
        }
    };

    useEffect(() => {
        fetchSubtasks();
    }, [taskId]);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        const res = await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/Create`, { name: newName });
        const data = await res.json();
        if (res.ok) {
            setSubtasks((prev) => [...prev, data]);
            setNewName("");
        }
    };

    const handleToggle = async (subtask: Subtask) => {
        const newStatus = subtask.status === "completed" ? "in_progress" : "completed";
        await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/${subtask.id}/SetCompleted`, { is_completed: newStatus === "completed" });
        setSubtasks((prev) => prev.map((s) => (s.id === subtask.id ? { ...s, status: newStatus } : s)));
    };

    const handleRename = async (id: string) => {
        const name = editingValue.trim();
        setEditingId(null);
        if (!name) return;
        await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/${id}/Rename`, { "new_name": name });
        setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
    };

    // const handleUpdateDeadline = async (id: string, deadline_at: string) => {
    //     await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/${id}/UpdateDeadline`, { deadline_at });
    //     setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, deadline_at } : s)));
    // };

    const handleDelete = async (id: string) => {
        await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/${id}/Delete`);
        setSubtasks((prev) => prev.filter((s) => s.id !== id));
    };

    return (
        <section className={styles.section}>
            <h3>Підзадачі</h3>

            {subtasks.length > 0 && (
                <div className={styles.progressContainer}>
                    <div className={styles.progressText}>{progress}%</div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            <div className={styles.list}>
                {subtasks.map((s) => (
                    <label key={s.id} className={styles.item}>
                        <div
                            className={styles.checkbox}
                            // checked={s.status === "completed"}
                            onClick={() => handleToggle(s)}
                        >
                            {s.status === "completed" ? (
                                <div className={styles.done}>
                                    <Check strokeWidth={3} />
                                </div>
                            ) : (
                                <Circle size={20} color="#9ca3af" className={styles.uncheckedIcon} />
                            )}
                        </div>

                        {editingId === s.id ? (
                            <input
                                className={styles.editInput}
                                value={editingValue}
                                autoFocus
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={() => handleRename(s.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRename(s.id);
                                    if (e.key === "Escape") setEditingId(null);
                                }}
                            />
                        ) : (
                            <span
                                className={`${styles.name} ${s.status === "completed" ? styles.completedText : ""}`}
                                onClick={() => {
                                    setEditingId(s.id);
                                    setEditingValue(s.name);
                                }}
                            >
                                {s.name}
                            </span>
                        )}

                        <DropdownMenu
                            trigger={
                                <div className={styles.menuTrigger}>
                                    <Ellipsis size={20} />
                                </div>
                            }
                            items={[
                                // {
                                //     label: "Призначити виконавця",
                                //     icon: <UserRound size={16} />,
                                //     onClick: () => alert("TODO: модалка виконавця"),
                                // },
                                // {
                                //     label: "Призначити дедлайн",
                                //     icon: <Calendar size={16} />,
                                //     onClick: () => {
                                //         const date = prompt("Введи дату (YYYY-MM-DD):", "");
                                //         if (date) handleUpdateDeadline(s.id, date);
                                //     },
                                // },
                                {
                                    label: "Видалити",
                                    icon: <Trash2 size={16} />,
                                    danger: true,
                                    onClick: () => handleDelete(s.id),
                                }
                            ]}
                        />
                    </label>
                ))}

                <div className={styles.addRow}>
                    <Input
                        type="text"
                        value={newName}
                        placeholder="Нова підзадача..."
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                    <Button variant="secondary" onClick={handleAdd}>
                        <Plus strokeWidth={2.25} />
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default SubtasksSection;
