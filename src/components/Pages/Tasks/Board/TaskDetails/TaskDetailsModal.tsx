import React, {useEffect, useRef, useState} from "react";
import styles from "./TaskDetailsModal.module.css";
import {X, Image, Ellipsis, Archive, Link} from "lucide-react";
import Button from "../../../../basic/Button/Button.tsx";
import {api} from "../../../../../utils/api.ts";
import type {List} from "../BoardPage/BoardPage.tsx";
import LoaderDots from "../../../../basic/LoaderDots/LoaderDots.tsx";
import AssigneeSelector from "./AssigneeSelector/AssigneeSelector.tsx";
import TaskNameInput from "./TaskNameInput/TaskNameInput.tsx";
import TagSelector from "./TagSelector/TagSelector.tsx";
import TextEditor from "../../../../basic/TextEditor/TextEditor.tsx";
import AttachmentsSection, {type Attachment} from "./AttachmentsSection/AttachmentsSection.tsx";

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


const TaskDetailsModal: React.FC<Props> = ({ taskId, onClose, boardLists, boardTags }) => {
    const [task, setTask] = useState<TaskDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // 🧠 Фетч деталей задачі
    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/v1/Hub/Tasks/${taskId}/GetDetails`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to fetch task details");
            setTask(data.task || data);
        } finally {
            setLoading(false);
        }
    };

    // 🧹 Клік поза меню закриває його
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 📦 Архівування задачі
    const handleArchive = async () => {
        try {
            const res = await api.post(`/v1/Hub/Tasks/${taskId}/Archive`);
            if (res.ok) {
                onClose();
            } else {
                console.error("Не вдалося архівувати задачу");
            }
        } catch (err) {
            console.error("Помилка при архівуванні:", err);
        }
    };

    const handleNameChange = async (newName: string) => {
        setTask((prev) => (prev ? { ...prev, name: newName } : prev));
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/UpdateName`, {
                name: newName
            });
        } catch (err) {
            console.error("Не вдалося оновити назву:", err);
        }
    }

    // 🖼️ Завантаження або зміна банеру
    const handleBannerChange = async () => {
        try {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";

            input.onchange = async () => {
                const file = input.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("file", file);

                const res = await api.post(`/v1/Hub/Tasks/${taskId}/UploadBanner`, formData);
                const data = await res.json();

                if (res.ok && data.banner_url) {
                    // 🔄 оновлюємо локальний стан
                    setTask((prev) => prev ? { ...prev, banner_url: data.banner_url } : prev);
                } else {
                    console.error("Не вдалося завантажити банер:", data.detail || data);
                }
            };

            input.click();
        } catch (err) {
            console.error("Помилка при зміні банеру:", err);
        } finally {
            setShowMenu(false);
        }
    };

    // 🔗 Встановлення банеру за URL
    const handleBannerByUrl = async () => {
        try {
            const url = prompt("Введіть URL зображення банеру:");
            if (!url) return;

            const res = await api.post(`/v1/Hub/Tasks/${taskId}/SetBanner`, { banner_url: url });
            const data = await res.json();

            if (res.ok) {
                setTask((prev) => (prev ? { ...prev, banner_url: url } : prev));
            } else {
                console.error("Не вдалося встановити банер за URL:", data.detail || data);
            }
        } catch (err) {
            console.error("Помилка при встановленні банеру за URL:", err);
        } finally {
            setShowMenu(false);
        }
    };



    useEffect(() => {
        if (taskId) fetchTaskDetails();
    }, [taskId]);

    if (loading) {
        return (
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <LoaderDots />
                </div>
            </div>
        );
    }

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

                    <div className={styles.actions}>
                        <div className={styles.menuWrapper} ref={menuRef}>
                            <Button variant="secondary" onClick={() => setShowMenu((s) => !s)}>
                                <Ellipsis size={18} />
                            </Button>
                            {showMenu && (
                                <div className={styles.dropdownMenu}>

                                    <div className={styles.dropdownItem} onClick={handleBannerChange}>
                                        <Image size={16} />
                                        Загрузити банер
                                    </div>

                                    <div className={styles.dropdownItem} onClick={handleBannerByUrl}>
                                        <Link size={16} />
                                        Встановити банер
                                    </div>

                                    <div className={styles.dropdownItem} onClick={handleArchive}>
                                        <Archive size={16} />
                                        Архівувати задачу
                                    </div>

                                </div>
                            )}
                        </div>

                        <Button variant="secondary" onClick={onClose}>
                            <X size={18} />
                        </Button>
                    </div>
                </div>

                <div className={styles.content}>
                    <main>
                        <TaskNameInput value={task.name} onChange={handleNameChange} />

                        {/* 👥 Учасники */}
                        <section className={styles.infoItem}>
                            <h3>Учасники</h3>
                            <AssigneeSelector
                                taskId={task.id}
                                assignees={task.assignees}
                                onUpdate={(newAssignees) => setTask((prev) => prev ? { ...prev, assignees: newAssignees } : prev)}
                            />
                        </section>

                        {/* 🏷️ Мітки */}
                        <section className={styles.infoItem}>
                            <h3>Мітки</h3>
                            <TagSelector
                                taskId={task.id}
                                boardTags={boardTags}
                                selectedTags={task.tags}
                                onUpdate={(newTags) =>
                                    setTask((prev) => (prev ? { ...prev, tags: newTags } : prev))
                                }
                            />
                        </section>

                        {(task.started_at || task.deadline_at) && (
                            <section>
                                <div>
                                    <h3>Дата початку</h3>
                                    <input
                                        type="datetime-local"
                                        className={styles.dateInput}
                                        value={task.started_at ? task.started_at.split("T")[0] : ""}
                                        // onChange={(e) => handleDateChange("started_at", e.target.value)}
                                        // onBlur={handleDateBlur}
                                    />
                                </div>

                                {(task.started_at && task.deadline_at) && (
                                    "—"
                                )}

                                <div>
                                    <h3>Дедлайн</h3>
                                    <input
                                        type="datetime-local"
                                        className={styles.dateInput}
                                        value={task.deadline_at ? task.deadline_at.split("T")[0] : ""}
                                        // onChange={(e) => handleDateChange("deadline_at", e.target.value)}
                                        // onBlur={handleDateBlur}
                                    />
                                </div>
                            </section>
                        )}

                        <section className={styles.descriptionSection}>
                            <h3>Опис</h3>
                            <TextEditor
                                mode="edit"
                                value={task.description || ""}
                                onChange={async (newHtml) => {
                                    setTask((prev) => prev ? { ...prev, description: newHtml } : prev);
                                    // 💾 одразу відправляємо оновлення на бекенд
                                    try {
                                        await api.post(`/v1/Hub/Tasks/${task.id}/UpdateDescription`, {
                                            description: newHtml
                                        });
                                    } catch (err) {
                                        console.error("Не вдалося оновити опис:", err);
                                    }
                                }}
                                onUploadImage={async (file) => {
                                    // 🔄 логіка кастомного аплоаду (можеш винести в util)
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    const res = await api.post(`/v1/Hub/Tasks/${task.id}/UploadFileAttachment`, formData);
                                    const { url } = await res.json();
                                    // якщо потрібно вставити у текст:
                                    document.execCommand("insertHTML", false, `<img src="${url}" alt=""/>`);
                                }}
                            />
                        </section>

                        <AttachmentsSection
                            taskId={task.id}
                            attachments={task.attachments || []}
                            onChange={(newList) => {
                                setTask((prev) => (prev ? { ...prev, attachments: newList } : prev));
                                // додатково можна ще викликати бекенд, якщо потрібно синхронізувати
                                api.post(`/v1/Hub/Tasks/${task.id}/UpdateAttachments`, { attachments: newList });
                            }}
                        />

                    </main>

                    <aside>
                        {/* 💬 Коментарі */}
                        {/*{task.comments?.length > 0 && (*/}
                        {/*    <div className={styles.section}>*/}
                        {/*        <h3>Коментарі</h3>*/}
                        {/*        <div className={styles.comments}>*/}
                        {/*            {task.comments.map((c) => (*/}
                        {/*                <div key={c.id} className={styles.comment}>*/}
                        {/*                    <img*/}
                        {/*                        src={c.user.avatar_url || "/default-avatar.png"}*/}
                        {/*                        alt={c.user.first_name}*/}
                        {/*                    />*/}
                        {/*                    <div>*/}
                        {/*                        <div className={styles.commentHeader}>*/}
                        {/*                            <strong>{c.user.first_name}</strong>*/}
                        {/*                            <span>*/}
                        {/*                            {new Date(c.created_at).toLocaleString("uk-UA")}*/}
                        {/*                        </span>*/}
                        {/*                        </div>*/}
                        {/*                        <div*/}
                        {/*                            className={styles.commentContent}*/}
                        {/*                            dangerouslySetInnerHTML={{__html: c.content}}*/}
                        {/*                        />*/}
                        {/*                    </div>*/}
                        {/*                </div>*/}
                        {/*            ))}*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </aside>
                </div>
            </div>
            <div className={styles.backdrop} onClick={onClose}></div>
        </div>
    );
};

export default TaskDetailsModal;
