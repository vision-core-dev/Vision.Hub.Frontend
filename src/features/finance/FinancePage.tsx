import React, { useEffect } from "react";
import styles from "./Finance.module.css";
import {ArrowLeftRight, HandCoins, Plus} from "lucide-react";
import Table from "@/shared/ui/table/Table.tsx";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import {useNavigate} from "react-router-dom";
import UserLabel from "@/shared/ui/user/UserLabel.tsx";
import type { UserType } from "@/shared/types/Users.ts";
import { api } from "@/shared/utils/api.ts";
import {Button} from "@/shared/ui/buttons/button.tsx";

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
            render: (v: string) => new Date(v).toLocaleDateString("uk-UA") || "—",
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
                                <Button color="primary" onClick={() => navigate('/finance/withdraws/list')} iconLeading={HandCoins}>
                                    Запити на вивід
                                </Button>
                                <Button color="primary" onClick={() => navigate('/finance/transactions/list')} iconLeading={ArrowLeftRight}>
                                    Транзакції
                                </Button>
                                <Button color="primary" onClick={() => navigate('/finance/spendings/add-spending')} iconLeading={Plus}>
                                    Додати витрати
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









