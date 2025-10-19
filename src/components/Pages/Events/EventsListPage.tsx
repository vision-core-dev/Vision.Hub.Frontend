import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useNavigate } from "react-router-dom";
import Table from "../../basic/Table/Table.tsx";
import type {EventType} from "../../../types/Events.ts";
import {formatTime, safeDate} from "../../../utils/safeDate.ts";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import Button from "../../basic/Button/Button.tsx";
import {Plus} from "lucide-react";

const UsersListPage = () => {
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/v1/Hub/Events/List").then(async (res) => {
            const data = await res.json();
            setEvents(data.list);
            setLoading(false);
        });
    }, []);

    return (
        <DefaultPage
        title="Події"
        action={
            <Button adaptive={true} onClick={() => navigate("/events/create-event")}
            >
                <Plus strokeWidth={2.25} />Додати
            </Button>
        }
        isLoading={loading}
        >
            {events.length === 0 ? (
                <p>Поки немає жодної події.</p>
            ) : (
                <Table
                    columns={[
                        { key: "date", label: "Дата", render: (v) => safeDate(v) },
                        { key: "name", label: "Назва події", render: (v) => v || "—" },
                        { key: "time_from", label: "Початок", render: (v) => formatTime(v) || "—" },
                        { key: "time_to", label: "Завершення", render: (v) => formatTime(v) || "—" },
                    ]}
                    data={events}
                    onRowClick={(row) => navigate(`/events/e/${row.id}`)}
                />
            )}
        </DefaultPage>
    );
};

export default UsersListPage;