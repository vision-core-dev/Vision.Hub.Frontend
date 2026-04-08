import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/shared/ui/application/calendar/calendar";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import EventsListView from "./EventsListView";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";
import { CalendarDays, List } from "lucide-react";
import CreateEventModal from "../CreateEventModal";

const UnifiedCalendarPage = () => {
    const navigate = useNavigate();
    const { events, loading, isAdmin, refetch } = useCalendarEvents();
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
    const [createOpen, setCreateOpen] = useState(false);

    const handleEventClick = (eventId: string) => {
        navigate(`/calendar/e/${eventId}`);
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><LoaderDots /></div>;
    }

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {isAdmin && (
                <div className="flex items-center gap-1 border-b border-secondary px-4 shrink-0">
                    <button
                        onClick={() => setViewMode("calendar")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                            viewMode === "calendar"
                                ? "border-brand-600 text-brand-700"
                                : "border-transparent text-tertiary hover:text-secondary"
                        }`}
                    >
                        <CalendarDays size={16} />
                        Календар
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                            viewMode === "list"
                                ? "border-brand-600 text-brand-700"
                                : "border-transparent text-tertiary hover:text-secondary"
                        }`}
                    >
                        <List size={16} />
                        Список
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-auto">
                {viewMode === "calendar" ? (
                    <Calendar
                        events={events}
                        view="week"
                        onEventClick={handleEventClick}
                        onAddEvent={isAdmin ? () => setCreateOpen(true) : undefined}
                    />
                ) : (
                    <EventsListView onEventClick={handleEventClick} />
                )}
            </div>

            <CreateEventModal isOpen={createOpen} setIsOpen={setCreateOpen} onSuccess={refetch} />
        </div>
    );
};

export default UnifiedCalendarPage;
