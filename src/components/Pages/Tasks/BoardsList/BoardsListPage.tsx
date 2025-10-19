import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./BoardsListPage.module.css";
import {safeDate} from "../../../../utils/safeDate.ts";
import Table from "../../../basic/Table/Table.tsx";

type BoardType = {
    id: string;
    name: string;
    created_at: string;
    updated_at?: string;
    tasks_count?: number;
};

const BoardsListPage = () => {
    const [boards, setBoards] = useState<BoardType[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // емуляція завантаження
        setTimeout(() => {
            const dummyBoards: BoardType[] = [
                {
                    id: "1",
                    name: "📊 Головна дошка проєкту",
                    created_at: "2025-10-01T10:00:00Z",
                    updated_at: "2025-10-15T18:30:00Z",
                    tasks_count: 42,
                },
                {
                    id: "2",
                    name: "🚀 Розробка нової гри",
                    created_at: "2025-09-20T14:15:00Z",
                    updated_at: "2025-10-10T09:00:00Z",
                    tasks_count: 18,
                },
                {
                    id: "3",
                    name: "🛠️ Тестування та QA",
                    created_at: "2025-10-05T08:45:00Z",
                    updated_at: "2025-10-17T12:00:00Z",
                    tasks_count: 7,
                },
            ];
            setBoards(dummyBoards);
            setLoading(false);
        }, 600);
    }, []);

    // useEffect(() => {
    //     api.get("/v1/Tasks/Boards/List").then(async (res) => {
    //         const data = await res.json();
    //         setBoards(data.list);
    //         setLoading(false);
    //     });
    // }, []);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>📋 Дошки задач</h1>
                <button
                    className={styles.button}
                    onClick={() => navigate("/workspace/tasks/boards/create")}
                >
                    ➕ Створити дошку
                </button>
            </div>

            {loading ? (
                <p>⏳ Завантаження...</p>
            ) : boards.length === 0 ? (
                <p>Поки немає жодної дошки.</p>
            ) : (
                <Table
                    columns={[
                        {
                            key: "name",
                            label: "Назва дошки",
                            render: (value) => value, // value = row.name
                        },
                        {
                            key: "created_at",
                            label: "Створено",
                            render: (value) => safeDate(value),
                        },
                        {
                            key: "updated_at",
                            label: "Оновлено",
                            render: (value) => (value ? safeDate(value) : "—"),
                        },
                        {
                            key: "tasks_count",
                            label: "Кількість задач",
                            render: (value) => value ?? "—",
                        },
                    ]}
                    data={boards}
                    onRowClick={(row) => navigate(`/boards/b/${row.id}`)}
                />

            )}
        </div>
    );
};

export default BoardsListPage;
