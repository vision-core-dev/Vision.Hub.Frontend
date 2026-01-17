import React, { useEffect } from "react";
import styles from "./Finance.module.css";
import { Plus, Undo2 } from "lucide-react";
import { Table } from "@/shared/components/table/table";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api.ts";
import { safeDatetime } from "@/shared/utils/safeDate.ts";
import type { UserType } from "@/shared/types/Users.ts";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { AvatarLabelGroup } from "@/shared/ui/avatar/avatar-label-group";

interface Transaction {
    id: string;
    user_id: string;
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
            <div className="min-w-full overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
                <Table aria-label="Транзакції">
                    <Table.Header>
                        <Table.Head isRowHeader>Дата і час</Table.Head>
                        <Table.Head>Користувач</Table.Head>
                        <Table.Head>Назва</Table.Head>
                        <Table.Head>Тип</Table.Head>
                        <Table.Head>Сума</Table.Head>
                    </Table.Header>
                    <Table.Body items={data.transactions}>
                        {(item: Transaction & { user_id: string }) => (
                            <Table.Row id={item.id}>
                                <Table.Cell>{safeDatetime(item.transaction_at)}</Table.Cell>
                                <Table.Cell>
                                    {(() => {
                                        const user = userMap.get(item.user_id);
                                        return user ? (
                                            <AvatarLabelGroup
                                                src={user.avatar_url || undefined}
                                                title={`${user.first_name || ""} ${user.last_name || ""}`}
                                                size="sm"
                                                onClick={() => navigate(`/users/u/${user.id}`)}
                                            />
                                        ) : (
                                            <span className={styles.unknownUser}>Невідомо</span>
                                        );
                                    })()}
                                </Table.Cell>
                                <Table.Cell>{item.name}</Table.Cell>
                                <Table.Cell>
                                    <span
                                        className={`${styles.status} ${item.type === "income"
                                            ? styles.green
                                            : item.type === "withdrawal"
                                                ? styles.blue
                                                : styles.gray
                                            }`}
                                    >
                                        {item.type === "income"
                                            ? "Надходження"
                                            : item.type === "withdrawal"
                                                ? "Вивід"
                                                : item.type}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>{item.amount.toFixed(2)} ₴</Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </div>
        </DefaultPage>
    );
};

export default TransactionsList;









