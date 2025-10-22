import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {safeDate} from "../../../utils/safeDate.ts";
import Table from "../../basic/Table/Table.tsx";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import Button from "../../basic/Button/Button.tsx";
import {Plus} from "lucide-react";
import {api} from "../../../utils/api.ts";

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
        const fetchBoards = async () => {
            try {
                setLoading(true);
                const res = await api.get("/v1/Hub/Boards/List");
                if (res.ok) {
                    const data = await res.json();
                    setBoards(data.list); // 🔹 очікується BoardsListResponse { total, list }
                } else {
                    console.error("Failed to load boards");
                }
            } catch (err) {
                console.error("Error fetching boards:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBoards();
    }, []);


    return (
        <DefaultPage
            title="Дошки"
            action={
                <Button adaptive={true} onClick={() => navigate("/boards/create-board")}
                >
                    <Plus strokeWidth={2.25} />Додати
                </Button>
            }
            isLoading={loading}
        >
            {boards.length === 0 ? (
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
                            key: "description",
                            label: "Опис",
                            render: (value) => value,
                        },
                        {
                            key: "created_at",
                            label: "Створено",
                            render: (value) => safeDate(value),
                        }
                    ]}
                    data={boards}
                    onRowClick={(row) => navigate(`/boards/b/${row.id}`)}
                />
            )}
        </DefaultPage>
    );
};

export default BoardsListPage;
