import { useEffect, useState } from "react";
import styles from "./BoardPage.module.css";
import ListItem from "../ListItem/ListItem";
import { useParams } from "react-router-dom";

type Task = {
    id: string;
    title: string;
    description?: string;
    done: boolean;
};

type List = {
    id: string;
    name: string;
    tasks: Task[];
};

const BoardPage = () => {
    const { boardId } = useParams();
    const [lists, setLists] = useState<List[]>([]);

    useEffect(() => {
        // 🧪 тимчасово: даммі-дані списків і задач
        setLists([
            {
                id: "todo",
                name: "📌 To Do",
                tasks: [
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                ],
            },
            {
                id: "inprogress",
                name: "🚧 В процесі",
                tasks: [
                    { id: "t3", title: "Розробити авторизацію", done: false },
                ],
            },
            {
                id: "done",
                name: "✅ Готово",
                tasks: [
                    { id: "t4", title: "Створити базу даних", done: true },
                ],
            },
            {
                id: "todo",
                name: "📌 To Do",
                tasks: [
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                ],
            },
            {
                id: "inprogress",
                name: "🚧 В процесі",
                tasks: [
                    { id: "t3", title: "Розробити авторизацію", done: false },
                ],
            },
            {
                id: "done",
                name: "✅ Готово",
                tasks: [
                    { id: "t4", title: "Створити базу даних", done: true },
                ],
            },
            {
                id: "todo",
                name: "📌 To Do",
                tasks: [
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                    { id: "t1", title: "Створити дизайн інтерфейсу", done: false },
                    { id: "t2", title: "Підключити бекенд", done: false },
                ],
            },
            {
                id: "inprogress",
                name: "🚧 В процесі",
                tasks: [
                    { id: "t3", title: "Розробити авторизацію", done: false },
                ],
            },
            {
                id: "done",
                name: "✅ Готово",
                tasks: [
                    { id: "t4", title: "Створити базу даних", done: true },
                ],
            },
        ]);
    }, [boardId]);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>📋 Канбан дошка</h1>
                <div className={styles.extraActions}>
                    <button>
                        Додати список
                    </button>
                </div>
            </div>
            <div className={styles.content}>
                <div className={styles.lists}>
                    {lists.map((list) => (
                        <ListItem key={list.id} list={list} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BoardPage;
