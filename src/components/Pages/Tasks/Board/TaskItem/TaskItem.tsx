import styles from "./TaskItem.module.css";
import {Check, Clock} from "lucide-react";
import type { Task, TaskTag } from "../BoardPage/BoardPage.tsx";
import { getTextColor } from "../../../../../utils/colors.ts";
import type { UserType } from "../../../../../types/Users.ts";
import {safeDate} from "../../../../../utils/safeDate.ts";

type TaskProps = {
    task: Task;
    boardTags: TaskTag[];
    users: UserType[];
};

const TaskItem = ({ task, boardTags, users }: TaskProps) => {
    const taskTags =
        task.tags && task.tags.length > 0
            ? boardTags.filter((t) => task.tags.includes(t.id))
            : [];

    const taskAssignees =
        task.assignees && task.assignees.length > 0
            ? users.filter((u) => task.assignees.includes(u.id))
            : [];

    const isDone = task.status === "done";

    return (
        <div className={`${styles.task} ${isDone ? styles.doneTask : ""}`}>

            {/* 🖼️ Банер */}
            {task.banner_url && (
                <div className={`${styles.banner} ${isDone ? styles.bannerDone : ""}`}>
                    <img src={task.banner_url} alt="Banner" />

                    {/* ✅ Готова задача — показати темну підкладку і текст */}
                    {isDone && (
                        <div className={styles.doneOverlay}>
                            <div className={styles.doneIcon}>
                                <Check strokeWidth={3} />
                            </div>
                            <h3 className={styles.doneTitle}>{task.name}</h3>
                        </div>
                    )}
                </div>
            )}

            {/* Якщо задача НЕ готова — показуємо інфо */}
            {!isDone && (
                <div className={styles.content}>
                    {taskTags.length > 0 && (
                        <div className={styles.tags}>
                            {taskTags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className={styles.tag}
                                    style={{
                                        backgroundColor: tag.color,
                                        color: getTextColor(tag.color),
                                    }}
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className={styles.taskTitle}>
                        <h3 className={styles.title}>{task.name}</h3>
                    </div>

                    {(task.deadline_at || task.started_at) && (
                        <div className={styles.deadline}>
                            <Clock /><span>{safeDate(task.deadline_at)}</span>
                        </div>
                    )}

                    {taskAssignees.length > 0 && (
                        <div className={styles.assignees}>
                            {taskAssignees.map((a) => (
                                <div key={a.id} className={styles.avatar}>
                                    {a.avatar_url ? (
                                        <img src={a.avatar_url} />
                                    ) : (
                                        <span>{a.first_name[0]}{a.last_name?.[0]}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskItem;
