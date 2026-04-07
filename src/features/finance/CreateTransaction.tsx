import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { ArrowLeft, Calendar, FileText, DollarSign, Users } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { Select } from "@/shared/ui/select/select";
import { Checkbox } from "@/shared/ui/checkbox/checkbox";
import { Avatar } from "@/shared/ui/avatar";
import type { Key } from "react-aria-components";

interface SimpleUser {
    id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    role?: { name: string };
    active_badge_emoji?: string | null;
}

const TRANSACTION_TYPES = [
    { id: "income", label: "Доходи", emoji: "💰" },
    { id: "expense", label: "Витрати", emoji: "💸" },
    { id: "withdrawal", label: "Виведення", emoji: "🏦" },
    { id: "deduction", label: "Корегування", emoji: "📝" },
];

const CreateTransaction = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<SimpleUser[]>([]);
    const [formData, setFormData] = useState({
        transaction_at: "",
        name: "",
        type: "" as string,
        amount: "",
        users: [] as string[],
    });

    useEffect(() => {
        api.get("/v1/Hub/Users/List?only_active=true").then(async (res) => {
            if (res.ok) {
                const data = await res.json();
                setUsers(data.list || []);
            }
        });
    }, []);

    const toggleUser = (id: string) => {
        setFormData(prev => ({
            ...prev,
            users: prev.users.includes(id)
                ? prev.users.filter(i => i !== id)
                : [...prev.users, id],
        }));
    };

    const selectAll = () => {
        setFormData(prev => ({ ...prev, users: users.map(u => u.id) }));
    };

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

            <form onSubmit={handleSubmit} className="max-w-lg mt-4">
                <div className="rounded-2xl border border-border-secondary bg-primary p-6 shadow-xs flex flex-col gap-5">
                    <Input
                        label="Дата транзакції"
                        type="datetime-local"
                        value={formData.transaction_at}
                        onChange={(v) => setFormData({ ...formData, transaction_at: v })}
                        isRequired
                        icon={Calendar}
                    />

                    <Input
                        label="Назва транзакції"
                        placeholder="Зарплата, Премія..."
                        value={formData.name}
                        onChange={(v) => setFormData({ ...formData, name: v })}
                        isRequired
                        icon={FileText}
                    />

                    <Select
                        label="Тип транзакції"
                        selectedKey={formData.type || null}
                        onSelectionChange={(value: Key | null) => setFormData({ ...formData, type: value as string })}
                        placeholder="Оберіть тип"
                    >
                        {TRANSACTION_TYPES.map(t => (
                            <Select.Item key={t.id} id={t.id} label={`${t.emoji} ${t.label}`}>
                                {t.emoji} {t.label}
                            </Select.Item>
                        ))}
                    </Select>

                    <Input
                        label="Сума (₴)"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(v) => setFormData({ ...formData, amount: v })}
                        isRequired
                        icon={DollarSign}
                    />

                    {/* Users */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-fg-secondary flex items-center gap-1.5">
                                <Users size={14} />
                                Користувачі ({formData.users.length})
                            </label>
                            <button type="button" onClick={selectAll} className="text-xs text-fg-brand-primary hover:underline cursor-pointer">
                                Вибрати всіх
                            </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto rounded-lg border border-border-secondary p-2 flex flex-col gap-0.5">
                            {users.map(u => (
                                <label
                                    key={u.id}
                                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-primary_hover transition-colors"
                                >
                                    <Checkbox
                                        isSelected={formData.users.includes(u.id)}
                                        onChange={() => toggleUser(u.id)}
                                    />
                                    <Avatar size="sm" src={u.avatar_url} alt={u.first_name} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-fg-primary truncate">
                                            {u.first_name} {u.last_name || ""}{u.active_badge_emoji ? ` ${u.active_badge_emoji}` : ""}
                                        </span>
                                        {u.role?.name && <span className="text-xs text-fg-tertiary">{u.role.name}</span>}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-sm text-fg-error-primary">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <Button color="secondary" className="flex-1" onClick={() => navigate("/finance/transactions/list")}>
                            Скасувати
                        </Button>
                        <Button type="submit" className="flex-1" isLoading={loading} showTextWhileLoading>
                            Створити транзакцію
                        </Button>
                    </div>
                </div>
            </form>
        </DefaultPage>
    );
};

export default CreateTransaction;
