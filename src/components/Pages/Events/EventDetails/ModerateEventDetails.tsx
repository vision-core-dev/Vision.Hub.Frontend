import { useEffect, useState } from "react";
import type { EventInviteType, EventType } from "../../../../types/Events";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import styles from "./EventDetails.module.css";
import Button from "../../../basic/Button/Button";
import { api } from "../../../../utils/api";
import DefaultPage from "../../../basic/DefaultPage/DefaultPage";
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
    UserX,
    Loader2
} from "lucide-react";
import Table from "../../../basic/Table/Table.tsx";
import UserLabel from "../../../basic/User/UserLabel.tsx";
import { safeDatetime } from "../../../../utils/safeDate.ts";
import LoaderSpinner from "../../../basic/LoaderSpinner/LoaderSpinner.tsx";

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

    const columns = [
        {
            key: "user",
            label: "Користувач",
            render: (_: never, row: InviteeWithUser) =>
                row.user && (
                    <UserLabel
                        avatar_url={row.user.avatar_url}
                        name={`${row.user.first_name} ${row.user.last_name ?? ""}`}
                        user_id={row.user.id}
                    />
                ),
        },
        {
            key: "status",
            label: "Статус",
            render: (value: string) => {
                switch (value) {
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
                        return <span>{value}</span>;
                }
            },
        },
        {
            key: "responded_at",
            label: "Відповів",
            render: (value: string | null) =>
                value ? safeDatetime(value) : "—",
        },
        {
            key: "actions",
            label: "",
            render: (_: never, row: InviteeWithUser) => (
                <div className={styles.actionsCell}>
                    {/* ✅ Відмітити присутність */}
                    {(actions.includes("mark_attended") && row.status !== "attended") && (
                        <Button
                            variant="primary"
                            onClick={() => handleMark(row.user.id, true)}
                            title="Відмітити як відвідав"
                            disabled={!!userLoading}
                        >
                            {userLoading === row.user.id
                                ? <LoaderSpinner size={18} />
                                : <UserCheck size={18} />}
                        </Button>
                    )}

                    {/* ❌ Відмітити відсутність */}
                    {(actions.includes("mark_absent") &&
                        row.status !== "no_show" &&
                        row.status !== "declined" &&
                        row.status !== "attended") && (
                        <Button
                            variant="danger"
                            onClick={() => handleMark(row.user.id, false)}
                            title="Відмітити як відсутній"
                            disabled={!!userLoading}
                        >
                            {userLoading === row.user.id
                                ? <LoaderSpinner size={18} />
                                : <UserX size={18} />}
                        </Button>
                    )}
                </div>
            ),
        },
    ];

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

                <Table columns={columns} data={invitees} />

                <Button variant="link" onClick={() => navigate("/events/list")}>
                    <ArrowLeft size={20} /> Назад до списку
                </Button>
            </div>
        </DefaultPage>
    );
};

export default ModerateEventDetails;
