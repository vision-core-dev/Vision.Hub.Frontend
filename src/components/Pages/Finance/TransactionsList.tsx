import React, { useEffect } from "react";
import styles from "./Finance.module.css";
import {Plus, Undo2} from "lucide-react";
import Button from "../../basic/Button/Button.tsx";
import Table from "../../basic/Table/Table.tsx";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import { useNavigate } from "react-router-dom";
import { api } from "../../../utils/api.ts";
import { safeDatetime } from "../../../utils/safeDate.ts";
import UserLabel from "../../basic/User/UserLabel.tsx";
import type { UserType } from "../../../types/Users.ts";

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
        return (<Button variant="secondary" adaptive={true}
            onClick={() => navigate("/finance")}
        ><Undo2 /> Повернутись</Button>);
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
                        v === "credit"
                            ? styles.green
                            : v === "withdraw"
                                ? styles.blue
                                : styles.gray
                    }`}
                >
                    {v === "credit"
                        ? "Надходження"
                        : v === "withdraw"
                            ? "Вивід"
                            : v}
                </span>
            ),
        },
        {
            key: "amount",
            label: "Сума",
            render: (v: number) => `${v.toFixed(2)} ₴`,
        },
    ];

    return (
        <DefaultPage
            title="Транзакції акаунтів"
            action={
                <>
                    {returnElement()}
                    <Button
                        variant="primary"
                        adaptive={true}
                        onClick={() => navigate("/finance/transactions/create")}
                    >
                        <Plus size={18} /> Додати транзакцію
                    </Button>
                </>
            }
        >
            <Table columns={columns} data={data.transactions} />
        </DefaultPage>
    );
};

export default TransactionsList;
