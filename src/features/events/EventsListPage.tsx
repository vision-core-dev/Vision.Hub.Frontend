import { useEffect, useState } from "react";
import { api } from "@/shared/utils/api.ts";
import { useNavigate } from "react-router-dom";
import { Table } from "@/shared/components/table/table";
import type { EventType } from "@/shared/types/Events.ts";
import { formatTime, safeDate } from "@/shared/utils/safeDate.ts";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button.tsx";

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
                    <div className="min-w-full overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
                        <Table aria-label="Заплановані події">
                            <Table.Header>
                                <Table.Head isRowHeader>Дата</Table.Head>
                                <Table.Head>Час</Table.Head>
                                <Table.Head>Назва події</Table.Head>
                            </Table.Header>
                            <Table.Body items={events.filter(e => !e.date || new Date(e.date) >= new Date())}>
                                {(item) => (
                                    <Table.Row id={item.id} onAction={() => navigate(`/events/e/${item.id}`)} className="cursor-pointer">
                                        <Table.Cell>{safeDate(item.date)}</Table.Cell>
                                        <Table.Cell>{formatTime(item.time_from)} - {formatTime(item.time_to)}</Table.Cell>
                                        <Table.Cell>{item.name || "—"}</Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>
                    </div>
                )}
            </DefaultPage>
            <DefaultPage title="Архівні події">
                <div className="min-w-full overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
                    <Table aria-label="Архівні події">
                        <Table.Header>
                            <Table.Head isRowHeader>Дата</Table.Head>
                            <Table.Head>Час</Table.Head>
                            <Table.Head>Назва події</Table.Head>
                        </Table.Header>
                        <Table.Body items={events.filter(e => e.date && new Date(e.date) < new Date())}>
                            {(item) => (
                                <Table.Row id={item.id} onAction={() => navigate(`/events/e/${item.id}`)} className="cursor-pointer">
                                    <Table.Cell>{safeDate(item.date)}</Table.Cell>
                                    <Table.Cell>{formatTime(item.time_from)} - {formatTime(item.time_to)}</Table.Cell>
                                    <Table.Cell>{item.name || "—"}</Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                </div>
            </DefaultPage>
        </>
    );
};

export default UsersListPage;








