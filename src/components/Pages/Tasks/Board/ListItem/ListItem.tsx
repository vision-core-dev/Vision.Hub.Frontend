import styles from "./ListItem.module.css";
import TaskItem from "../TaskItem/TaskItem";
import {Plus} from "lucide-react";

type Task = {
    id: string;
    title: string;
    description?: string;
    done: boolean;
};

type ListProps = {
    list: {
        id: string;
        name: string;
        tasks: Task[];
    };
};

const ListItem = ({ list }: ListProps) => {
    return (
        <div className={styles.list}>
            <div className={styles.header}>
                <h2 className={styles.title}>{list.name}</h2>
                <span className={styles.count}>{list.tasks.length}</span>
            </div>

            <div className={styles.tasks}>
                {list.tasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </div>

            <button className={styles.addTask}><Plus strokeWidth={2} size={16} /> Додати задачу</button>
        </div>
    );
};

export default ListItem;
