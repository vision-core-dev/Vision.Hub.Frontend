import React, { useEffect, useState } from "react";
import { HandCoins } from "lucide-react";

import DefaultPage from "../../basic/DefaultPage/DefaultPage";
import Table from "../../basic/Table/Table";

import SalaryWithdrawModal from "./SalaryWithdrawModal";
import TransactionsListSection from "../Finance/TransactionsListSection/TransactionsListSection";

import { MetricsSimple, MetricsChart04 } from "@/ui/application/metrics/metrics";
import { api } from "@/utils/api";
import { safeDatetime } from "@/utils/safeDate";
import {Button} from "@/ui/base/buttons/button.tsx";
import * as Alerts from "@/ui/application/alerts/alerts.tsx";

/* ===================== TYPES ===================== */

export interface Transaction {
    id: string;
    type: "income" | "withdrawal" | "deduction";
    amount: number;
    name: string;
    transaction_at: string;
}

interface WithdrawRequest {
    id: string;
    amount: number;
    status: "pending" | "approved" | "paid" | "rejected";
    description?: string | null;
    reason?: string | null;
    comment?: string | null;
    created_at: string;
}

interface BalanceData {
    balance: number;
    withdrawable: number;
    withdrawn_total: number;
    transactions: Transaction[];
    withdraw_requests: WithdrawRequest[];
}

/* ===================== HELPERS ===================== */

const isSameMonth = (date: Date, ref: Date) =>
    date.getMonth() === ref.getMonth() &&
    date.getFullYear() === ref.getFullYear();

const percentChange = (current: number, prev: number) => {
    if (prev === 0) return 100;
    return Math.round(((current - prev) / prev) * 100);
};

/* ===================== PAGE ===================== */

const SalaryPage: React.FC = () => {
    const [data, setData] = useState<BalanceData | null>(null);
    const [showModal, setShowModal] = useState(false);

    const fetchBalanceData = async () => {
        try {
            const res = await api.get("/v1/Hub/Finance/GetSalaryInfo");
            const json = await res.json();
            if (res.ok) setData(json);
        } catch (e) {
            console.error("Salary fetch error", e);
        }
    };

    useEffect(() => {
        fetchBalanceData();
    }, []);

    if (!data) {
        return <DefaultPage title="Моя зарплата" isLoading />;
    }

    /* ===================== METRICS LOGIC ===================== */

    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const incomeThisMonth = data.transactions.filter(
        t =>
            t.type === "income" &&
            isSameMonth(new Date(t.transaction_at), now)
    );

    const incomePrevMonth = data.transactions.filter(
        t =>
            t.type === "income" &&
            isSameMonth(new Date(t.transaction_at), prevMonth)
    );

    const currentMonthTotal = incomeThisMonth.reduce((s, t) => s + t.amount, 0);
    const prevMonthTotal = incomePrevMonth.reduce((s, t) => s + t.amount, 0);

    const change = percentChange(currentMonthTotal, prevMonthTotal);

    const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
    ).getDate();

    const chartData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const sum = incomeThisMonth
            .filter(t => new Date(t.transaction_at).getDate() === day)
            .reduce((s, t) => s + t.amount, 0);

        return { value: sum };
    });

    /* ===================== TABLE ===================== */

    const withdrawColumns = [
        {
            key: "created_at",
            label: "Дата",
            render: (v: string) => safeDatetime(v),
        },
        {
            key: "amount",
            label: "Сума",
            render: (v: number) => `${v.toFixed(2)} ₴`,
        },
        {
            key: "status",
            label: "Статус",
            render: (v: string) =>
                ({
                    pending: "Очікує",
                    approved: "Прийнято",
                    paid: "Виплачено",
                    rejected: "Відхилено",
                }[v]),
        },
        {
            key: "comment",
            label: "Коментар",
            render: (v: string) => v || "—",
        },
    ];

    /* ===================== RENDER ===================== */

    return (
        <DefaultPage
            title="Моя зарплата"
            action={
                data.balance > 0 && (
                    <Button
                        color="primary"
                        onClick={() => setShowModal(true)}
                        iconLeading={HandCoins}
                    >
                        Вивести гроші
                    </Button>
                )
            }
        >
            <div className="flex flex-col gap-6 w-full">

                {/* === MAIN METRICS === */}
                <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <MetricsSimple
                        title={`${data.balance.toFixed(2)} ₴`}
                        subtitle="Поточний баланс"
                        type="modern"
                        trend={data.balance > 0 ? "positive" : "negative"}
                        footer={null}
                    />

                    <MetricsSimple
                        title={`${(data.balance + data.withdrawn_total)} ₴`}
                        subtitle="Всього заробив"
                        type="modern"
                        trend="positive"
                        footer={null}
                    />

                    <MetricsSimple
                        title={`${data.withdrawn_total} ₴`}
                        subtitle="Вже вивів"
                        type="modern"
                        trend="positive"
                        footer={null}
                    />
                </section>

                {/* === MONTH ACTIVITY === */}
                <section className="w-full">
                    <MetricsChart04
                        title={`${currentMonthTotal} ₴`}
                        subtitle="Заробіток за місяць"
                        change={`${Math.abs(change)} ₴`}
                        changeTrend={change >= 0 ? "positive" : "negative"}
                        changeDescription="порівняно з минулим місяцем"
                        chartData={chartData}
                    />
                </section>

                <Alerts.AlertFloating
                    color="error"
                    title="Як вивести кошти?"
                    description="На даний момент виплати зарплати здіснюються в ручному форматі. Ми самі зв'яжемось під час виплати ЗП."
                />

                {/* === TRANSACTIONS === */}
                <TransactionsListSection transactions={data.transactions} />

                {/* === WITHDRAW REQUESTS === */}
                {data.withdraw_requests.length > 0 && (
                    <section className="flex flex-col gap-3">
                        <h3 className="text-lg font-semibold">
                            Запити на вивід
                        </h3>
                        <Table
                            columns={withdrawColumns}
                            data={data.withdraw_requests}
                        />
                    </section>
                )}

                <SalaryWithdrawModal
                    isOpen={showModal}
                    onOpenChange={(open) => {
                        if (!open) {
                            setShowModal(false);
                        }
                    }}
                    withdrawLimit={Math.min(
                        data.balance,
                        data.withdrawable
                    )}
                    onSuccess={fetchBalanceData}
                />
            </div>
        </DefaultPage>
    );
};

export default SalaryPage;
