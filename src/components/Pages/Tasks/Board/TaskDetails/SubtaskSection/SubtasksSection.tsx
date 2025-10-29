import React, { useState, useEffect } from "react";
import styles from "./SubtasksSection.module.css";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import {api} from "../../../../../../utils/api.ts";
import Button from "../../../../../basic/Button/Button.tsx";

export interface Subtask {
    id: string;
    name: string;
    status: "no_status" | "in_progress" | "completed";
    deadline_at?: string | null;
}

interface Props {
    taskId: string;
}

const SubtasksSection: React.FC<Props> = ({ taskId }) => {
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newName, setNewName] = useState("");

    const fetchSubtasks = async () => {
        try {
            const res = await api.get(`/v1/Hub/Tasks/${taskId}/Subtasks`);
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
        try {
            const res = await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/Create`, {
                name: newName,
            });
            const data = await res.json();
            if (res.ok) {
                setSubtasks((prev) => [...prev, data]);
                setNewName("");
            }
        } catch (err) {
            console.error("❌ Не вдалося створити підзадачу:", err);
        }
    };

    const handleToggle = async (subtask: Subtask) => {
        const newStatus =
            subtask.status === "completed" ? "in_progress" : "completed";
        try {
            await api.post(`/v1/Hub/Subtasks/${subtask.id}/UpdateStatus`, {
                status: newStatus,
            });
            setSubtasks((prev) =>
                prev.map((s) =>
                    s.id === subtask.id ? { ...s, status: newStatus } : s
                )
            );
        } catch (err) {
            console.error("❌ Не вдалося оновити статус:", err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await api.post(`/v1/Hub/Subtasks/${id}/Delete`);
            if (res.ok) setSubtasks((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            console.error("❌ Не вдалося видалити:", err);
        }
    };

    return (
        <section className={styles.section}>
            <h3>Підзадачі</h3>
            <div className={styles.list}>

                {subtasks.map((s) => (
                    <div
                        key={s.id}
                        className={`${styles.item} ${
                            s.status === "completed" ? styles.completed : ""
                        }`}
                    >
                        <button onClick={() => handleToggle(s)} className={styles.statusBtn}>
                            {s.status === "completed" ? <CheckCircle2 /> : <Circle />}
                        </button>
                        <span className={styles.name}>{s.name}</span>
                        <button onClick={() => handleDelete(s.id)} className={styles.deleteBtn}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                <div className={styles.addRow}>
                    <Button variant="secondary"><Plus strokeWidth={2.25} /></Button>
                    <input
                        type="text"
                        value={newName}
                        placeholder="Нова підзадача..."
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                    <button onClick={handleAdd}>
                        <Plus size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SubtasksSection;
