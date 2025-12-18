import React, { useEffect } from "react";
import styles from "./Finance.module.css";
import {ArrowLeftRight, HandCoins, Plus} from "lucide-react";
import Button from "../../basic/Button/Button.tsx";
import Table from "../../basic/Table/Table.tsx";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import {useNavigate} from "react-router-dom";
import UserLabel from "../../basic/User/UserLabel.tsx";
import type { UserType } from "../../../types/Users.ts";
import { api } from "../../../utils/api.ts";

interface NoWithdrawnDataRes {
    items: Array<{
        user: UserType;
        amount: number;
        last_withdraw_amount: number;
        last_withdraw_at: string;
    }>;
}

const FinancePage: React.FC = () => {
    const navigate = useNavigate();

    const [noWithdrawnData, setNoWithdrawnData] = React.useState<Array<any>>([]);

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

    const nowithdrawnColumns = [
        {
            key: "user",
            label: "Користувач",
            render: (user: UserType) => <UserLabel
                        user_id={user.id}
                        name={`${user.first_name || ""} ${user.last_name || ""}`}
                        avatar_url={user.avatar_url || undefined}
                    />,
        },
        {
            key: "amount",
            label: "Сума",
            render: (v: number) => `${v.toFixed(2)} ₴`,
            sortable: true,
        },
        {
            key: "last_withdraw_amount",
            label: "Остання сума виплати",
            render: (v: number) => `${v.toFixed(2)} ₴`,
            sortable: true,
        },
        {
            key: "last_withdraw_at",
            label: "Остання виплата",
            render: (v: string) => new Date(v).toLocaleDateString("uk-UA") ?? "—",
            sortable: true,
        }
    ]

    useEffect(() => {
        const fetchData = async () => {
            const res = await api.get("/v1/Hub/Finance/GetUnwithdrawnList");
            const data = (await res.json()) as NoWithdrawnDataRes;
            setNoWithdrawnData(data.items);
        };
        fetchData();
    }, []);


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
            <DefaultPage title="Невиплачені кошти">
                <Table columns={nowithdrawnColumns} data={noWithdrawnData} />
            </DefaultPage>
        </>
    );
};

export default FinancePage;
