import React, {useEffect, useState} from "react";
import styles from "./SalaryPage.module.css";
import {HandCoins} from "lucide-react";
import SalaryWithdrawModal from "./SalaryWithdrawModal.tsx";
import Button from "../../basic/Button/Button.tsx";
import Table from "../../basic/Table/Table.tsx";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import {api} from "../../../utils/api.ts";
import {safeDatetime} from "../../../utils/safeDate.ts";
import TransactionsListSection from "../Finance/TransactionsListSection/TransactionsListSection.tsx";

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

const SalaryPage: React.FC = () => {
    const [data, setData] = useState<BalanceData | null>(null);
    const [showModal, setShowModal] = useState(false);

    const fetchBalanceData = async () => {
        try {
            setData(null);

            const response = await api.get("/v1/Hub/Finance/GetSalaryInfo");
            const result = await response.json();
            if (response.ok) {
                setData(result);
            } else {
                console.error("Failed to fetch balance data:", result.message);
            }
        } catch (error) {
            console.error("Error fetching balance data:", error);
        }
    }

    useEffect(() => {
        fetchBalanceData();
    }, []);

    if (!data)
        return <DefaultPage title="Моя зарплата" isLoading={true} />;

    const withdrawColumns = [
        {
            key: "created_at",
            label: "Дата і час",
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
            key: "comment",
            label: "Коментар",
            render: (v: string) => <span className={styles.requestDescription}>{v || "—"}</span>,
        },
        {
            key: "reason",
            label: "Причина відхилення",
            render: (v: string, row: WithdrawRequest) => <span className={styles.requestDescription}>{row.status == "pending" ? "—" : (row.status == "rejected" ? (v || "Не вказано") : "—")}</span>,
        },
    ];

    return (
        <DefaultPage title="Моя зарплата"
            action={data.balance > 0 && (
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
                        <h2 className={styles.green}>{data.balance.toFixed(2)} ₴</h2>
                    </div>

                    <div className={styles.card}>
                        <p className={styles.label}>Всього заробив</p>
                        <h2 className={styles.green}>{(data.balance + data.withdrawn_total).toFixed(2)} ₴</h2>
                    </div>

                    <div className={styles.card}>
                        <p className={styles.label}>Вже вивів</p>
                        <h2 className={styles.blue}>{data.withdrawn_total.toFixed(2)} ₴</h2>
                    </div>
                </section>

                {/* Трансакції */}
                <TransactionsListSection transactions={data.transactions} />

                {/* Запити на вивід */}
                {data.withdraw_requests.length > 0 && (
                    <section className={styles.withdraws}>
                        <h3>Запити на вивід</h3>
                        <Table columns={withdrawColumns} data={data.withdraw_requests} />
                    </section>
                )}

                {showModal && (
                    <SalaryWithdrawModal
                        onClose={() => setShowModal(false)}
                        withdrawLimit={Math.min(data.balance, data.withdrawable)}
                        onSuccess={() => fetchBalanceData()}
                    />
                )}
            </div>
        </DefaultPage>
    );
};

export default SalaryPage;
