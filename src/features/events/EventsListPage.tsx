import { useEffect, useState } from "react";
import { api } from "@/shared/utils/api.ts";
import { useNavigate } from "react-router-dom";
import Table from "@/shared/ui/table/Table.tsx";
import type {EventType} from "@/shared/types/Events.ts";
import {formatTime, safeDate} from "@/shared/utils/safeDate.ts";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import {Plus} from "lucide-react";
import {Button} from "@/shared/ui/buttons/button.tsx";

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

    const actionButton = (
        <Button onClick={() => navigate("/events/create-event")}
                iconLeading={Plus}
        >Додати</Button>
    );

    if (loading) {
        return <DefaultPage title="Події" isLoading={true} />;
    }

    if (events.length === 0) {
        return (
            <DefaultPage
                title="Події"
                action={actionButton}
            >
                <p>Поки немає жодної події.</p>
            </DefaultPage>
        );
    }

    return (
        <>
            <DefaultPage
                title="Заплановані події"
                action={actionButton}
            >
                {events.length === 0 ? (
                    <p>Поки немає жодної події.</p>
                ) : (
                    <Table
                        columns={[
                            { key: "date", label: "Дата", render: (v) => safeDate(v) },
                            { key: "time", label: "Час", render: (_v, row) => `${formatTime(row.time_from)} - ${formatTime(row.time_to)}` },
                            { key: "name", label: "Назва події", render: (v) => v || "—" },
                        ]}
                        data={events.filter(e => !e.date || new Date(e.date) >= new Date())}
                        onRowClick={(row) => navigate(`/events/e/${row.id}`)}
                    />
                )}
            </DefaultPage>
            <DefaultPage title="Архівні події">
                <Table
                    columns={[
                        { key: "date", label: "Дата", render: (v) => safeDate(v) },
                        { key: "time", label: "Час", render: (_v, row) => `${formatTime(row.time_from)} - ${formatTime(row.time_to)}` },
                        { key: "name", label: "Назва події", render: (v) => v || "—" },
                    ]}
                    data={events.filter(e => e.date && new Date(e.date) < new Date())}
                    onRowClick={(row) => navigate(`/events/e/${row.id}`)}
                />
            </DefaultPage>
        </>
    );
};

export default UsersListPage;








