import { useEffect, useState, useCallback } from "react";
import { api } from "@/shared/utils/api";
import { useAuth } from "@/core/auth/AuthContext";
import type { CalendarEvent } from "@/shared/ui/application/calendar/calendar";
import type { EventType } from "@/shared/types/Events";
import { eventsToCalendarEvents } from "../utils/eventAdapter";

interface UseCalendarEventsResult {
    events: CalendarEvent[];
    rawEvents: EventType[];
    loading: boolean;
    isAdmin: boolean;
    refetch: () => void;
}

export function useCalendarEvents(): UseCalendarEventsResult {
    const { role } = useAuth();
    const isAdmin = role?.menu?.includes("events") ?? false;

    const [rawEvents, setRawEvents] = useState<EventType[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            if (isAdmin) {
                const res = await api.get("/v1/Hub/Events/List");
                const data = await res.json();
                setRawEvents(data.list);
                setEvents(eventsToCalendarEvents(data.list));
            } else {
                const res = await api.get("/v1/Hub/UserMe/MyCalendar");
                const data = await res.json();
                setRawEvents(data.events);
                setEvents(eventsToCalendarEvents(data.events));
            }
        } catch (error) {
            console.error("Error fetching calendar events:", error);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return { events, rawEvents, loading, isAdmin, refetch: fetchEvents };
}
