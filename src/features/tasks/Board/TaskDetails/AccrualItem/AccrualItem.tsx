import { useState } from "react";
import { AvatarLabelGroup } from "@/shared/ui/avatar/avatar-label-group";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/shared/ui/input/input";
import { ButtonUtility } from "@/shared/ui/buttons/button-utility";

interface Props {
    id: string;
    taskId: string;
    user: {
        id: string;
        first_name: string;
        last_name?: string;
        avatar_url?: string;
    };
    name?: string;
    amount: number;
    onUpdate?: (id: string, data: { amount?: number; name?: string }) => void;
    onDelete?: (id: string) => void;
    canEdit?: boolean;
}

export default function AccrualItem({ id, user, name, amount, canEdit, onUpdate, onDelete }: Props) {
    const initials = (user.first_name[0] || "") + (user.last_name?.[0] || "");

    const [isEditing, setIsEditing] = useState(false);
    const [editAmount, setEditAmount] = useState(String(amount));
    const [editName, setEditName] = useState(name || "");

    const handleSave = () => {
        const numAmount = parseFloat(editAmount);
        if (isNaN(numAmount)) return;

        onUpdate?.(id, {
            amount: numAmount !== amount ? numAmount : undefined,
            name: editName !== (name || "") ? editName : undefined,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditAmount(String(amount));
        setEditName(name || "");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex flex-col gap-3 py-3 px-3 border border-indigo-200 dark:border-indigo-800/50 rounded-lg bg-indigo-50/30 dark:bg-gray-800/80 mb-1.5 animate-in fade-in slide-in-from-top-1">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center sm:w-1/4 shrink-0">
                        <AvatarLabelGroup
                            title={`${user.first_name} ${user.last_name || ""}`}
                            size="sm"
                            src={user.avatar_url}
                            initials={initials}
                        />
                    </div>
                    <div className="flex-1">
                        <Input
                            value={editName}
                            onChange={(value) => setEditName(value)}
                            placeholder="Назва виплати"
                        />
                    </div>
                    <div className="sm:w-[120px] shrink-0">
                        <Input
                            type="number"
                            value={editAmount}
                            onChange={(value) => setEditAmount(value)}
                            placeholder="Сума"
                        />
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <ButtonUtility icon={Check} onClick={handleSave} tooltip="Зберегти" color="secondary" />
                    <ButtonUtility icon={X} onClick={handleCancel} tooltip="Скасувати" color="tertiary" />
                </div>
            </div>
        );
    }

    return (
        <div className="group flex items-center gap-3 py-2 px-3 border border-gray-200 dark:border-gray-700/80 rounded-lg bg-white dark:bg-gray-800/80 mb-1.5 transition-all hover:shadow-sm">
            <AvatarLabelGroup
                title={`${user.first_name} ${user.last_name || ""}`}
                size="sm"
                src={user.avatar_url}
                initials={initials}
            />

            <div className="flex-1 min-w-0">
                {name && <span className="text-[13px] text-gray-500 dark:text-gray-400 block truncate">{name}</span>}
            </div>

            <div
                className={`w-[90px] text-right py-1.5 px-2 rounded-md text-[14px] font-medium shrink-0 ${amount > 0 ? "text-emerald-600 dark:text-emerald-400" : amount < 0 ? "text-red-600 dark:text-red-400" : "text-gray-800 dark:text-gray-200"}`}
            >
                {amount > 0 ? `+${amount}` : amount} ₴
            </div>

            {canEdit && (
                <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <ButtonUtility icon={<Pencil size={14} />} onClick={() => setIsEditing(true)} tooltip="Редагувати" size="xs" color="tertiary" />
                    <ButtonUtility icon={<Trash2 size={14} className="text-red-500 dark:text-red-400" />} onClick={() => onDelete?.(id)} tooltip="Видалити" size="xs" color="tertiary" />
                </div>
            )}
        </div>
    );
}
