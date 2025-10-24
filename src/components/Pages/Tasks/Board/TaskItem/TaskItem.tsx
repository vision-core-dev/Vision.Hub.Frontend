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
    // 🎯 Отримати повні теги
    const taskTags =
        task.tags && task.tags.length > 0
            ? boardTags.filter((t) => task.tags.includes(t.id))
            : [];

    // 👥 Отримати користувачів-асайнів
    const taskAssignees =
        task.assignees && task.assignees.length > 0
            ? users.filter((u) => task.assignees.includes(u.id))
            : [];

    return (
        <div className={styles.task}>
            {/* 🖼️ Банер */}
            {task.banner_url && (
                <div className={styles.banner}>
                    <img src={task.banner_url} alt="Banner" />
                </div>
            )}

            <div className={styles.content}>
                {/* 🏷️ Теги */}
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

                {/* 📋 Назва задачі */}
                <div className={styles.taskTitle}>
                    {task.status === "done" && (
                        <div className={styles.done}>
                            <Check strokeWidth={3} />
                        </div>
                    )}
                    <h3 className={styles.title}>{task.name}</h3>
                </div>

                {(task.deadline_at || task.started_at) && (
                    <div className={styles.deadline}>
                        {(task.deadline_at || task.started_at) && (
                            <>
                                <Clock /><span>{task.started_at && safeDate(task.started_at)} {(task.started_at && task.deadline_at) && "–"} {task.deadline_at && safeDate(task.deadline_at)}</span>
                            </>
                        )}
                    </div>
                )}

                {/* 👥 Виконавці */}
                {taskAssignees.length > 0 && (
                    <div className={styles.assignees}>
                        {taskAssignees.map((a) => (
                            <div key={a.id} className={styles.avatar}>
                                {a.avatar_url ? (
                                    <img src={a.avatar_url} alt={a.first_name} />
                                ) : (
                                    <span>
                                        {a.first_name[0]}
                                        {a.last_name ? a.last_name[0] : ""}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskItem;
