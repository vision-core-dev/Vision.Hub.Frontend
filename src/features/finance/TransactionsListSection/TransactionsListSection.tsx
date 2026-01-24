import React from "react";
import { ArrowUpRight, ArrowDownRight, HandCoins, CheckSquare, Calendar, User } from "lucide-react";
import { safeDatetime } from "@/shared/utils/safeDate.ts";
import { FeaturedIcon } from "@/shared/assets/icons/featured-icon/featured-icon.tsx";
import { AvatarLabelGroupWithDropdown } from "@/shared/ui/avatar";
import { cx } from "@/shared/utils/cx";

export interface TransactionItem {
    id: string;
    name: string;
    type: "income" | "withdrawal" | "deduction" | "expense" | string;
    amount: number;
    transaction_at: string;
    task?: {
        name: string;
        start_at?: string;
        deadline_at?: string;
    };
    author?: {
        name: string;
        avatar_url?: string;
        id: string;
    };
}

interface TransactionsListSectionProps {
    transactions: TransactionItem[];
}

const TransactionsListSection: React.FC<TransactionsListSectionProps> = ({ transactions }) => {
    const sortedList = [...transactions].sort(
        (a, b) => new Date(b.transaction_at).getTime() - new Date(a.transaction_at).getTime()
    );

    if (!transactions || transactions.length === 0) return null;

    const getIconProps = (type: string) => {
        switch (type) {
            case "income":
                return { icon: ArrowUpRight, color: "success" as const };
            case "withdrawal":
                return { icon: HandCoins, color: "gray" as const };
            case "expense":
                return { icon: ArrowDownRight, color: "error" as const };
            case "deduction":
                return { icon: ArrowUpRight, color: "error" as const };
            default:
                return { icon: ArrowUpRight, color: "gray" as const };
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {sortedList.map((t) => {
                const { icon, color } = getIconProps(t.type);
                const isIncome = t.type === "income";

                return (
                    <div
                        key={t.id}
                        className="flex flex-col gap-3 rounded-xl border border-secondary bg-primary p-4 shadow-2xs sm:flex-row sm:items-start sm:gap-4"
                    >
                        <div className="flex w-full items-start justify-between gap-4 sm:w-auto sm:justify-start">
                            <FeaturedIcon icon={icon} color={color} theme="modern" size="md" />
                            <div className="block sm:hidden">
                                <span className={cx("whitespace-nowrap font-semibold", isIncome ? "text-success-primary" : "text-primary")}>
                                    {isIncome ? "+" : ""}
                                    {t.amount.toFixed(2)} ₴
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-1">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col">
                                    <p className="font-semibold text-primary">{t.name}</p>
                                    <div className="flex items-center gap-2 text-sm text-tertiary">
                                        <span>{safeDatetime(t.transaction_at)}</span>
                                    </div>
                                </div>
                                <div className="hidden sm:block">
                                    <span className={cx("whitespace-nowrap font-semibold", isIncome ? "text-success-primary" : "text-primary")}>
                                        {isIncome ? "+" : ""}
                                        {t.amount.toFixed(2)} ₴
                                    </span>
                                </div>
                            </div>

                            {(t.task || t.author) && (
                                <div className="mt-2 flex flex-col gap-3 border-t border-secondary pt-3 sm:flex-row sm:items-center sm:gap-6">
                                    {t.task && (
                                        <div className="flex items-start gap-2 text-sm text-secondary">
                                            <CheckSquare className="mt-0.5 size-4 shrink-0 text-tertiary" />
                                            <div className="flex flex-col">
                                                <span className="font-medium text-primary">{t.task.name}</span>
                                                {(t.task.start_at || t.task.deadline_at) && (
                                                    <div className="flex items-center gap-1.5 text-xs text-tertiary">
                                                        <Calendar className="size-3" />
                                                        <span>
                                                            {t.task.start_at ? new Date(t.task.start_at).toLocaleDateString() : "..."}
                                                            {" - "}
                                                            {t.task.deadline_at ? new Date(t.task.deadline_at).toLocaleDateString() : "..."}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {t.author && (
                                        <div className="flex items-center gap-2 text-sm text-secondary sm:ml-auto">
                                            <User className="size-4 shrink-0 text-tertiary sm:hidden" />
                                            <div className="flex items-center gap-2">
                                                <AvatarLabelGroupWithDropdown
                                                    size="sm"
                                                    src={t.author.avatar_url}
                                                    title={t.author.name}
                                                    userId={t.author.id}
                                                // subtitle="Автор"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TransactionsListSection;









