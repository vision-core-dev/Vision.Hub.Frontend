import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { ArrowLeft, Calendar, Clock, MapPin, Link2, Users, FileText } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { TextArea } from "@/shared/ui/textarea/textarea";
import { Checkbox } from "@/shared/ui/checkbox/checkbox";
import { Avatar } from "@/shared/ui/avatar";

interface SimpleUser {
    id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    role?: { name: string };
    active_badge_emoji?: string | null;
}

const CreateEventPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<SimpleUser[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        date: "",
        time_from: "",
        time_to: "",
        location: "",
        location_url: "",
        invitees: [] as string[],
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
            invitees: prev.invitees.includes(id)
                ? prev.invitees.filter(i => i !== id)
                : [...prev.invitees, id],
        }));
    };

    const selectAll = () => {
        setFormData(prev => ({ ...prev, invitees: users.map(u => u.id) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.post("/v1/Hub/Events/Create", formData);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Не вдалося створити подію");
            }
            navigate("/calendar");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DefaultPage title="Створити подію">
            <Button color="link-color" onClick={() => navigate("/calendar")} iconLeading={ArrowLeft}>
                Назад до календаря
            </Button>

            <form onSubmit={handleSubmit} className="max-w-lg mt-4">
                <div className="rounded-2xl border border-border-secondary bg-primary p-6 shadow-xs flex flex-col gap-5">
                    <Input
                        label="Назва події"
                        placeholder="Зустріч команди"
                        value={formData.name}
                        onChange={(v) => setFormData({ ...formData, name: v })}
                        isRequired
                        icon={FileText}
                    />

                    <TextArea
                        label="Опис"
                        placeholder="Додайте опис події..."
                        value={formData.description}
                        onChange={(v) => setFormData({ ...formData, description: v })}
                    />

                    <Input
                        label="Дата"
                        type="date"
                        value={formData.date}
                        onChange={(v) => setFormData({ ...formData, date: v })}
                        isRequired
                        icon={Calendar}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Час початку"
                            type="time"
                            value={formData.time_from}
                            onChange={(v) => setFormData({ ...formData, time_from: v })}
                            isRequired
                            icon={Clock}
                        />
                        <Input
                            label="Час завершення"
                            type="time"
                            value={formData.time_to}
                            onChange={(v) => setFormData({ ...formData, time_to: v })}
                            isRequired
                            icon={Clock}
                        />
                    </div>

                    <Input
                        label="Локація"
                        placeholder="Офіс / Zoom"
                        value={formData.location}
                        onChange={(v) => setFormData({ ...formData, location: v })}
                        icon={MapPin}
                    />

                    <Input
                        label="Посилання на локацію"
                        placeholder="https://..."
                        value={formData.location_url}
                        onChange={(v) => setFormData({ ...formData, location: v })}
                        icon={Link2}
                    />

                    {/* Users */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-fg-secondary flex items-center gap-1.5">
                                <Users size={14} />
                                Учасники ({formData.invitees.length})
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
                                        isSelected={formData.invitees.includes(u.id)}
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
                        <Button color="secondary" className="flex-1" onClick={() => navigate("/calendar")}>
                            Скасувати
                        </Button>
                        <Button type="submit" className="flex-1" isLoading={loading} showTextWhileLoading>
                            Створити подію
                        </Button>
                    </div>
                </div>
            </form>
        </DefaultPage>
    );
};

export default CreateEventPage;
