import React, { useState } from "react";
import { Plus, HandCoins } from "lucide-react";
import { api } from "@/shared/utils/api";
import { ButtonUtility } from "@/shared/ui/buttons/button-utility.tsx";
import { Button } from "@/shared/ui/buttons/button.tsx";
import AccrualItem from "../AccrualItem/AccrualItem";
import type { TaskUser } from "../TaskDetailsModal";

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

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Кому:</label>
                        <select
                            className="w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary outline-none"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="" disabled>Оберіть учасника</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500">Сума (UAH):</label>
                        <input
                            type="number"
                            className="w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

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
