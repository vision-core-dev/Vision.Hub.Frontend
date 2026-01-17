import React, { useEffect } from "react";
import styles from "./Finance.module.css";
import {Plus, Undo2} from "lucide-react";
import Table from "@/shared/ui/table/Table.tsx";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api.ts";
import { safeDatetime } from "@/shared/utils/safeDate.ts";
import UserLabel from "@/shared/ui/user/UserLabel.tsx";
import type { UserType } from "@/shared/types/Users.ts";
import {Button} from "@/shared/ui/buttons/button.tsx";

interface Transaction {
    id: string;
    name: string;
    type: string; // "credit" | "withdraw" | etc.
    amount: number;
    transaction_at: string;
}

interface DataModel {
    transactions: Transaction[];
    users: UserType[];
}

const TransactionsList: React.FC = () => {
    const [data, setData] = React.useState<DataModel | null>(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const response = await api.get("/v1/Hub/Finance/GetTransactionsList");
            const result: DataModel = await response.json();
            if (response.ok) {
                setData(result);
            } else {
                console.error("Failed to fetch transactions data");
            }
        } catch (err) {
            console.error("Error fetching transactions data:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const returnElement = () => {
        return (
            <Button color="secondary"
                onClick={() => navigate("/finance")}
                iconLeading={Undo2}
            >
                Повернутись
            </Button>);
    }

    if (!data)
        return <DefaultPage title="Транзакції" isLoading={true} action={returnElement()} />;

    // 🔎 Для зручності створимо мапу користувачів за id
    const userMap = new Map<string, UserType>();
    data.users.forEach((u) => userMap.set(u.id, u));

    const columns = [
        {
            key: "transaction_at",
            label: "Дата і час",
            render: (v: string) => safeDatetime(v),
            sortable: true,
        },
        {
            key: "user_id",
            label: "Користувач",
            render: (v: string) => {
                const user = userMap.get(v);
                return user ? (
                    <UserLabel
                        user_id={user.id}
                        name={`${user.first_name || ""} ${user.last_name || ""}`}
                        avatar_url={user.avatar_url || undefined}
                    />
                ) : (
                    <span className={styles.unknownUser}>Невідомо</span>
                );
            },
        },
        {
            key: "name",
            label: "Назва",
        },
        {
            key: "type",
            label: "Тип",
            render: (v: string) => (
                <span
                    className={`${styles.status} ${
                        v === "income"
                            ? styles.green
                            : v === "withdrawal"
                                ? styles.blue
                                : styles.gray
                    }`}
                >
                    {v === "income"
                        ? "Надходження"
                        : v === "withdrawal"
                            ? "Вивід"
                            : v}
                </span>
            ),
            sortable: true,
        },
        {
            key: "amount",
            label: "Сума",
            render: (v: number) => `${v.toFixed(2)} ₴`,
            sortable: true,
        },
    ];

    return (
        <DefaultPage
            title="Транзакції акаунтів"
            action={
                <>
                    {returnElement()}
                    <Button
                        color="primary" iconLeading={Plus}
                        onClick={() => navigate("/finance/transactions/create")}
                    >
                        Додати транзакцію
                    </Button>
                </>
            }
        >
            <Table columns={columns} data={data.transactions } />
        </DefaultPage>
    );
};

export default TransactionsList;









