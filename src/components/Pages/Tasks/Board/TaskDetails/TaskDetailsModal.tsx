import React, {useEffect, useState} from "react";
import styles from "./TaskDetailsModal.module.css";
import {X, Paperclip, Ellipsis} from "lucide-react";
import Button from "../../../../basic/Button/Button.tsx";
import {api} from "../../../../../utils/api.ts";
import type {List} from "../BoardPage/BoardPage.tsx";
import LoaderDots from "../../../../basic/LoaderDots/LoaderDots.tsx";
import AssigneeSelector from "./AssigneeSelector/AssigneeSelector.tsx";
import TaskNameInput from "./TaskNameInput/TaskNameInput.tsx";
import TagSelector from "./TagSelector/TagSelector.tsx";

interface User {
    id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
}

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface Attachment {
    id: string;
    type: "file" | "link";
    url: string;
    name?: string;
}

interface Comment {
    id: string;
    user: User;
    content: string;
    created_at: string;
}

export interface TaskDetails {
    id: string;
    name: string;
    description: string;
    banner_url?: string;
    tags: Tag[];
    assignees: User[];
    attachments: Attachment[];
    comments: Comment[];
    started_at?: string | null;
    deadline_at?: string | null;
    created_by: User;
    created_at: string;
}

interface Props {
    taskId: string,
    boardTags: Tag[],
    boardLists: List[],
    onClose: () => void,
}

const TaskDetailsModal: React.FC<Props> = ({taskId, onClose, boardLists, boardTags}) => {
    const [task, setTask] = useState<TaskDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);

    // 🧠 Фетч деталей задачі
    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/v1/Hub/Tasks/${taskId}/GetDetails`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || "Failed to fetch task details");
            }
            setTask(data.task || data); // залежно від формату
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (field: "started_at" | "deadline_at", value: string) => {
        // лише оновлюємо локально
        const isoValue = value ? new Date(value).toISOString() : null;
        setTask((prev) => (prev ? { ...prev, [field]: isoValue } : prev));
    };

    const handleDateBlur = async () => {
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/UpdateDates`, {
                started_at: task?.started_at,
                deadline_at: task?.deadline_at,
            });
        } catch (e) {
            console.error("Failed to update date", e);
        }
    };



    useEffect(() => {
        if (taskId) fetchTaskDetails();
    }, [taskId]);

    // 🌀 Стан завантаження
    if (loading) {
        return (
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <LoaderDots />
                </div>
            </div>
        );
    }

    // ⚠️ Помилка
    if (error || !task) {
        return (
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.error}>{error || "Помилка завантаження"}</div>
                </div>
                <div className={styles.backdrop} onClick={onClose}></div>
            </div>
        );
    }

    // ✅ Основний вміст
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div
                    className={`${styles.header} ${task.banner_url ? styles.banner : ""}`}
                    style={{backgroundImage: task.banner_url ? `url(${task.banner_url})` : "none"}}
                >
                    <select className={styles.taskListSelect} defaultValue={boardLists.find(l => l.tasks?.some(t => t.id === task.id))?.id}>
                        {boardLists.map((list) => (
                            <option key={list.id} value={list.id}>{list.name}</option>
                        ))}
                    </select>

                    <div>
                        <Button variant="secondary" onClick={onClose}>
                            <Ellipsis size={18} />
                        </Button>
                        <Button variant="secondary" onClick={onClose}>
                            <X size={18}/>
                        </Button>
                    </div>
                </div>

                <div className={styles.content}>
                    <main>
                        <TaskNameInput value={task.name} />

                        <section className={styles.changeInfo}>
                            {/* 👥 Учасники */}
                            <div>
                                <h3>Учасники</h3>
                                <AssigneeSelector
                                    taskId={task.id}
                                    assignees={task.assignees}
                                    onUpdate={(newAssignees) => setTask((prev) => prev ? { ...prev, assignees: newAssignees } : prev)}
                                />
                            </div>

                            {/* 🏷️ Мітки */}
                            <div>
                                <h3>Мітки</h3>
                                <TagSelector
                                    taskId={task.id}
                                    boardTags={boardTags}
                                    selectedTags={task.tags}
                                    onUpdate={(newTags) =>
                                        setTask((prev) => (prev ? { ...prev, tags: newTags } : prev))
                                    }
                                />
                            </div>

                            <div>
                                <h3>Дата початку</h3>
                                <input
                                    type="datetime-local"
                                    className={styles.dateInput}
                                    value={task.started_at ? task.started_at.split("T")[0] : ""}
                                    onChange={(e) => handleDateChange("started_at", e.target.value)}
                                    onBlur={handleDateBlur}
                                />
                            </div>

                            <div>
                                <h3>Дедлайн</h3>
                                <input
                                    type="datetime-local"
                                    className={styles.dateInput}
                                    value={task.deadline_at ? task.deadline_at.split("T")[0] : ""}
                                    onChange={(e) => handleDateChange("deadline_at", e.target.value)}
                                    onBlur={handleDateBlur}
                                />
                            </div>


                        </section>


                        <section className={styles.attachments}>
                            <header>
                                <div><Paperclip /><h3>Вкладення</h3></div>
                                <Button variant="secondary">Додати</Button>
                            </header>
                            <div>
                                <div className={styles.attachmentsDiv}>
                                    <h3>Посилання</h3>
                                </div>
                                <div className={styles.attachmentsDiv}>
                                    <h3>Файли</h3>
                                </div>
                            </div>
                        </section>

                        {/*/!* 🏷️ Теги *!/*/}
                        {/*{task.tags?.length > 0 && (*/}
                        {/*    <section className={styles.tags}>*/}
                        {/*        {task.tags.map((tag) => (*/}
                        {/*            <span*/}
                        {/*                key={tag.id}*/}
                        {/*                className={styles.tag}*/}
                        {/*                style={{backgroundColor: tag.color}}*/}
                        {/*            >*/}
                        {/*            {tag.name}*/}
                        {/*        </span>*/}
                        {/*        ))}*/}
                        {/*    </section>*/}
                        {/*)}*/}

                        {/*/!* 👥 Виконавці *!/*/}
                        {/*{task.assignees?.length > 0 && (*/}
                        {/*    <div className={styles.assignees}>*/}
                        {/*        {task.assignees.map((a) => (*/}
                        {/*            <div key={a.id} className={styles.assignee}>*/}
                        {/*                <img*/}
                        {/*                    src={a.avatar_url || "/default-avatar.png"}*/}
                        {/*                    alt={a.first_name}*/}
                        {/*                />*/}
                        {/*                <span>{a.first_name}</span>*/}
                        {/*            </div>*/}
                        {/*        ))}*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/*/!* 📄 Опис *!/*/}
                        {/*{task.description && (*/}
                        {/*    <div className={styles.section}>*/}
                        {/*        <h3>Опис</h3>*/}
                        {/*        <div*/}
                        {/*            className={styles.description}*/}
                        {/*            dangerouslySetInnerHTML={{__html: task.description}}*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/*/!* 📎 Вкладення *!/*/}
                        {/*{task.attachments?.length > 0 && (*/}
                        {/*    <div className={styles.section}>*/}
                        {/*        <h3>Вкладення</h3>*/}
                        {/*        <div className={styles.attachments}>*/}
                        {/*            {task.attachments.map((att) => (*/}
                        {/*                <a*/}
                        {/*                    key={att.id}*/}
                        {/*                    href={att.url}*/}
                        {/*                    target="_blank"*/}
                        {/*                    rel="noopener noreferrer"*/}
                        {/*                    className={styles.attachment}*/}
                        {/*                >*/}
                        {/*                    {att.type === "link" ? (*/}
                        {/*                        <LinkIcon size={16}/>*/}
                        {/*                    ) : (*/}
                        {/*                        <Paperclip size={16}/>*/}
                        {/*                    )}*/}
                        {/*                    <span>{att.name || att.url}</span>*/}
                        {/*                </a>*/}
                        {/*            ))}*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </main>

                    <aside>
                        {/* 💬 Коментарі */}
                        {task.comments?.length > 0 && (
                            <div className={styles.section}>
                                <h3>Коментарі</h3>
                                <div className={styles.comments}>
                                    {task.comments.map((c) => (
                                        <div key={c.id} className={styles.comment}>
                                            <img
                                                src={c.user.avatar_url || "/default-avatar.png"}
                                                alt={c.user.first_name}
                                            />
                                            <div>
                                                <div className={styles.commentHeader}>
                                                    <strong>{c.user.first_name}</strong>
                                                    <span>
                                                    {new Date(c.created_at).toLocaleString("uk-UA")}
                                                </span>
                                                </div>
                                                <div
                                                    className={styles.commentContent}
                                                    dangerouslySetInnerHTML={{__html: c.content}}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
            <div className={styles.backdrop} onClick={onClose}></div>
        </div>
    );
};

export default TaskDetailsModal;
