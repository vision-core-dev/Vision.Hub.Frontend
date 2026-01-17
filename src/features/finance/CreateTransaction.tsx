import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { Select } from "@/shared/ui/select/select";
import UserSelect from "@/shared/ui/user-select/UserSelect";
import type { Key } from "react-aria-components";

const CreateTransaction = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        transaction_at: "",
        name: "",
        type: "" as string,
        amount: "",
        users: [] as string[],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/v1/Hub/Finance/CreateTransaction", {
                ...formData,
                amount: Number(formData.amount),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Не вдалося створити транзакцію");
            }
            navigate("/finance/transactions/list");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DefaultPage title="Створення транзакції">
            <Button color="link-color" onClick={() => navigate("/finance/transactions/list")} iconLeading={ArrowLeft}>
                Назад до списку
            </Button>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mt-6">
                <Input
                    label="Дата транзакції"
                    type="datetime-local"
                    value={formData.transaction_at}
                    onChange={(value) => setFormData({ ...formData, transaction_at: value })}
                    isRequired
                />

                <Input
                    label="Назва транзакції"
                    type="text"
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    isRequired
                />

                <Select
                    value={formData.type}
                    onChange={(value: Key | null) => setFormData({ ...formData, type: value as string })}
                    placeholder="Тип транзакції"
                >
                    <Select.Item id="income" label="Income">income</Select.Item>
                    <Select.Item id="expense" label="Expense">expense</Select.Item>
                    <Select.Item id="withdrawal" label="Withdrawal">withdrawal</Select.Item>
                    <Select.Item id="deduction" label="Deduction">deduction</Select.Item>
                </Select>

                <Input
                    label="Сума"
                    type="number"
                    value={formData.amount}
                    onChange={(value) => setFormData({ ...formData, amount: value })}
                    isRequired
                />

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Користувачі ({formData.users.length})
                    </label>
                    <UserSelect onChange={(ids) => setFormData({ ...formData, users: ids })} />
                </div>

                {error && <div className="text-red-500">❌ {error}</div>}

                <Button type="submit" isLoading={loading} showTextWhileLoading>
                    Створити транзакцію
                </Button>
            </form>
        </DefaultPage>
    );
};

export default CreateTransaction;
