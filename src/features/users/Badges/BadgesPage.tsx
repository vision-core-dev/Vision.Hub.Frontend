import { useEffect, useState } from "react";
import { api } from "@/shared/utils/api";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { Plus, Trash, Pencil } from "lucide-react";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { Heading } from "react-aria-components";

interface BadgeType {
    id: string;
    name: string;
    description: string | null;
    emoji: string | null;
    icon_url: string | null;
}

export default function BadgesPage() {
    const [badges, setBadges] = useState<BadgeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<BadgeType | null>(null);

    const fetchBadges = async () => {
        setLoading(true);
        const res = await api.get("/v1/Hub/Badges/List");
        if (res.ok) setBadges(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchBadges(); }, []);

    const handleDelete = async (id: string) => {
        await api.post(`/v1/Hub/Badges/${id}/Delete`);
        fetchBadges();
    };

    const openEdit = (badge: BadgeType) => {
        setEditing(badge);
        setModalOpen(true);
    };

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    return (
        <DefaultPage
            title="Бейджики"
            isLoading={loading}
            action={<Button onClick={openCreate} iconLeading={Plus}>Створити</Button>}
        >
            {badges.length === 0 ? (
                <p className="text-fg-tertiary">Бейджиків ще немає</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {badges.map((b) => (
                        <div key={b.id} className="flex items-start gap-3 rounded-xl border border-border-secondary bg-primary p-4 shadow-xs">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-secondary bg-secondary text-xl">
                                {b.emoji || "🏅"}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                <span className="text-sm font-semibold text-fg-primary">{b.name}</span>
                                {b.description && (
                                    <span className="text-xs text-fg-tertiary line-clamp-2">{b.description}</span>
                                )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => openEdit(b)} className="p-1.5 rounded-md hover:bg-secondary text-fg-quaternary hover:text-fg-secondary transition-colors cursor-pointer">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-md hover:bg-error-primary text-fg-quaternary hover:text-fg-error-primary transition-colors cursor-pointer">
                                    <Trash size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <BadgeModal
                isOpen={modalOpen}
                setIsOpen={setModalOpen}
                badge={editing}
                onSaved={fetchBadges}
            />
        </DefaultPage>
    );
}

function BadgeModal({ isOpen, setIsOpen, badge, onSaved }: {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    badge: BadgeType | null;
    onSaved: () => void;
}) {
    const [form, setForm] = useState({ name: "", description: "", emoji: "", icon_url: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (badge) {
            setForm({ name: badge.name, description: badge.description || "", emoji: badge.emoji || "", icon_url: badge.icon_url || "" });
        } else {
            setForm({ name: "", description: "", emoji: "", icon_url: "" });
        }
    }, [badge, isOpen]);

    const handleSave = async () => {
        setSaving(true);
        const url = badge
            ? `/v1/Hub/Badges/${badge.id}/Update`
            : `/v1/Hub/Badges/Create`;
        const res = await api.post(url, form);
        if (res.ok) {
            setIsOpen(false);
            onSaved();
        }
        setSaving(false);
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full max-w-[400px] rounded-2xl bg-primary shadow-xl p-6 flex flex-col gap-5">
                            <CloseButton onClick={() => setIsOpen(false)} className="absolute top-4 right-4" />

                            <Heading slot="title" className="text-lg font-semibold text-fg-primary">
                                {badge ? "Редагувати бейджик" : "Новий бейджик"}
                            </Heading>

                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border-secondary bg-secondary text-2xl">
                                    {form.emoji || "🏅"}
                                </div>
                                <Input
                                    label="Емодзі"
                                    placeholder="🔥"
                                    value={form.emoji}
                                    onChange={(v) => setForm({ ...form, emoji: v })}
                                    className="w-24"
                                />
                            </div>

                            <Input
                                label="Назва"
                                placeholder="Найкращий працівник"
                                value={form.name}
                                onChange={(v) => setForm({ ...form, name: v })}
                                isRequired
                            />

                            <Input
                                label="Опис"
                                placeholder="За видатні досягнення"
                                value={form.description}
                                onChange={(v) => setForm({ ...form, description: v })}
                            />

                            <div className="flex gap-3 justify-end pt-2">
                                <Button color="secondary" onClick={() => setIsOpen(false)}>Скасувати</Button>
                                <Button onClick={handleSave} isLoading={saving} isDisabled={!form.name.trim()}>
                                    {badge ? "Зберегти" : "Створити"}
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}
