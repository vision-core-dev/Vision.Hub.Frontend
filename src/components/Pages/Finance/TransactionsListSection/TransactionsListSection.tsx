import React from "react";
import styles from "./TransactionsListSection.module.css";
import { ArrowUpRight, ArrowDownRight, HandCoins } from "lucide-react";
import {safeDatetime} from "../../../../utils/safeDate.ts";

export interface TransactionItem {
    id: string;
    name: string;
    type: "income" | "withdrawal" | "deduction" | "expense" | string;
    amount: number;
    transaction_at: string;
}

interface TransactionsListSectionProps {
    transactions: TransactionItem[];
}

const TransactionsListSection: React.FC<TransactionsListSectionProps> = ({ transactions }) => {
    const sortedList = [...transactions].sort(
        (a, b) => new Date(b.transaction_at).getTime() - new Date(a.transaction_at).getTime()
    );

    if (!transactions || transactions.length === 0) return null;

    return (
        <section className={styles.transactions}>
            <h3>Трансакції</h3>
            <div className={styles.list}>
                {sortedList.map((t) => (
                    <div
                        key={t.id}
                        className={`${styles.item} ${
                            t.type === "income"
                                ? styles.green
                                : t.type === "withdrawal"
                                    ? styles.blue
                                    : styles.red
                        }`}
                    >
                        <div className={styles.icon}>
                            {t.type === "income" ? (
                                <ArrowUpRight />
                            ) : t.type === "withdrawal" ? (
                                <HandCoins />
                            ) : (
                                <ArrowDownRight />
                            )}
                        </div>
                        <div className={styles.details}>
                            <p className={styles.desc}>{t.name}</p>
                            <span className={styles.date}>{safeDatetime(t.transaction_at)}</span>
                        </div>
                        <span className={styles.amount}>
                            {t.type === "income" ? "+" : ""}
                            {t.amount.toFixed(2)} ₴
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TransactionsListSection;
