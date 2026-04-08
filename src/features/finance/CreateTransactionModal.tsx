import { useEffect, useState } from "react";
import { api } from "@/shared/utils/api";
import { Calendar, FileText, DollarSign, Users } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { Select } from "@/shared/ui/select/select";
import { Checkbox } from "@/shared/ui/checkbox/checkbox";
import { Avatar } from "@/shared/ui/avatar";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { Heading } from "react-aria-components";
import type { Key } from "react-aria-components";

interface SimpleUser {
    id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    role?: { name: string };
    active_badge_emoji?: string | null;
}

const TYPES = [
    { id: "income", label: "💰 Доходи" },
    { id: "expense", label: "💸 Витрати" },
    { id: "withdrawal", label: "🏦 Виведення" },
    { id: "deduction", label: "📝 Корегування" },
];

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function CreateTransactionModal({ isOpen, setIsOpen, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<SimpleUser[]>([]);
    const [formData, setFormData] = useState({
        transaction_at: "", name: "", type: "", amount: "", users: [] as string[],
    });

    useEffect(() => {
        if (!isOpen) return;
        api.get("/v1/Hub/Users/List?only_active=true").then(async (res) => {
            if (res.ok) setUsers((await res.json()).list || []);
        });
        setFormData({ transaction_at: "", name: "", type: "", amount: "", users: [] });
        setError(null);
    }, [isOpen]);

    const toggleUser = (id: string) => {
        setFormData(prev => ({
            ...prev,
            users: prev.users.includes(id) ? prev.users.filter(i => i !== id) : [...prev.users, id],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.post("/v1/Hub/Finance/CreateTransaction", { ...formData, amount: Number(formData.amount) });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Помилка");
            }
            setIsOpen(false);
            onSuccess?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog className="overflow-hidden">
                        <form onSubmit={handleSubmit} className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-primary shadow-xl p-6 flex flex-col gap-5">
                            <CloseButton onClick={() => setIsOpen(false)} className="absolute top-4 right-4" />

                            <Heading slot="title" className="text-lg font-semibold text-fg-primary">Нова транзакція</Heading>

                            <Input label="Дата" type="datetime-local" value={formData.transaction_at} onChange={(v) => setFormData({ ...formData, transaction_at: v })} isRequired icon={Calendar} />
                            <Input label="Назва" placeholder="Зарплата, Премія..." value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} isRequired icon={FileText} />

                            <Select
                                label="Тип"
                                selectedKey={formData.type || null}
                                onSelectionChange={(v: Key | null) => setFormData({ ...formData, type: v as string })}
                                placeholder="Оберіть тип"
                            >
                                {TYPES.map(t => <Select.Item key={t.id} id={t.id} label={t.label}>{t.label}</Select.Item>)}
                            </Select>

                            <Input label="Сума (₴)" type="number" placeholder="0.00" value={formData.amount} onChange={(v) => setFormData({ ...formData, amount: v })} isRequired icon={DollarSign} />

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-fg-secondary flex items-center gap-1.5">
                                        <Users size={14} /> Користувачі ({formData.users.length})
                                    </label>
                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, users: users.map(u => u.id) }))} className="text-xs text-fg-brand-primary hover:underline cursor-pointer">Всіх</button>
                                </div>
                                <div className="max-h-48 overflow-y-auto rounded-lg border border-border-secondary p-2 flex flex-col gap-0.5">
                                    {users.map(u => (
                                        <label key={u.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-primary_hover transition-colors">
                                            <Checkbox isSelected={formData.users.includes(u.id)} onChange={() => toggleUser(u.id)} />
                                            <Avatar size="sm" src={u.avatar_url} alt={u.first_name} />
                                            <span className="text-sm text-fg-primary truncate">{u.first_name} {u.last_name || ""}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {error && <p className="text-sm text-fg-error-primary">{error}</p>}

                            <div className="flex gap-3 pt-1">
                                <Button color="secondary" className="flex-1" onClick={() => setIsOpen(false)}>Скасувати</Button>
                                <Button type="submit" className="flex-1" isLoading={loading} showTextWhileLoading>Створити</Button>
                            </div>
                        </form>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}
