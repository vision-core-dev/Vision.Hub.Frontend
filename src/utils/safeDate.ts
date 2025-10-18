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
        // return new Date(d.includes(" ") ? d.replace(" ", "T") : d).toLocaleString("uk-UA");
        return new Date(d.includes(" ") ? d.replace(" ", "T") : d).toLocaleString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    } catch {
        return "—"
    }
}

export const formatTime = (timeStr?: string) => {
    if (!timeStr) return "—";
    const [h, m] = timeStr.split(":");
    return `${h}:${m}`;
};
