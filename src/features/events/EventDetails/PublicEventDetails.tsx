import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { api } from "@/shared/utils/api";
import { Button } from "@/shared/ui/buttons/button";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";
import type { EventInviteType, EventType } from "@/shared/types/Events";
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    AlignLeft,
    Tag,
    ExternalLink,
    Check,
    X,
    Undo2,
} from "lucide-react";

interface PublicEventDetailsResponse {
    event: EventType;
    invite: EventInviteType;
    actions: string[];
}

type InviteStatus = "pending" | "accepted" | "declined" | "attended" | "no_show";

interface StatusConfig {
    icon: typeof Check;
    text: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
}

const STATUS_CONFIG: Record<InviteStatus, StatusConfig> = {
    pending: {
        icon: Clock,
        text: "Запрошення очікує вашої відповіді",
        bgClass: "bg-warning-50",
        textClass: "text-warning-700",
        borderClass: "border-warning-300",
    },
    accepted: {
        icon: Check,
        text: "Ви підтвердили участь",
        bgClass: "bg-success-50",
        textClass: "text-success-700",
        borderClass: "border-success-300",
    },
    declined: {
        icon: X,
        text: "Ви відмовились від участі",
        bgClass: "bg-error-50",
        textClass: "text-error-700",
        borderClass: "border-error-300",
    },
    attended: {
        icon: Check,
        text: "Ви були присутні",
        bgClass: "bg-success-100",
        textClass: "text-success-800",
        borderClass: "border-success-400",
    },
    no_show: {
        icon: X,
        text: "Ви не з'явились",
        bgClass: "bg-warning-100",
        textClass: "text-warning-800",
        borderClass: "border-warning-400",
    },
};

interface InfoRowProps {
    icon: typeof Tag;
    label: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

const InfoRow = ({ icon: Icon, label, children, action }: InfoRowProps) => (
    <div className="flex items-start gap-4 py-4 border-b border-secondary last:border-b-0 last:pb-0 first:pt-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50">
            <Icon className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-tertiary">{label}</p>
            <div className="text-md font-medium text-primary mt-0.5">{children}</div>
        </div>
        {action}
    </div>
);

const PublicEventDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [event, setEvent] = useState<EventType | null>(null);
    const [invite, setInvite] = useState<EventInviteType | null>(null);
    const [actions, setActions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchEvent = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const res = await api.get(`/v1/Hub/Events/${id}/GetPublicDetails`);
            if (res.ok) {
                const data: PublicEventDetailsResponse = await res.json();
                setEvent(data.event);
                setInvite(data.invite);
                setActions(data.actions);
            } else {
                setEvent(null);
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    const handleAccept = async () => {
        if (!event) return;
        setActionLoading(true);
        await api.post(`/v1/Hub/Events/${event.id}/AcceptInvite`);
        await fetchEvent();
        setActionLoading(false);
    };

    const handleDecline = async () => {
        if (!event) return;
        setActionLoading(true);
        await api.post(`/v1/Hub/Events/${event.id}/DeclineInvite`);
        await fetchEvent();
        setActionLoading(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoaderDots size="lg" />
            </div>
        );
    }

    // Event not found
    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center mb-4">
                    <X className="w-8 h-8 text-error-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary mb-2">Подію не знайдено</h2>
                <p className="text-tertiary mb-6">Можливо, посилання застаріло або подія була видалена</p>
                <Button onClick={() => navigate("/calendar")} iconLeading={ArrowLeft}>
                    Повернутися до календаря
                </Button>
            </div>
        );
    }

    // No invite access
    if (!invite) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-16 h-16 rounded-full bg-warning-50 flex items-center justify-center mb-4">
                    <X className="w-8 h-8 text-warning-500" />
                </div>
                <h2 className="text-xl font-semibold text-primary mb-2">Доступ обмежено</h2>
                <p className="text-tertiary mb-6">У вас немає запрошення на цю подію</p>
                <Button onClick={() => navigate("/calendar")} iconLeading={ArrowLeft}>
                    Повернутися до календаря
                </Button>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[invite.status as InviteStatus];
    const StatusIcon = statusConfig?.icon || Clock;

    return (
        <div className="max-w-xl mx-auto py-6 px-4 space-y-6">
            {/* Status Badge */}
            {statusConfig && (
                <div
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 ${statusConfig.bgClass} ${statusConfig.borderClass}`}
                >
                    <StatusIcon className={`w-6 h-6 ${statusConfig.textClass}`} />
                    <span className={`font-semibold ${statusConfig.textClass}`}>
                        {statusConfig.text}
                    </span>
                </div>
            )}

            {/* Event Info Card */}
            <div className="bg-primary rounded-2xl border border-secondary shadow-sm p-6">
                <InfoRow icon={Tag} label="Назва">
                    {event.name}
                </InfoRow>

                {event.description && (
                    <InfoRow icon={AlignLeft} label="Опис">
                        {event.description}
                    </InfoRow>
                )}

                <InfoRow icon={Calendar} label="Дата">
                    {format(new Date(event.date), "dd MMMM yyyy", { locale: uk })}
                </InfoRow>

                <InfoRow icon={Clock} label="Час">
                    {event.time_from} — {event.time_to}
                </InfoRow>

                {event.location && (
                    <InfoRow
                        icon={MapPin}
                        label="Локація"
                        action={
                            actions.includes("join") && event.location_url ? (
                                <Button
                                    color="secondary"
                                    size="sm"
                                    iconLeading={ExternalLink}
                                    onClick={() => window.open(event.location_url, "_blank")}
                                >
                                    Відкрити
                                </Button>
                            ) : undefined
                        }
                    >
                        {event.location}
                    </InfoRow>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                {invite.status === "pending" && (
                    <>
                        <Button
                            className="flex-1"
                            onClick={handleAccept}
                            iconLeading={Check}
                            isLoading={actionLoading}
                        >
                            Прийняти
                        </Button>
                        <Button
                            className="flex-1"
                            color="secondary"
                            onClick={handleDecline}
                            iconLeading={X}
                            isLoading={actionLoading}
                        >
                            Відхилити
                        </Button>
                    </>
                )}

                {invite.status === "accepted" && actions.includes("decline") && (
                    <Button
                        className="w-full"
                        color="secondary"
                        onClick={handleDecline}
                        iconLeading={Undo2}
                        isLoading={actionLoading}
                    >
                        Відмовитись
                    </Button>
                )}

                {invite.status === "declined" && actions.includes("accept") && (
                    <Button
                        className="w-full"
                        onClick={handleAccept}
                        iconLeading={Undo2}
                        isLoading={actionLoading}
                    >
                        Передумати
                    </Button>
                )}
            </div>

            {/* Back Link */}
            <Button
                color="link-color"
                onClick={() => navigate("/calendar")}
                iconLeading={ArrowLeft}
            >
                Назад до календаря
            </Button>
        </div>
    );
};

export default PublicEventDetails;
