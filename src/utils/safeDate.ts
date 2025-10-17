export const safeDate = (d: string | null | undefined) => {
    if (d === null || d === undefined || d === "" || d === "0001-01-01T00:00:00Z") {
        return "—"
    }
    try {
        return new Date(d.includes(" ") ? d.replace(" ", "T") : d).toLocaleDateString("uk-UA");
    } catch {
        return "—";
    }
};

export const safeDatetime = (d: string | null | undefined) => {
    if (d === null || d === undefined || d === "" || d === "0001-01-01T00:00:00Z") {
        return "—"
    }
    try {
        return new Date(d.includes(" ") ? d.replace(" ", "T") : d).toLocaleString("uk-UA");
    } catch {
        return "—"
    }
}

export const formatTime = (timeStr?: string) => {
    if (!timeStr) return "—";
    const [h, m] = timeStr.split(":");
    return `${h}:${m}`;
};
