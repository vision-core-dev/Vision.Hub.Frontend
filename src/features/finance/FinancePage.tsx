import React, { useEffect, useState } from "react";

import { ArrowLeftRight, HandCoins, TrendingUp, TrendingDown, Wallet, Users } from "lucide-react";
import { Table, TableCard } from "@/shared/components/table/table";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import { useNavigate } from "react-router-dom";
import type { UserType } from "@/shared/types/Users.ts";
import { api } from "@/shared/utils/api.ts";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { AvatarLabelGroupWithDropdown } from "@/shared/ui/avatar";

interface NoWithdrawnDataRes {
    items: Array<{
        user: UserType;
        amount: number;
        last_withdraw_amount: number;
        last_withdraw_at: string;
    }>;
}

interface MonthData {
    month: string;
    label: string;
    income: number;
    withdrawn: number;
}

interface StatsData {
    months: MonthData[];
    workers_income: number;
    paid_out: number;
    to_pay: number;
    total_users: number;
}

const FinancePage: React.FC = () => {
    const navigate = useNavigate();
    const [noWithdrawnData, setNoWithdrawnData] = useState<Array<any>>([]);
    const [stats, setStats] = useState<StatsData | null>(null);

    useEffect(() => {
        api.get("/v1/Hub/Finance/GetUnwithdrawnList").then(async (res) => {
            const data = (await res.json()) as NoWithdrawnDataRes;
            setNoWithdrawnData(data.items);
        });
        api.get("/v1/Hub/Finance/GetStats").then(async (res) => {
            if (res.ok) setStats(await res.json());
        });
    }, []);

    return (
        <>
            <DefaultPage title=""
                action={(
                    <>
                        <Button color="secondary" onClick={() => navigate('/finance/withdraws/list')} iconLeading={HandCoins} />
                        <Button color="secondary" onClick={() => navigate('/finance/transactions/list')} iconLeading={ArrowLeftRight}>
                            Транзакції
                        </Button>
                    </>
                )}>

                {/* Stats cards */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard icon={TrendingUp} label="Дохід робітників" value={stats.workers_income} color="success" />
                        <StatCard icon={Wallet} label="До виплати" value={stats.to_pay} color="warning" />
                        <StatCard icon={TrendingDown} label="Виплачено" value={stats.paid_out} color="error" />
                        <StatCard icon={Users} label="Активних юзерів" value={stats.total_users} color="brand" isCurrency={false} />
                    </div>
                )}

                {/* Chart */}
                {stats && stats.months.length > 0 && (
                    <div className="rounded-xl border border-border-secondary bg-primary p-5 shadow-xs mb-6">
                        <h3 className="text-base font-semibold text-fg-primary mb-4">Доходи та виплати за місяць</h3>
                        <BarChart months={stats.months} />
                    </div>
                )}
            </DefaultPage>

            <DefaultPage title="Невиплачені кошти">
                <TableCard.Root>
                    <Table aria-label="Невиплачені кошти">
                        <Table.Header>
                            <Table.Head isRowHeader>Користувач</Table.Head>
                            <Table.Head>Сума (реальний баланс)</Table.Head>
                            <Table.Head>Остання сума виплати</Table.Head>
                            <Table.Head>Остання виплата</Table.Head>
                        </Table.Header>
                        <Table.Body items={noWithdrawnData} renderEmptyState={() => (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-tertiary">
                                <p>Немає даних</p>
                            </div>
                        )}>
                            {(item: {
                                user: UserType;
                                amount: number;
                                last_withdraw_amount: number;
                                last_withdraw_at: string;
                            }) => (
                                <Table.Row id={item.user.id}>
                                    <Table.Cell>
                                        <AvatarLabelGroupWithDropdown
                                            src={item.user.avatar_url || undefined}
                                            title={`${item.user.first_name || ""} ${item.user.last_name || ""}`}
                                            badgeEmoji={item.user.active_badge_emoji}
                                            size="sm"
                                            userId={item.user.id}
                                            onViewProfile={() => navigate(`/users/u/${item.user.id}`)}
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="font-semibold text-fg-success-primary">
                                            {item.amount.toFixed(2)} ₴
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>{item.last_withdraw_amount.toFixed(2)} ₴</Table.Cell>
                                    <Table.Cell>
                                        {item.last_withdraw_at ? new Date(item.last_withdraw_at).toLocaleDateString("uk-UA") : "—"}
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                </TableCard.Root>
            </DefaultPage>
        </>
    );
};

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, color, isCurrency = true }: {
    icon: React.ElementType;
    label: string;
    value: number;
    color: "success" | "error" | "warning" | "brand";
    isCurrency?: boolean;
}) {
    const colors = {
        success: "text-fg-success-primary bg-success-secondary/20",
        error: "text-fg-error-primary bg-error-secondary/20",
        warning: "text-fg-warning-primary bg-warning-secondary/20",
        brand: "text-fg-brand-primary bg-brand-secondary/20",
    };

    return (
        <div className="flex items-center gap-3 rounded-xl border border-border-secondary bg-primary p-4 shadow-xs">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors[color]}`}>
                <Icon size={20} />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-fg-quaternary">{label}</span>
                <span className="text-lg font-bold text-fg-primary">
                    {isCurrency ? `${value.toLocaleString("uk-UA", { minimumFractionDigits: 0 })} ₴` : value}
                </span>
            </div>
        </div>
    );
}

/* ─── Bar Chart (pure CSS) ─── */
function BarChart({ months }: { months: MonthData[] }) {
    const maxVal = Math.max(...months.flatMap(m => [m.income, m.withdrawn]), 1);

    return (
        <div className="flex items-end gap-3 h-48">
            {months.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 w-full h-40">
                        {/* Income bar */}
                        <div className="flex-1 flex flex-col items-center justify-end h-full">
                            {m.income > 0 && (
                                <span className="text-[10px] text-fg-success-primary font-semibold mb-0.5">
                                    {m.income >= 1000 ? `${(m.income / 1000).toFixed(1)}k` : Math.round(m.income)}
                                </span>
                            )}
                            <div
                                className="w-full rounded-t-md bg-success-solid transition-all duration-500"
                                style={{ height: `${(m.income / maxVal) * 100}%`, minHeight: m.income > 0 ? "4px" : "0" }}
                            />
                        </div>
                        {/* Withdrawn bar */}
                        <div className="flex-1 flex flex-col items-center justify-end h-full">
                            {m.withdrawn > 0 && (
                                <span className="text-[10px] text-fg-error-primary font-semibold mb-0.5">
                                    {m.withdrawn >= 1000 ? `${(m.withdrawn / 1000).toFixed(1)}k` : Math.round(m.withdrawn)}
                                </span>
                            )}
                            <div
                                className="w-full rounded-t-md bg-error-solid transition-all duration-500"
                                style={{ height: `${(m.withdrawn / maxVal) * 100}%`, minHeight: m.withdrawn > 0 ? "4px" : "0" }}
                            />
                        </div>
                    </div>
                    <span className="text-xs text-fg-quaternary">{m.label}</span>
                </div>
            ))}
        </div>
    );
}

export default FinancePage;
