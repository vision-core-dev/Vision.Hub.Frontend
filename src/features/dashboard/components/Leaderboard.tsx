import React, { useEffect, useState } from "react";
import { api } from "@/shared/utils/api";
import { Avatar } from "@/shared/ui/avatar/avatar";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";
import { useAuth } from "@/core/auth/AuthContext";
import { Trophy, Medal } from "lucide-react";
import { EmptyState } from "@/shared/ui/application/empty-state/empty-state";

interface LeaderboardItem {
    user_id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    active_badge_emoji: string | null;
    total_earnings: number;
}

const Leaderboard: React.FC<{ initialItems?: LeaderboardItem[] }> = ({ initialItems }) => {
    const { user } = useAuth();
    const [items, setItems] = useState<LeaderboardItem[]>(initialItems || []);
    const [loading, setLoading] = useState(!initialItems);

    useEffect(() => {
        if (initialItems) return;
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get("/v1/Hub/Finance/GetLeaderboard");
                if (res.ok) {
                    const data = await res.json();
                    setItems(data.items);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="p-4 bg-primary rounded-xl border border-secondary flex justify-center">
                <LoaderDots />
            </div>
        );
    }

    const myRank = items.findIndex(item => item.user_id === user?.id) + 1;
    const isMeInTop10 = myRank > 0 && myRank <= 10;

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Рейтинг за місяць
            </h3>

            <div className="bg-primary rounded-xl border border-secondary shadow-sm overflow-hidden">
                <div className="divide-y divide-secondary">
                    {items.slice(0, 10).map((item, index) => {
                        const rank = index + 1;
                        const isMe = item.user_id === user?.id;

                        return (
                            <div
                                key={item.user_id}
                                className={`flex items-center gap-3 p-3 transition-colors ${isMe ? 'bg-brand-secondary/5' : 'hover:bg-secondary/50'}`}
                            >
                                <div className="flex items-center justify-center w-6 text-sm font-bold text-tertiary">
                                    {rank === 1 && <Medal className="w-5 h-5 text-yellow-500" />}
                                    {rank === 2 && <Medal className="w-5 h-5 text-slate-400" />}
                                    {rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                                    {rank > 3 && rank}
                                </div>

                                <Avatar
                                    size="sm"
                                    src={item.avatar_url}
                                    initials={`${item.first_name[0]}${item.last_name?.[0] || ""}`}
                                />

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isMe ? 'text-brand-secondary' : 'text-primary'}`}>
                                        {item.first_name} {item.last_name}{item.active_badge_emoji ? ` ${item.active_badge_emoji}` : ""}
                                        {isMe && <span className="ml-1.5 text-[10px] bg-brand-solid text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">Ви</span>}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm font-bold text-success-tertiary">
                                        {item.total_earnings.toLocaleString()} ₴
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {/* Show me if I'm not in top 10 */}
                    {!isMeInTop10 && myRank > 10 && (
                        <>
                            <div className="flex justify-center p-1 text-tertiary">
                                <span className="text-xs">...</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-brand-secondary/5 border-t border-secondary">
                                <div className="flex items-center justify-center w-6 text-sm font-bold text-brand-secondary">
                                    {myRank}
                                </div>
                                <Avatar
                                    size="sm"
                                    src={user?.avatar_url}
                                    initials={`${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-brand-secondary truncate">
                                        {user?.first_name} {user?.last_name}
                                        <span className="ml-1.5 text-[10px] bg-brand-solid text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">Ви</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-success-tertiary">
                                        {items[myRank - 1]?.total_earnings.toLocaleString()} ₴
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {items.length === 0 && (
                    <div className="py-8">
                        <EmptyState size="sm">
                            <EmptyState.Header pattern="circle">
                                <EmptyState.FeaturedIcon icon={Trophy} color="warning" />
                            </EmptyState.Header>
                            <EmptyState.Content>
                                <EmptyState.Title>Рейтинг порожній</EmptyState.Title>
                                <EmptyState.Description>Дані поки що відсутні.</EmptyState.Description>
                            </EmptyState.Content>
                        </EmptyState>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Leaderboard;
