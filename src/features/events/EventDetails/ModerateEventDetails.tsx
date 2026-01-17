import { useEffect, useState } from "react";
import type { EventInviteType, EventType } from "@/shared/types/Events.ts";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import styles from "./EventDetails.module.css";
import { api } from "@/shared/utils/api.ts";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { useNavigate, useParams } from "react-router-dom";
import {
    MapPin,
    Clock,
    Pin,
    TextAlignEnd,
    CalendarClock,
    ArrowLeft,
    Link,
    UserCheck,
    UserX
} from "lucide-react";
import { Table } from "@/shared/components/table/table";
import UserLabel from "@/shared/ui/user/UserLabel.tsx";
import { safeDatetime } from "@/shared/utils/safeDate.ts";
import LoaderSpinner from "@/shared/ui/loader-spinner/LoaderSpinner.tsx";
import { Button } from "@/shared/ui/buttons/button.tsx";

interface UserShort {
    id: string;
    first_name: string;
    last_name?: string | null;
    avatar_url?: string | null;
}

interface InviteeWithUser extends EventInviteType {
    user: UserShort;
}

interface ModerateEventDetailsResponse {
    event: EventType;
    invitees: InviteeWithUser[];
    actions: string[];
}

const ModerateEventDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [event, setEvent] = useState<EventType | null>(null);
    const [invitees, setInvitees] = useState<InviteeWithUser[]>([]);
    const [actions, setActions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // 👇 додаємо локальний стейт для конкретного користувача, що зараз оновлюється
    const [userLoading, setUserLoading] = useState<string | null>(null);

    const fetchEvent = async (withLoading = true) => {
        if (withLoading) setLoading(true);
        const res = await api.get(`/v1/Hub/Events/${id}/GetModerateDetails`);
        if (res.ok) {
            const data: ModerateEventDetailsResponse = await res.json();
            setEvent(data.event);
            setInvitees(data.invitees);
            setActions(data.actions);
        } else {
            setEvent(null);
        }
        setLoading(false);
    };

    const handleMark = async (userId: string, attended: boolean) => {
        try {
            setUserLoading(userId); // 🌀 показуємо лоадер тільки для цього користувача

            const endpoint = attended
                ? `/v1/Hub/Events/${event?.id}/MarkAttended?user_id=${userId}`
                : `/v1/Hub/Events/${event?.id}/MarkAbsent?user_id=${userId}`;

            const res = await api.post(endpoint);

            // 🔁 одразу рефетч, але у фоні
            fetchEvent(false);

            if (!res.ok) console.error("Failed to update attendance");
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setUserLoading(null); // ✅ ховаємо лоадер після запиту
        }
    };

    useEffect(() => {
        fetchEvent();
    }, []);

    if (loading) {
        return <DefaultPage isLoading={loading} />;
    }

    if (!event) {
        return <div className={styles.noAccess}>❌ Івент не знайдено</div>;
    }

    return (
        <DefaultPage isLoading={loading}>
            <div className={`${styles.page} ${styles.moderate}`}>
                <div className={styles.infoSection}>
                    <div className={styles.infoRow}>
                        <Pin size={20} />
                        <div className={styles.infoText}>
                            <label>Назва</label>
                            <span>{event.name}</span>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <TextAlignEnd size={20} />
                        <div className={styles.infoText}>
                            <label>Опис</label>
                            <span>{event.description}</span>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <CalendarClock size={20} />
                        <div className={styles.infoText}>
                            <label>Дата</label>
                            <span>{format(new Date(event.date), "dd.MM.yyyy", { locale: uk })}</span>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <Clock size={20} />
                        <div className={styles.infoText}>
                            <label>Час</label>
                            <span>{event.time_from} – {event.time_to}</span>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <MapPin size={20} />
                        <div className={styles.locationRow}>
                            <div className={styles.infoText}>
                                <label>Локація</label>
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoRow}>
                        <Link size={20} />
                        <div className={styles.infoText}>
                            <label>Посилання</label>
                            <span>{event.location_url || "—"}</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
                    <Table aria-label="Учасники">
                        <Table.Header>
                            <Table.Head isRowHeader>Користувач</Table.Head>
                            <Table.Head>Статус</Table.Head>
                            <Table.Head>Відповів</Table.Head>
                            <Table.Head></Table.Head>
                        </Table.Header>
                        <Table.Body items={invitees}>
                            {(item: InviteeWithUser) => (
                                <Table.Row id={item.user.id}>
                                    <Table.Cell>
                                        {item.user && (
                                            <UserLabel
                                                avatar_url={item.user.avatar_url}
                                                name={`${item.user.first_name} ${item.user.last_name ?? ""}`}
                                                user_id={item.user.id}
                                            />
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {(() => {
                                            switch (item.status) {
                                                case "accepted":
                                                    return <span className={styles.statusAccepted}>✅ Прийняв</span>;
                                                case "declined":
                                                    return <span className={styles.statusDeclined}>❌ Відмовився</span>;
                                                case "pending":
                                                    return <span className={styles.statusPending}>⏳ Очікує</span>;
                                                case "attended":
                                                    return <span className={styles.statusAttended}>🎉 Відвідав</span>;
                                                case "no_show":
                                                    return <span className={styles.statusNoShow}>⚠️ Не зʼявився</span>;
                                                default:
                                                    return <span>{item.status}</span>;
                                            }
                                        })()}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.responded_at ? safeDatetime(item.responded_at) : "—"}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className={styles.actionsCell}>
                                            {(actions.includes("mark_attended") && item.status !== "attended") && (
                                                <Button
                                                    color="primary"
                                                    onClick={() => handleMark(item.user.id, true)}
                                                    title="Відмітити як відвідав"
                                                    disabled={!!userLoading}
                                                >
                                                    {userLoading === item.user.id
                                                        ? <LoaderSpinner size={18} />
                                                        : <UserCheck size={18} />}
                                                </Button>
                                            )}

                                            {(actions.includes("mark_absent") &&
                                                item.status !== "no_show" &&
                                                item.status !== "declined" &&
                                                item.status !== "attended") && (
                                                    <Button
                                                        color="primary-destructive"
                                                        onClick={() => handleMark(item.user.id, false)}
                                                        title="Відмітити як відсутній"
                                                        disabled={!!userLoading}
                                                    >
                                                        {userLoading === item.user.id
                                                            ? <LoaderSpinner size={18} />
                                                            : <UserX size={18} />}
                                                    </Button>
                                                )}
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                </div>

                <Button color="link-color" onClick={() => navigate("/events/list")}>
                    <ArrowLeft size={20} /> Назад до списку
                </Button>
            </div>
        </DefaultPage>
    );
};

export default ModerateEventDetails;









