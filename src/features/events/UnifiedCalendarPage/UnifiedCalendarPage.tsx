import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/shared/ui/application/calendar/calendar";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import EventsListView from "./EventsListView";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { CalendarDays, List } from "lucide-react";

const UnifiedCalendarPage = () => {
    const navigate = useNavigate();
    const { events, loading, isAdmin } = useCalendarEvents();
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

    const handleEventClick = (eventId: string) => {
        navigate(`/calendar/e/${eventId}`);
    };

    const handleAddEvent = () => {
        navigate("/calendar/create");
    };

    if (loading) {
        return <DefaultPage title="Календар" isLoading={true} />;
    }

    return (
        <DefaultPage>
            {isAdmin && (
                <div className="flex items-center gap-1 border-b border-secondary px-6 pb-0 mb-4">
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

            {viewMode === "calendar" ? (
                <Calendar
                    events={events}
                    view="week"
                    onEventClick={handleEventClick}
                    onAddEvent={isAdmin ? handleAddEvent : undefined}
                />
            ) : (
                <EventsListView onEventClick={handleEventClick} />
            )}
        </DefaultPage>
    );
};

export default UnifiedCalendarPage;
