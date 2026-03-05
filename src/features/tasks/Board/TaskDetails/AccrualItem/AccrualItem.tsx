import { useState } from "react";
import { AvatarLabelGroup } from "@/shared/ui/avatar/avatar-label-group";
import { Pencil, Trash2, Check, X } from "lucide-react";
import styles from "./AccrualItem.module.css";

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
            <div className={styles.editItem}>
                <AvatarLabelGroup
                    title={`${user.first_name} ${user.last_name || ""}`}
                    size="sm"
                    src={user.avatar_url}
                    initials={initials}
                />
                <div className={styles.editFields}>
                    <input
                        className={styles.editNameInput}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Назва виплати"
                    />
                    <input
                        className={styles.editAmountInput}
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="Сума"
                    />
                </div>
                <div className={styles.editActions}>
                    <button className={styles.saveBtn} onClick={handleSave} title="Зберегти">
                        <Check size={14} />
                    </button>
                    <button className={styles.cancelBtn} onClick={handleCancel} title="Скасувати">
                        <X size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.item}>
            <AvatarLabelGroup
                title={`${user.first_name} ${user.last_name || ""}`}
                size="sm"
                src={user.avatar_url}
                initials={initials}
            />

            <div className={styles.nameLabel}>
                {name && <span className={styles.nameText}>{name}</span>}
            </div>

            <div
                className={`${styles.amount} ${amount > 0 ? styles.plus : amount < 0 ? styles.minus : ""}`}
            >
                {amount > 0 ? `+${amount}` : amount} ₴
            </div>

            {canEdit && (
                <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => setIsEditing(true)} title="Редагувати">
                        <Pencil size={14} />
                    </button>
                    <button className={styles.deleteBtn} onClick={() => onDelete?.(id)} title="Видалити">
                        <Trash2 size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
