import React from "react";
import {ArrowLeft} from "lucide-react";
import Button from "../../basic/Button/Button.tsx";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import {useNavigate} from "react-router-dom";
import SmartForm from "../../basic/SmartForm/SmartForm.tsx";
import {api} from "../../../utils/api.ts";

const TransactionsList: React.FC = () => {
    const navigate = useNavigate();

    return (
        <>
            <DefaultPage title="Створення транзакції">
                <Button variant="link" onClick={() => navigate("/finance/transactions/list")}>
                    <ArrowLeft size={20} /> Назад до списку
                </Button>
                <SmartForm
                    submitText="Створити транзакцію"
                    fields={[
                        { name: "transaction_at", label: "Дата транзакції", type: "datetime-local", required: true },
                        { name: "name", label: "Назва транзакції", type: "text", required: true },
                        { name: "type", label: "Тип транзакції", type: "select", options: ["income", "expense", "withdrawal", "deduction"], required: true },
                        { name: "amount", label: "Сума", type: "number", required: true },
                        { name: "users", label: "Користувач", type: "user-select", required: true },
                    ]}
                    onSubmit={async (values) => {
                        const res = await api.post("/v1/Hub/Finance/CreateTransaction", values);
                        if (res.ok) {
                            navigate("/finance/transactions/list");
                        } else {
                            const err = await res.json();
                            throw new Error(err.detail || "Не вдалося створити транзакцію");
                        }
                    }}
                />
            </DefaultPage>
        </>
    );
};

export default TransactionsList;
