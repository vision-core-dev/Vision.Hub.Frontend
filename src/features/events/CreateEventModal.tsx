import { useEffect, useState } from "react";
import { api } from "@/shared/utils/api";
import { Calendar, Clock, MapPin, Link2, Users, FileText } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { TextArea } from "@/shared/ui/textarea/textarea";
import { Checkbox } from "@/shared/ui/checkbox/checkbox";
import { Avatar } from "@/shared/ui/avatar";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { Heading } from "react-aria-components";

interface SimpleUser {
    id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    role?: { name: string };
    active_badge_emoji?: string | null;
}

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function CreateEventModal({ isOpen, setIsOpen, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<SimpleUser[]>([]);
    const [formData, setFormData] = useState({
        name: "", description: "", date: "", time_from: "", time_to: "",
        location: "", location_url: "", invitees: [] as string[],
    });

    useEffect(() => {
        if (!isOpen) return;
        api.get("/v1/Hub/Users/List?only_active=true").then(async (res) => {
            if (res.ok) setUsers((await res.json()).list || []);
        });
        setFormData({ name: "", description: "", date: "", time_from: "", time_to: "", location: "", location_url: "", invitees: [] });
        setError(null);
    }, [isOpen]);

    const toggleUser = (id: string) => {
        setFormData(prev => ({
            ...prev,
            invitees: prev.invitees.includes(id) ? prev.invitees.filter(i => i !== id) : [...prev.invitees, id],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.post("/v1/Hub/Events/Create", formData);
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

                            <Heading slot="title" className="text-lg font-semibold text-fg-primary">Нова подія</Heading>

                            <Input label="Назва" placeholder="Зустріч команди" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} isRequired icon={FileText} />
                            <TextArea label="Опис" placeholder="Додайте опис..." value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} />
                            <Input label="Дата" type="date" value={formData.date} onChange={(v) => setFormData({ ...formData, date: v })} isRequired icon={Calendar} />

                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Початок" type="time" value={formData.time_from} onChange={(v) => setFormData({ ...formData, time_from: v })} isRequired icon={Clock} />
                                <Input label="Кінець" type="time" value={formData.time_to} onChange={(v) => setFormData({ ...formData, time_to: v })} isRequired icon={Clock} />
                            </div>

                            <Input label="Локація" placeholder="Офіс / Zoom" value={formData.location} onChange={(v) => setFormData({ ...formData, location: v })} icon={MapPin} />
                            <Input label="Посилання" placeholder="https://..." value={formData.location_url} onChange={(v) => setFormData({ ...formData, location_url: v })} icon={Link2} />

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-fg-secondary flex items-center gap-1.5">
                                        <Users size={14} /> Учасники ({formData.invitees.length})
                                    </label>
                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, invitees: users.map(u => u.id) }))} className="text-xs text-fg-brand-primary hover:underline cursor-pointer">Всіх</button>
                                </div>
                                <div className="max-h-48 overflow-y-auto rounded-lg border border-border-secondary p-2 flex flex-col gap-0.5">
                                    {users.map(u => (
                                        <label key={u.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-primary_hover transition-colors">
                                            <Checkbox isSelected={formData.invitees.includes(u.id)} onChange={() => toggleUser(u.id)} />
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
