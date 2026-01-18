import React, { useState, useEffect } from "react";
import styles from "./SubtasksSection.module.css";
import { Check, Ellipsis, Plus, Trash2, Calendar as CalendarIcon, UserRound, X } from "lucide-react";
import { api } from "@/shared/utils/api.ts";
import type { UserType } from "@/shared/types/Users.ts";
import DropdownMenu from "@/shared/ui/dropdown-menu/DropdownMenu.tsx";
import { Input } from "@/shared/ui/input/input.tsx";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { ProgressBar } from "@/shared/ui/progress-indicators/progress-indicators.tsx";
import { Avatar } from "@/shared/ui/avatar/avatar.tsx";
import { Dropdown } from "@/shared/ui/dropdown/dropdown.tsx";
import { DatePicker } from "@/shared/components/date-picker/date-picker.tsx";
import { dateValueToLocalString, isoToDateValue } from "@/shared/utils/date.ts";
import { getLocalTimeZone, today } from "@internationalized/date";

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

const SubtasksSection: React.FC<Props> = ({ taskId, initialSubtasks, users: initialUsers }) => {
    const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks ?? []);
    const [users, setUsers] = useState<UserType[]>(initialUsers ?? []);
    const [newName, setNewName] = useState("");

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState("");
    const [userSearch, setUserSearch] = useState("");

    const completedCount = subtasks.filter((s) => s.status === "completed").length;
    const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

    useEffect(() => {
        if (!initialSubtasks) {
            fetchSubtasks();
        }
    }, [taskId]);

    /* Fetch users if they weren't passed (and we need them for assignment) */
    useEffect(() => {
        if ((!initialUsers || initialUsers.length === 0) && users.length === 0) {
            api.get("/v1/Hub/Users/List?only_active=true")
                .then((r) => r.json())
                .then((d) => setUsers(d.list || []));
        } else if (initialUsers && initialUsers.length > 0) {
            setUsers(initialUsers);
        }
    }, [initialUsers]);

    const fetchSubtasks = async () => {
        try {
            const res = await api.get(`/v1/Hub/Tasks/${taskId}/Subtasks/Get`);
            const data = await res.json();
            if (res.ok) setSubtasks(data);
        } catch (err) {
            console.error("❌ Не вдалося отримати підзадачі:", err);
        }
    };

    /* ACTIONS */
    const handleAdd = async () => {
        if (!newName.trim() || isAdding) return;
        setIsAdding(true);
        try {
            const res = await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/Create`, { name: newName });
            const data = await res.json();
            if (res.ok) {
                setSubtasks((prev) => [...prev, data]);
                setNewName("");
            }
        } catch (err) {
            console.error("❌ Не вдалося додати підзадачу:", err);
        }
        setIsAdding(false);
    };

    const handleToggle = async (subtask: Subtask) => {
        const newStatus = subtask.status === "completed" ? "in_progress" : "completed";
        // Optimistic
        setSubtasks((prev) => prev.map((s) => (s.id === subtask.id ? { ...s, status: newStatus } : s)));

        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/${subtask.id}/SetCompleted`, { is_completed: newStatus === "completed" });
        } catch {
            // Rollback
            setSubtasks((prev) => prev.map((s) => (s.id === subtask.id ? { ...s, status: subtask.status } : s)));
        }
    };

    const handleRename = async (id: string) => {
        const name = editingValue.trim();
        setEditingId(null);
        if (!name) return;
        // Optimistic
        const oldName = subtasks.find(s => s.id === id)?.name;
        setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));

        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/${id}/Rename`, { "new_name": name });
        } catch {
            setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, name: oldName || "" } : s)));
        }
    };

    const handleDelete = async (id: string) => {
        // Optimistic
        const oldSubtasks = [...subtasks];
        setSubtasks((prev) => prev.filter((s) => s.id !== id));

        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/${id}/Delete`);
        } catch {
            setSubtasks(oldSubtasks);
        }
    };

    const handleAssign = async (subtaskId: string, userId: string) => {
        setSubtasks((prev) => prev.map(s => s.id === subtaskId ? { ...s, assignee_id: userId } : s));
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/${subtaskId}/AssignUser`, { user_id: userId });
        } catch (e) {
            console.error("Failed to assign user", e);
        }
    };

    const handleUnassign = async (subtaskId: string) => {
        setSubtasks((prev) => prev.map(s => s.id === subtaskId ? { ...s, assignee_id: null } : s));
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/${subtaskId}/UnassignUser`);
        } catch (e) {
            console.error("Failed to unassign user", e);
        }
    };

    const handleSetDeadline = async (subtaskId: string, date: string | null) => {
        setSubtasks((prev) => prev.map(s => s.id === subtaskId ? { ...s, deadline_at: date } : s));
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/Subtasks/${subtaskId}/UpdateDeadline`, { deadline_at: date });
        } catch (e) {
            console.error("Failed to set deadline", e);
        }
    };

    /* HELPERS */
    const getAssignee = (id?: string | null) => users.find(u => u.id === id);

    const filteredUsers = users.filter(u =>
        u.first_name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <section className={styles.section}>
            <h3>Підзадачі</h3>

            {subtasks.length > 0 && (
                <ProgressBar labelPosition="right" min={0} max={100} value={progress} />
            )}

            <div className={styles.list}>
                {subtasks.map((s) => {
                    const assignee = getAssignee(s.assignee_id);
                    const deadline = s.deadline_at ? isoToDateValue(s.deadline_at) : null;
                    const isOverdue = deadline && today(getLocalTimeZone()).compare(deadline) > 0 && s.status !== "completed";

                    return (
                        <div key={s.id} className={styles.item}>
                            <div
                                className={`${styles.checkbox} ${s.status === "completed" ? styles.checked : ""}`}
                                onClick={() => handleToggle(s)}
                            >
                                {s.status === "completed" && <Check className={styles.checkboxIcon} strokeWidth={3} />}
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

                            <div className={`${styles.actions} ${(assignee || deadline) ? styles.hasActive : ""}`}>
                                {/* ASSIGNEE */}
                                <Dropdown.Root>
                                    <div
                                        className={`${styles.actionTrigger} ${assignee ? styles.assigneeAvatar : ""}`}
                                        title={assignee ? `${assignee.first_name} ${assignee.last_name || ""}` : "Призначити виконавця"}
                                    >
                                        {assignee ? (
                                            <Avatar
                                                size="sm"
                                                src={assignee.avatar_url}
                                                initials={(assignee.first_name[0] || "") + (assignee.last_name?.[0] || "")}
                                            />
                                        ) : (
                                            <UserRound size={16} />
                                        )}
                                    </div>
                                    <Dropdown.Popover className={styles.dropdownPopover}>
                                        <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                                            <Input
                                                size="sm"
                                                placeholder="Пошук..."
                                                value={userSearch}
                                                onChange={(v) => setUserSearch(v as string)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className={styles.userList}>
                                            {s.assignee_id && (
                                                <div className={styles.userOption} onClick={() => handleUnassign(s.id)}>
                                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-500">
                                                        <X size={14} />
                                                    </div>
                                                    <span className="text-sm text-red-500">Зняти виконавця</span>
                                                </div>
                                            )}
                                            {filteredUsers.map(u => (
                                                <div key={u.id} className={styles.userOption} onClick={() => handleAssign(s.id, u.id)}>
                                                    <Avatar
                                                        size="xs"
                                                        src={u.avatar_url}
                                                        initials={(u.first_name[0] || "") + (u.last_name?.[0] || "")}
                                                    />
                                                    <span className="text-sm truncate">{u.first_name} {u.last_name}</span>
                                                    {s.assignee_id === u.id && <Check size={14} className="ml-auto text-primary" />}
                                                </div>
                                            ))}
                                        </div>
                                    </Dropdown.Popover>
                                </Dropdown.Root>

                                {/* DEADLINE */}
                                <DatePicker
                                    value={deadline}
                                    onChange={() => { }}
                                    onApply={(date) => handleSetDeadline(s.id, dateValueToLocalString(date))}
                                >
                                    <div
                                        className={`${styles.dateBadge} ${isOverdue ? styles.overdue : ""}`}
                                        title={deadline ? "Змінити дедлайн" : "Встановити дедлайн"}
                                    >
                                        <CalendarIcon size={14} />
                                        {deadline && <span>{dateValueToLocalString(deadline)?.slice(0, 10)}</span>}
                                    </div>
                                </DatePicker>

                                {/* EXTENDED MENU */}
                                <DropdownMenu
                                    trigger={
                                        <div className={styles.actionTrigger}>
                                            <Ellipsis size={16} />
                                        </div>
                                    }
                                    items={[
                                        {
                                            label: "Видалити",
                                            icon: <Trash2 size={16} />,
                                            danger: true,
                                            onClick: () => handleDelete(s.id),
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                    );
                })}

                <div className={styles.addRow}>
                    <Input
                        size="sm"
                        type="text"
                        value={newName}
                        placeholder="Нова підзадача..."
                        onChange={(value) => setNewName(value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        isDisabled={isAdding}
                    />
                    <Button onClick={handleAdd} disabled={isAdding} iconLeading={Plus} />
                </div>
            </div>
        </section>
    );
};

export default SubtasksSection;









