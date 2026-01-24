import React, { useEffect } from "react";

import { ArrowLeftRight, HandCoins, Plus } from "lucide-react";
import { Table } from "@/shared/components/table/table";
import DefaultPage from "@/shared/ui/default-page/DefaultPage.tsx";
import { useNavigate } from "react-router-dom";
import type { UserType } from "@/shared/types/Users.ts";
import { api } from "@/shared/utils/api.ts";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { AvatarLabelGroupWithDropdown } from "@/shared/ui/avatar";

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
                <div className="min-w-full overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
                    <Table aria-label="Історія виплат">
                        <Table.Header>
                            <Table.Head isRowHeader>Дата</Table.Head>
                            <Table.Head>Сума</Table.Head>
                            <Table.Head>Статус</Table.Head>
                            <Table.Head>Причина</Table.Head>
                        </Table.Header>
                        <Table.Body items={[]} renderEmptyState={() => (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-tertiary">
                                <p>Немає даних</p>
                            </div>
                        )}>
                            {/* Empty items, this won't be called */}
                            {(_item: any) => (<Table.Row><Table.Cell /></Table.Row>)}
                        </Table.Body>
                    </Table>
                </div>
            </DefaultPage>
            <DefaultPage title="Невиплачені кошти">
                <div className="min-w-full overflow-hidden rounded-xl border border-secondary bg-primary shadow-sm">
                    <Table aria-label="Невиплачені кошти">
                        <Table.Header>
                            <Table.Head isRowHeader>Користувач</Table.Head>
                            <Table.Head>Сума</Table.Head>
                            <Table.Head>Остання сума виплати</Table.Head>
                            <Table.Head>Остання виплата</Table.Head>
                        </Table.Header>
                        <Table.Body items={noWithdrawnData} renderEmptyState={() => (
                            <div className="flex flex-col items-center justify-center p-8 text-center text-tertiary">
                                <p>Немає даних</p>
                            </div>
                        )}>
                            {(item: {
                                user: UserType;
                                amount: number;
                                last_withdraw_amount: number;
                                last_withdraw_at: string;
                            }) => (
                                <Table.Row id={item.user.id}>
                                    <Table.Cell>
                                        <AvatarLabelGroupWithDropdown
                                            src={item.user.avatar_url || undefined}
                                            title={`${item.user.first_name || ""} ${item.user.last_name || ""}`}
                                            size="sm"
                                            userId={item.user.id}
                                            onViewProfile={() => navigate(`/users/u/${item.user.id}`)}
                                        />
                                    </Table.Cell>
                                    <Table.Cell>{item.amount.toFixed(2)} ₴</Table.Cell>
                                    <Table.Cell>{item.last_withdraw_amount.toFixed(2)} ₴</Table.Cell>
                                    <Table.Cell>
                                        {item.last_withdraw_at ? new Date(item.last_withdraw_at).toLocaleDateString("uk-UA") : "—"}
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                </div>
            </DefaultPage>
        </>
    );
};

export default FinancePage;









