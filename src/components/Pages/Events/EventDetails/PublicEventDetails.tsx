import { useEffect, useState } from "react";
import type { EventInviteType, EventType } from "../../../../types/Events";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

import styles from "./EventDetails.module.css";
import Button from "../../../basic/Button/Button";
import { api } from "../../../../utils/api";
import DefaultPage from "../../../basic/DefaultPage/DefaultPage";
import { useParams } from "react-router-dom";
import {MapPin, Clock, Check, X, Undo2, ExternalLink, Pin, TextAlignEnd, CalendarClock} from "lucide-react";

interface PublicEventDetailsResponse {
    event: EventType;
    invite: EventInviteType;
    actions: string[];
}

const STATUS_MAP: Record<string, { emoji: string; text: string }> = {
    pending: { emoji: "⏳", text: "Запрошення очікує вашої відповіді" },
    accepted: { emoji: "✅", text: "Ви підтвердили участь" },
    declined: { emoji: "❌", text: "Ви відмовились від участі" },
    attended: { emoji: "🟢", text: "Ви були присутні" },
    no_show: { emoji: "⚠️", text: "Ви не зʼявились" },
};

const PublicEventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState<EventType | null>(null);
    const [invite, setInvite] = useState<EventInviteType | null>(null);
    const [actions, setActions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvent = async () => {
        setLoading(true);
        const res = await api.get(`/v1/Hub/Events/${id}/GetPublicDetails`);
        if (res.ok) {
            const data: PublicEventDetailsResponse = await res.json();
            setEvent(data.event);
            setInvite(data.invite);
            setActions(data.actions);
        } else {
            setEvent(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEvent();
    }, []);

    if (!event) {
        return <div className={styles.noAccess}>❌ Івент не знайдено</div>;
    }

    if (!invite) {
        return <div className={styles.noAccess}>❌ У вас немає доступу до цього івенту</div>;
    }

    const acceptInvite = async () => {
        await api.post(`/v1/Hub/Events/${event.id}/AcceptInvite`);
        fetchEvent();
    };

    const declineInvite = async () => {
        await api.post(`/v1/Hub/Events/${event.id}/DeclineInvite`);
        fetchEvent();
    };

    return (
        <DefaultPage isLoading={loading}>
            <div className={styles.page}>

                {/* 📌 Статус */}
                {invite.status && (
                    <div className={`${styles.status} ${styles[invite.status]}`}>
                        <div>{STATUS_MAP[invite.status]?.emoji}</div>
                        <span>{STATUS_MAP[invite.status]?.text}</span>
                    </div>
                )}

                {/* 📊 Інформація про івент */}
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
                                <span>
                                    {event.location}
                                </span>
                            </div>
                            {(actions.includes("join") && event.location_url) && (
                                <Button variant="primary"
                                        onClick={() => window.open(event?.location_url)}
                                ><ExternalLink color="#fff" strokeWidth={2.5} /></Button>
                            )}
                        </div>
                    </div>
                </div>



                {/* ⚙️ Дії */}
                <div className={styles.actions}>
                    {invite.status === "pending" && (
                        <>
                            <Button onClick={acceptInvite}><Check strokeWidth={2.5} /> Прийняти</Button>
                            <Button onClick={declineInvite} variant="secondary">
                                <X strokeWidth={2.5} /> Відхилити
                            </Button>
                        </>
                    )}
                    {invite.status === "accepted" && actions.includes("decline") && (
                        <Button onClick={declineInvite} variant="secondary">
                            <Undo2 strokeWidth={2.5} /> Відмовитись
                        </Button>
                    )}
                    {invite.status === "declined" && actions.includes("accept") && (
                        <Button onClick={acceptInvite}><Undo2 strokeWidth={2.5} /> Передумати</Button>
                    )}
                </div>
            </div>
        </DefaultPage>
    );
};

export default PublicEventDetails;
