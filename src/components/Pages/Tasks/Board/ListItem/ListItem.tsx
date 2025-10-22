import styles from "./ListItem.module.css";
import TaskItem from "../TaskItem/TaskItem";
import { Plus, X } from "lucide-react";
import type { List } from "../BoardPage/BoardPage.tsx";
import Button from "../../../../basic/Button/Button.tsx";
import { useEffect, useRef, useState } from "react";

type ListProps = {
    list: List;
};

const ListItem = ({ list }: ListProps) => {
    const [showCreateTask, setShowCreateTask] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const createTask = async () => {
        // todo: логіка створення задачі
    };

    // 🧠 Обробка кліку поза елементом
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (showCreateTask && listRef.current && !listRef.current.contains(e.target as Node)) {
                setShowCreateTask(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showCreateTask]);

    return (
        <div
            className={styles.list}
            style={{ backgroundColor: list.color || "#fff" }}
            ref={listRef}
        >
            <div className={styles.header}>
                <h2 className={styles.title}>{list.name}</h2>
                <span className={styles.count}>{list.tasks.length}</span>
            </div>

            <div className={styles.tasks}>
                {list.tasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </div>

            {showCreateTask ? (
                <div className={styles.createTask}>
                    <textarea
                        autoFocus
                        placeholder="Введіть назву задачі..."
                        onClick={(e) => e.stopPropagation()} // 👈 щоб клік усередині не закривав
                    ></textarea>
                    <div>
                        <Button variant="primary" onClick={createTask}>
                            Додати задачу
                        </Button>
                        <Button variant="secondary" onClick={() => setShowCreateTask(false)}>
                            <X />
                        </Button>
                    </div>
                </div>
            ) : (
                <button className={styles.addTask} onClick={() => setShowCreateTask(true)}>
                    <Plus strokeWidth={2} size={16} /> Додати задачу
                </button>
            )}
        </div>
    );
};

export default ListItem;
