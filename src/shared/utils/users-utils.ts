export const isOnline = (lastLogin?: string, minutes = 5) => {
    if (!lastLogin) return false;

    const last = new Date(lastLogin).getTime();
    const now = Date.now();

    return now - last <= minutes * 60 * 1000;
};