import React, { useState } from "react";
import styles from "./SalaryPage.module.css";
import {ArrowUpRight, ArrowDownRight, HandCoins} from "lucide-react";
import SalaryWithdrawModal from "./SalaryWithdrawModal.tsx";
import Button from "../../basic/Button/Button.tsx";
import Table from "../../basic/Table/Table.tsx";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";

interface Transaction {
    id: string;
    type: "credit" | "withdraw" | "deduction";
    amount: number;
    name: string;
    created_at: string;
}

interface WithdrawRequest {
    id: string;
    amount: number;
    status: "pending" | "approved" | "paid" | "rejected";
    reason?: string | null;
    created_at: string;
}

interface BalanceData {
    balance: number;
    withdrawable: number;
    withdrawn_total: number;
    transactions: Transaction[];
    withdraw_requests: WithdrawRequest[];
}

const SalaryPage: React.FC = () => {
    const [data, ] = useState<BalanceData | null>(null);
    const [showModal, setShowModal] = useState(false);

    // const testData: BalanceData = {
        // balance: 4210.75,
        // withdrawable: 2000.0,
        // withdrawn_total: 8700.0,
        // transactions: [
        //     {
        //         id: "1",
        //         type: "credit",
        //         amount: 1500,
        //         name: "Завдання: Дашборд HR модуль",
        //         created_at: "2025-10-20T15:30:00Z",
        //     },
        //     {
        //         id: "2",
        //         type: "withdraw",
        //         amount: 1000,
        //         name: "Вивід на картку",
        //         created_at: "2025-09-30T10:00:00Z",
        //     },
        //     {
        //         id: "3",
        //         type: "deduction",
        //         amount: 400,
        //         name: "Корекція через невиконане завдання",
        //         created_at: "2025-08-10T18:00:00Z",
        //     },
        // ],
        // withdraw_requests: [
        //     {
        //         id: "w1",
        //         amount: 1000,
        //         status: "paid",
        //         created_at: "2025-09-30T10:00:00Z",
        //     },
        //     {
        //         id: "w2",
        //         amount: 1200,
        //         status: "pending",
        //         created_at: "2025-10-27T11:20:00Z",
        //     },
        //     {
        //         id: "w3",
        //         amount: 900,
        //         status: "rejected",
        //         reason: "Перевищення ліміту на вивід (max 1500 ₴)",
        //         created_at: "2025-10-15T09:00:00Z",
        //     },
        // ],
    // };

    // useEffect(() => {
    //     setTimeout(() => setData(testData), 500);
    // }, []);

    if (!data)
        return <DefaultPage title="Моя зарплата" isLoading={true} />;

    const withdrawColumns = [
        {
            key: "created_at",
            label: "Дата",
            render: (v: string) => new Date(v).toLocaleDateString("uk-UA"),
        },
        {
            key: "amount",
            label: "Сума",
            render: (v: number) => `${v.toFixed(2)} ₴`,
        },
        {
            key: "status",
            label: "Статус",
            render: (v: string) => (
                <span className={`${styles.status} ${styles[v]}`}>
                    {v === "pending"
                        ? "Очікує"
                        : v === "approved"
                            ? "Прийнято"
                            : v === "paid"
                                ? "Перераховано"
                                : "Відхилено"}
                </span>
            ),
        },
        {
            key: "reason",
            label: "Причина",
            render: (v: string) => <span className={styles.requestDescription}>{v}</span>,
        },
    ];

    return (
        <DefaultPage title="Моя зарплата"
            action={(
                <Button variant="primary" adaptive={true} onClick={() => setShowModal(true)}>
                    <HandCoins size={18} /> Вивести гроші
                </Button>
            )}
        >
            <div className={styles.container}>

                {/* Баланс */}
                <section className={styles.cards}>
                    <div className={styles.card}>
                        <p className={styles.label}>Поточний баланс</p>
                        <h2 className={styles.green}>{data.withdrawable.toFixed(2)} ₴</h2>
                    </div>
                    <div className={styles.card}>
                        <p className={styles.label}>Вже вивів</p>
                        <h2 className={styles.blue}>{data.withdrawn_total.toFixed(2)} ₴</h2>
                    </div>
                </section>

                {/* Трансакції */}
                <section className={styles.transactions}>
                    <h3>Трансакції</h3>
                    <div className={styles.list}>
                        {data.transactions.map((t) => (
                            <div
                                key={t.id}
                                className={`${styles.item} ${
                                    t.type === "credit"
                                        ? styles.green
                                        : t.type === "withdraw"
                                            ? styles.blue
                                            : styles.red
                                }`}
                            >
                                <div className={styles.icon}>
                                    {t.type === "credit"
                                        ? <ArrowUpRight />
                                        : t.type === "withdraw"
                                            ? <HandCoins />
                                            : <ArrowDownRight />
                                    }
                                </div>
                                <div className={styles.details}>
                                    <p className={styles.desc}>{t.name}</p>
                                    <span className={styles.date}>
                                        {new Date(t.created_at).toLocaleDateString("uk-UA")}
                                    </span>
                                </div>
                                <span className={styles.amount}>
                                    {t.type === "credit" ? "+" : "-"}
                                    {t.amount.toFixed(2)} ₴
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Запити на вивід */}
                <section className={styles.withdraws}>
                    <h3>Запити на вивід</h3>
                    <Table columns={withdrawColumns} data={data.withdraw_requests} />
                </section>

                {showModal && (
                    <SalaryWithdrawModal
                        onClose={() => setShowModal(false)}
                        withdrawLimit={1500}
                    />
                )}
            </div>
        </DefaultPage>
    );
};

export default SalaryPage;
