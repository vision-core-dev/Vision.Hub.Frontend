import React, { useState } from "react";
import { Plus, HandCoins } from "lucide-react";

import { api } from "@/shared/utils/api";
import { ButtonUtility } from "@/shared/ui/buttons/button-utility.tsx";
import { Button } from "@/shared/ui/buttons/button.tsx";

import AccrualItem from "../AccrualItem/AccrualItem";
import type { TaskUser } from "../TaskDetailsModal";
import { Input } from "@/shared/ui/input/input";
import { Select } from "@/shared/ui/select/select";
import { useAuth } from "@/core/auth/AuthContext";

/* ===================== TYPES ===================== */

export interface Accrual {
    id: string;
    user: TaskUser;
    name?: string;
    amount: number;
    created_at: string;
}

interface Props {
    taskId: string;
    accruals: Accrual[];
    users: TaskUser[]; // Available users to pay
    onUpdate?: (list: Accrual[]) => void;
    isReadOnly?: boolean;
}

/* ===================== COMPONENT ===================== */

const AccrualsSection: React.FC<Props> = ({ taskId, accruals = [], users, onUpdate, isReadOnly = false }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [accrualName, setAccrualName] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const { role: currentRole } = useAuth();
    const canManageAccruals = currentRole?.order !== undefined && currentRole.order <= 3;

    const handleCreate = async () => {
        if (!selectedUserId || !amount) return;

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return;

        setLoading(true);
        try {
            const res = await api.post(`/v1/Hub/Tasks/${taskId}/Accruals/Create`, {
                user_id: selectedUserId,
                amount: numAmount,
                name: accrualName || undefined,
            });

            if (res.ok) {
                const data = await res.json();
                const user = users.find(u => u.id === selectedUserId)!;
                const newAccrual: Accrual = {
                    id: data.id || crypto.randomUUID(),
                    user,
                    name: data.name || accrualName || undefined,
                    amount: numAmount,
                    created_at: new Date().toISOString()
                };

                onUpdate?.([...accruals, newAccrual]);
                setIsCreating(false);
                setAmount("");
                setAccrualName("");
                setSelectedUserId("");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAccrual = async (accrualId: string, data: { amount?: number; name?: string }) => {
        try {
            const res = await api.post(`/v1/Hub/Tasks/${taskId}/Accruals/${accrualId}/Update`, data);
            if (res.ok) {
                const updated = await res.json();
                const newList = accruals.map(acc =>
                    acc.id === accrualId
                        ? {
                            ...acc,
                            amount: updated.amount ?? acc.amount,
                            name: updated.name ?? acc.name,
                        }
                        : acc
                );
                onUpdate?.(newList);
            }
        } catch (e) {
            console.error("Failed to update accrual", e);
        }
    };

    const handleDeleteAccrual = async (accrualId: string) => {
        try {
            const res = await api.post(`/v1/Hub/Tasks/${taskId}/Accruals/${accrualId}/Delete`);
            if (res.ok) {
                onUpdate?.(accruals.filter(acc => acc.id !== accrualId));
            }
        } catch (e) {
            console.error("Failed to delete accrual", e);
        }
    };

    const totalAmount = accruals.reduce((sum, acc) => sum + acc.amount, 0);

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Виплати</h3>
                    {accruals.length > 0 && (
                        <span className="text-xs text-gray-400 font-medium">
                            ({totalAmount > 0 ? "+" : ""}{totalAmount} ₴)
                        </span>
                    )}
                </div>
                {!isCreating && canManageAccruals && !isReadOnly && (
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
                        <AccrualItem
                            key={acc.id}
                            id={acc.id}
                            taskId={taskId}
                            user={acc.user}
                            name={acc.name}
                            amount={acc.amount}
                            canEdit={canManageAccruals && !isReadOnly}
                            onUpdate={handleUpdateAccrual}
                            onDelete={handleDeleteAccrual}
                        />
                    ))}
                </div>
            )}

            {accruals.length === 0 && !isCreating && (
                <div className="text-sm text-gray-400 italic">Немає виплат</div>
            )}

            {/* CREATE FORM */}
            {isCreating && !isReadOnly && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2">
                        <HandCoins className="text-primary" size={20} />
                        <span className="text-sm font-medium">Нова виплата</span>
                    </div>

                    <Select
                        label="Кому:"
                        placeholder="Оберіть учасника"
                        items={users.map(u => ({
                            id: u.id,
                            name: `${u.first_name} ${u.last_name || ''}`,
                            avatarUrl: u.avatar_url
                        }))}
                        selectedKey={selectedUserId || null}
                        onSelectionChange={(key) => setSelectedUserId(String(key))}
                    >
                        {users.map(u => (
                            <Select.Item
                                key={u.id}
                                id={u.id}
                                label={`${u.first_name} ${u.last_name || ''}`}
                                textValue={`${u.first_name} ${u.last_name || ''}`}
                                avatarUrl={u.avatar_url}
                            >
                                {`${u.first_name} ${u.last_name || ''}`}
                            </Select.Item>
                        ))}
                    </Select>

                    <Input
                        label="Назва виплати:"
                        placeholder="Напр. Бонус за дизайн"
                        value={accrualName}
                        onChange={(value) => setAccrualName(value)}
                    />

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
