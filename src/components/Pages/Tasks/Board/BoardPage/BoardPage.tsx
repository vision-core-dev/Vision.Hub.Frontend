import { useEffect, useRef, useState } from "react";
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
    const scrollRef = useRef<HTMLDivElement | null>(null); // 👈 ref для контейнера

    useEffect(() => {
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
        ]);
    }, [boardId]);

    // 👇 додай ефект для drag-scroll
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        let isDown = false;
        let startX: number;
        let scrollLeft: number;

        const handleMouseDown = (e: MouseEvent) => {
            isDown = true;
            container.classList.add(styles.active);
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        };

        const handleMouseLeave = () => {
            isDown = false;
            container.classList.remove(styles.active);
        };

        const handleMouseUp = () => {
            isDown = false;
            container.classList.remove(styles.active);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1.2; // швидкість
            container.scrollLeft = scrollLeft - walk;
        };

        container.addEventListener("mousedown", handleMouseDown);
        container.addEventListener("mouseleave", handleMouseLeave);
        container.addEventListener("mouseup", handleMouseUp);
        container.addEventListener("mousemove", handleMouseMove);

        return () => {
            container.removeEventListener("mousedown", handleMouseDown);
            container.removeEventListener("mouseleave", handleMouseLeave);
            container.removeEventListener("mouseup", handleMouseUp);
            container.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>📋 Канбан дошка</h1>
                <div className={styles.extraActions}>
                    <button>Додати список</button>
                </div>
            </div>

            <div className={styles.content}>
                <div ref={scrollRef} className={styles.lists}>
                    {lists.map((list) => (
                        <ListItem key={list.id} list={list} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BoardPage;
