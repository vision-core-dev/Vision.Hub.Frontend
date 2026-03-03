import { useEffect, useState } from "react";
import { api } from "@/shared/utils/api";
import { Table, TableCard } from "@/shared/components/table/table";
import type { EventType } from "@/shared/types/Events";
import { formatTime, safeDate } from "@/shared/utils/safeDate";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";

interface EventsListViewProps {
    onEventClick: (eventId: string) => void;
}

const EventsListView = ({ onEventClick }: EventsListViewProps) => {
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/v1/Hub/Events/List").then(async (res) => {
            const data = await res.json();
            setEvents(data.list);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <DefaultPage isLoading={true} />;
    }

    if (events.length === 0) {
        return <p className="p-6 text-tertiary">Поки немає жодної події.</p>;
    }

    const upcomingEvents = events.filter(e => !e.date || new Date(e.date) >= new Date());
    const archivedEvents = events.filter(e => e.date && new Date(e.date) < new Date());

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h3 className="text-lg font-semibold text-primary mb-3">Заплановані події</h3>
                {upcomingEvents.length === 0 ? (
                    <p className="text-tertiary">Немає запланованих подій.</p>
                ) : (
                    <TableCard.Root>
                        <Table aria-label="Заплановані події">
                            <Table.Header>
                                <Table.Head isRowHeader>Дата</Table.Head>
                                <Table.Head>Час</Table.Head>
                                <Table.Head>Назва події</Table.Head>
                            </Table.Header>
                            <Table.Body items={upcomingEvents}>
                                {(item) => (
                                    <Table.Row
                                        id={item.id}
                                        onAction={() => onEventClick(item.id)}
                                        className="cursor-pointer hover:bg-secondary_hover transition-colors"
                                    >
                                        <Table.Cell>{safeDate(item.date)}</Table.Cell>
                                        <Table.Cell>{formatTime(item.time_from)} - {formatTime(item.time_to)}</Table.Cell>
                                        <Table.Cell>{item.name || "\u2014"}</Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>
                    </TableCard.Root>
                )}
            </div>

            {archivedEvents.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-primary mb-3">Архівні події</h3>
                    <TableCard.Root>
                        <Table aria-label="Архівні події">
                            <Table.Header>
                                <Table.Head isRowHeader>Дата</Table.Head>
                                <Table.Head>Час</Table.Head>
                                <Table.Head>Назва події</Table.Head>
                            </Table.Header>
                            <Table.Body items={archivedEvents}>
                                {(item) => (
                                    <Table.Row
                                        id={item.id}
                                        onAction={() => onEventClick(item.id)}
                                        className="cursor-pointer hover:bg-secondary_hover transition-colors"
                                    >
                                        <Table.Cell>{safeDate(item.date)}</Table.Cell>
                                        <Table.Cell>{formatTime(item.time_from)} - {formatTime(item.time_to)}</Table.Cell>
                                        <Table.Cell>{item.name || "\u2014"}</Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table>
                    </TableCard.Root>
                </div>
            )}
        </div>
    );
};

export default EventsListView;
