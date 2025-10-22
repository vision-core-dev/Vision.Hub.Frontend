import styles from "./TaskItem.module.css";
import {Check} from "lucide-react";
import type {Task} from "../BoardPage/BoardPage.tsx";


type TaskProps = {
    task: Task;
};

const TaskItem = ({ task }: TaskProps) => {
    return (
        <div className={`${styles.task}`}>
            <div className={styles.taskTitle}>
                {task.status === "done" && (
                    <div className={styles.done}><Check strokeWidth={3} /></div>
                )}
                <h3 className={styles.title}>{task.name}</h3>
            </div>
            {/*{task.description && (*/}
            {/*    <p className={styles.description}>{task.description}</p>*/}
            {/*)}*/}
        </div>
    );
};

export default TaskItem;
