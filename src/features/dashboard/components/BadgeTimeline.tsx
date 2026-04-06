import { useEffect, useState } from "react";
import { api } from "@/shared/utils/api";
import { Avatar } from "@/shared/ui/avatar";
import { useNavigate } from "react-router-dom";

interface BadgeAward {
    user_id: string;
    user_name: string;
    user_avatar: string | null;
    badge_name: string;
    badge_description: string | null;
    badge_emoji: string | null;
    awarded_at: string | null;
}

export default function BadgeTimeline({ initialAwards }: { initialAwards?: BadgeAward[] }) {
    const [awards, setAwards] = useState<BadgeAward[]>(initialAwards || []);
    const [loading, setLoading] = useState(!initialAwards);
    const navigate = useNavigate();

    useEffect(() => {
        if (initialAwards) return;
        api.get("/v1/Hub/Badges/RecentAwards").then(async (res) => {
            if (res.ok) setAwards(await res.json());
            setLoading(false);
        });
    }, []);

    if (loading || awards.length === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                🏆 Нагороди команди
            </h3>

            <div className="relative flex flex-col">
                {/* Timeline line */}
                <div className="absolute left-4 top-3 bottom-3 w-px bg-border-secondary" />

                {awards.map((a, i) => {
                    const date = a.awarded_at ? new Date(a.awarded_at) : null;
                    const dateStr = date
                        ? date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" })
                        : "";

                    return (
                        <div key={i} className="relative flex items-start gap-3 py-2.5 pl-1">
                            {/* Timeline dot */}
                            <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-secondary bg-primary text-sm">
                                {a.badge_emoji || "🏅"}
                            </div>

                            {/* Content */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <Avatar
                                    size="sm"
                                    src={a.user_avatar}
                                    alt={a.user_name}
                                    className="shrink-0 cursor-pointer"
                                    onClick={() => navigate(`/users/u/${a.user_id}`)}
                                />
                                <div className="flex flex-col min-w-0">
                                    <p className="text-sm text-fg-primary">
                                        <span
                                            className="font-semibold hover:underline cursor-pointer"
                                            onClick={() => navigate(`/users/u/${a.user_id}`)}
                                        >
                                            {a.user_name}
                                        </span>
                                        <span className="text-fg-tertiary font-normal"> отримав </span>
                                        <span className="font-medium">{a.badge_name}</span>
                                    </p>
                                    {a.badge_description && (
                                        <span className="text-xs text-fg-tertiary">{a.badge_description}</span>
                                    )}
                                    {dateStr && (
                                        <span className="text-xs text-fg-quaternary">{dateStr}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
