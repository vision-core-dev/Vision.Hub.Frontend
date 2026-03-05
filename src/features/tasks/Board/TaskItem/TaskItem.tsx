import styles from "./TaskItem.module.css";
import { Check, Clock, SquareCheckBig } from "lucide-react";
import type { Task, TaskTag } from "../BoardPage/BoardPage.tsx";
import { getTextColor } from "@/shared/utils/colors.ts";
import type { UserType } from "@/shared/types/Users.ts";
import { safeDate } from "@/shared/utils/safeDate.ts";

type TaskProps = {
    isBoardPublic: boolean;
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
    const isOverdue = !isDone && task.deadline_at && new Date(task.deadline_at) < new Date();
    const isToday = !isDone && task.deadline_at &&
        new Date(task.deadline_at).toDateString() === new Date().toDateString();


    return (
        <div className={`${styles.task} 
            ${(isDone && task.banner_url) ? styles.doneTask : ""}
            ${isOverdue ? styles.overdue : ""}
            ${isToday ? styles.today : ""}
            ${styles.point}
        `}>
            {task.banner_url ? (
                <div className={`${styles.banner} ${isDone ? styles.bannerDone : ""}`}>
                    <img src={task.banner_url} alt="Banner" draggable={false} />
                    {isDone && (
                        <div className={styles.doneOverlay}>
                            <div className={styles.doneIcon}>
                                <Check strokeWidth={3} />
                            </div>
                            <h3 className={styles.doneTitle}>{task.name}</h3>
                        </div>
                    )}
                </div>
            ) : (
                isDone ? (
                    <div className={styles.doneContent}>
                        <div className={styles.doneIcon}>
                            <Check strokeWidth={3} />
                        </div>
                        <h3 className={styles.doneTitleNoImage}>{task.name}</h3>
                    </div>
                ) : null
            )}

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

                    {(task.deadline_at || task.started_at || (task.subtasks_total && task.subtasks_total > 0)) ? (
                        <div className={styles.miniDetails}>
                            {(task.deadline_at || task.started_at) && (
                                <div className={styles.deadline}>
                                    <Clock />
                                    <span>
                                        {task.started_at && safeDate(task.started_at)}
                                        {task.started_at && task.deadline_at ? " – " : ""}
                                        {task.deadline_at && safeDate(task.deadline_at)}
                                    </span>
                                </div>
                            )}

                            {(task.subtasks_total && task.subtasks_total > 0) ? (
                                <div className={styles.deadline}>
                                    <SquareCheckBig /><span>{task.subtasks_completed || 0}/{task.subtasks_total || 0}</span>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {taskAssignees.length > 0 && (
                        <div className={styles.assignees}>
                            {taskAssignees.map((a) => (
                                <div key={a.id} className={styles.avatar}>
                                    {a.avatar_url ? (
                                        <img src={a.avatar_url} draggable={false} />
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









