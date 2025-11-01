import React, {useEffect, useState} from "react";
import styles from "./SalaryPage.module.css";
import {ArrowUpRight, ArrowDownRight, HandCoins} from "lucide-react";
import SalaryWithdrawModal from "./SalaryWithdrawModal.tsx";
import Button from "../../basic/Button/Button.tsx";
import Table from "../../basic/Table/Table.tsx";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import {api} from "../../../utils/api.ts";

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
    description?: string | null;
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
    const [data, setData] = useState<BalanceData | null>(null);
    const [showModal, setShowModal] = useState(false);

    const fetchBalanceData = async () => {
        try {
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
            label: "Дата",
            render: (v: string) => new Date(v).toLocaleDateString("uk-UA"),
        },
        {
            key: "amount",
            label: "Сума",
            render: (v: number) => `${v.toFixed(2)} ₴`,
        },
        {
            key: "description",
            label: "Коментар",
            render: (v: string) => <span className={styles.requestDescription}>{v || "—"}</span>,
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
                        <h2 className={styles.green}>{data.balance.toFixed(2)} ₴</h2>
                    </div>
                    <div className={styles.card}>
                        <p className={styles.label}>Вже вивів</p>
                        <h2 className={styles.blue}>{data.withdrawn_total.toFixed(2)} ₴</h2>
                    </div>
                </section>

                {/* Трансакції */}
                {data.transactions.length > 0 && (
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
                )}

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
                    />
                )}
            </div>
        </DefaultPage>
    );
};

export default SalaryPage;
