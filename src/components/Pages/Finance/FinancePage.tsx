import React from "react";
import styles from "./Finance.module.css";
import {ArrowLeftRight, HandCoins, Plus} from "lucide-react";
import Button from "../../basic/Button/Button.tsx";
import Table from "../../basic/Table/Table.tsx";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import {useNavigate} from "react-router-dom";

const FinancePage: React.FC = () => {
    const navigate = useNavigate();
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
        <>
            <DefaultPage title={`0.00 ₴`}
                         action={(
                             <>
                                 <Button variant="primary" adaptive={true} onClick={() => navigate('/finance/withdraws/list')}>
                                     <HandCoins size={18} /> Запити на вивід
                                 </Button>
                                 <Button variant="primary" adaptive={true} onClick={() => navigate('/finance/transactions/list')}>
                                     <ArrowLeftRight size={18} /> Транзакції
                                 </Button>
                                 <Button variant="primary" adaptive={true} onClick={() => navigate('/finance/spendings/add-spending')}>
                                     <Plus size={18} /> Додати витрати
                                 </Button>
                             </>
                         )}>
                <Table columns={withdrawColumns} data={[]} />
            </DefaultPage>
        </>
    );
};

export default FinancePage;
