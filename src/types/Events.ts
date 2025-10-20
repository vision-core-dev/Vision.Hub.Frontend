export type EventInviteStatus =
    | "pending"
    | "accepted"
    | "declined"
    | "no_show"
    | "attended";


export interface EventInviteType {
    id: string;
    event_id: string;
    user_id: string;
    status: EventInviteStatus;
    reason?: string;
    responded_at?: string;
    attended_at?: string;
}

export interface EventType {
    id: string;
    name: string;
    description: string;
    date: string;
    time_from?: string;
    time_to?: string;
    deadline?: string;
    location: string;
    location_url?: string;
    created_at: string;
}