import styles from "./TaskItem.module.css";
import {Check} from "lucide-react";

type TaskProps = {
    task: {
        id: string;
        title: string;
        description?: string;
        done: boolean;
    };
};

const TaskItem = ({ task }: TaskProps) => {
    return (
        <div className={`${styles.task}`}>
            <div className={styles.taskTitle}>
                {task.done && (
                    <div className={styles.done}><Check strokeWidth={3} /></div>
                )}
                <h3 className={styles.title}>{task.title}</h3>
            </div>
            {task.description && (
                <p className={styles.description}>{task.description}</p>
            )}
        </div>
    );
};

export default TaskItem;
