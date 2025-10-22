import React from "react";
import styles from "./TaskDetailsModal.module.css";
import { X, Link as LinkIcon, Paperclip } from "lucide-react";
import Button from "../../../../basic/Button/Button.tsx";

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
    created_by: User;
    created_at: string;
}

interface Props {
    task: TaskDetails;
    onClose: () => void;
}

const TaskDetailsModal: React.FC<Props> = ({ task, onClose }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={`${styles.header} ${task.banner_url ? styles.banner : ""}`} style={{ backgroundImage: `url(${task.banner_url})` }}>
                    <h2>{task.name}</h2>
                    <Button variant="secondary" onClick={onClose}>
                        <X size={18} />
                    </Button>
                </div>

                {/*{task.banner_url && (*/}
                {/*    <div className={styles.banner}>*/}
                {/*        <img src={task.banner_url} alt="Banner" />*/}
                {/*    </div>*/}
                {/*)}*/}

                <div className={styles.content}>
                    {/* 🏷️ Теги */}
                    <div className={styles.tags}>
                        {task.tags.map((tag) => (
                            <span
                                key={tag.id}
                                className={styles.tag}
                                style={{ backgroundColor: tag.color }}
                            >
                {tag.name}
              </span>
                        ))}
                    </div>

                    {/* 👥 Виконавці */}
                    <div className={styles.assignees}>
                        {task.assignees.map((a) => (
                            <div key={a.id} className={styles.assignee}>
                                <img src={a.avatar_url} alt={a.first_name} />
                                <span>{a.first_name}</span>
                            </div>
                        ))}
                    </div>

                    {/* 📄 Опис */}
                    <div className={styles.section}>
                        <h3>Опис</h3>
                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: task.description }}
                        />
                    </div>

                    {/* 📎 Вкладення */}
                    {task.attachments.length > 0 && (
                        <div className={styles.section}>
                            <h3>Вкладення</h3>
                            <div className={styles.attachments}>
                                {task.attachments.map((att) => (
                                    <a
                                        key={att.id}
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.attachment}
                                    >
                                        {att.type === "link" ? (
                                            <LinkIcon size={16} />
                                        ) : (
                                            <Paperclip size={16} />
                                        )}
                                        <span>{att.name || att.url}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 💬 Коментарі */}
                    <div className={styles.section}>
                        <h3>Коментарі</h3>
                        <div className={styles.comments}>
                            {task.comments.map((c) => (
                                <div key={c.id} className={styles.comment}>
                                    <img src={c.user.avatar_url} alt={c.user.name} />
                                    <div>
                                        <div className={styles.commentHeader}>
                                            <strong>{c.user.name}</strong>
                                            <span>
                        {new Date(c.created_at).toLocaleString("uk-UA")}
                      </span>
                                        </div>
                                        <div
                                            className={styles.commentContent}
                                            dangerouslySetInnerHTML={{ __html: c.content }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.backdrop} onClick={onClose}></div>
        </div>
    );
};

export default TaskDetailsModal;
