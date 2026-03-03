import type { CalendarEvent } from "@/shared/ui/application/calendar/calendar";

interface EventLike {
    id: string;
    name: string;
    date: string;
    time_from?: string | null;
    time_to?: string | null;
}

function buildDateTime(dateStr: string, timeStr: string): Date {
    const d = new Date(dateStr);
    const parts = timeStr.split(":");
    d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
    return d;
}

export function eventToCalendarEvent(event: EventLike): CalendarEvent {
    const start = event.time_from
        ? buildDateTime(event.date, event.time_from)
        : new Date(event.date);

    const end = event.time_to
        ? buildDateTime(event.date, event.time_to)
        : new Date(start.getTime() + 3600000);

    return {
        id: String(event.id),
        title: event.name,
        start,
        end,
        color: "brand",
    };
}

export function eventsToCalendarEvents(events: EventLike[]): CalendarEvent[] {
    return events.map(eventToCalendarEvent);
}
