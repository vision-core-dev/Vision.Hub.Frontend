import React, { useState } from "react";
import { Plus, HandCoins, ChevronDown } from "lucide-react";
import { Dropdown } from "@/shared/ui/base/dropdown/dropdown";
import { api } from "@/shared/utils/api";
import { ButtonUtility } from "@/shared/ui/buttons/button-utility.tsx";
import { Button } from "@/shared/ui/buttons/button.tsx";
import { Avatar } from "@/shared/ui/avatar/avatar";
import AccrualItem from "../AccrualItem/AccrualItem";
import type { TaskUser } from "../TaskDetailsModal";
import { Input } from "@/shared/ui/input/input";
import { Select } from "@/shared/ui/select/select";

/* ===================== TYPES ===================== */

export interface Accrual {
    id: string;
    user: TaskUser;
    amount: number;
    created_at: string;
}

interface Props {
    taskId: string;
    accruals: Accrual[];
    users: TaskUser[]; // Available users to pay
    onUpdate?: (list: Accrual[]) => void;
}

/* ===================== COMPONENT ===================== */

const AccrualsSection: React.FC<Props> = ({ taskId, accruals = [], users, onUpdate }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!selectedUserId || !amount) return;

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return;

        setLoading(true);
        try {
            // Pseudo-endpoint based on convention
            const res = await api.post(`/v1/Hub/Tasks/${taskId}/Accruals/Create`, {
                user_id: selectedUserId,
                amount: numAmount
            });

            if (res.ok) {
                const data = await res.json();
                // Construct new accrual from response or optimistically
                const user = users.find(u => u.id === selectedUserId)!;
                const newAccrual: Accrual = {
                    id: data.id || crypto.randomUUID(),
                    user,
                    amount: numAmount,
                    created_at: new Date().toISOString()
                };

                onUpdate?.([...accruals, newAccrual]);
                setIsCreating(false);
                setAmount("");
                setSelectedUserId("");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Виплати</h3>
                {!isCreating && (
                    <ButtonUtility
                        size="sm"
                        onClick={() => setIsCreating(true)}
                        icon={<Plus size={16} />}
                    />
                )}
            </div>

            {/* LIST */}
            {accruals.length > 0 && (
                <div className="flex flex-col gap-2">
                    {accruals.map(acc => (
                        <AccrualItem key={acc.id} user={acc.user} amount={acc.amount} />
                    ))}
                </div>
            )}

            {accruals.length === 0 && !isCreating && (
                <div className="text-sm text-gray-400 italic">Немає виплат</div>
            )}

            {/* CREATE FORM */}
            {isCreating && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2">
                        <HandCoins className="text-primary" size={20} />
                        <span className="text-sm font-medium">Нова виплата</span>
                    </div>

                    <Select
                        label="Кому:"
                        placeholder="Оберіть учасника"
                        value={selectedUserId}
                    >
                        {users.map(u => (
                            <Select.Item key={u.id} id={u.id} textValue={`${u.first_name} ${u.last_name}`} avatarUrl={u.avatar_url}>
                                {u.first_name} {u.last_name}
                            </Select.Item>
                        ))}
                    </Select>

                    <Input
                        label="Сума (UAH):"
                        placeholder="Введіть суму"
                        value={amount}
                        onChange={(value) => setAmount(value)}
                    />

                    <div className="flex gap-2 justify-end mt-2">
                        <Button color="tertiary" size="sm" onClick={() => setIsCreating(false)}>
                            Скасувати
                        </Button>
                        <Button
                            color="primary"
                            size="sm"
                            onClick={handleCreate}
                            disabled={!selectedUserId || !amount || loading}
                            isLoading={loading}
                        >
                            Створити
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AccrualsSection;
