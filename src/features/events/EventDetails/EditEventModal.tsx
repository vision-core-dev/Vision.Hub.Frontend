import { useState } from "react";
import { api } from "@/shared/utils/api";
import { Input } from "@/shared/ui/input/input";
import { Button } from "@/shared/ui/buttons/button";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { DialogTrigger, ModalOverlay, Modal, Dialog } from "@/shared/components/modals/modal";
import type { EventType } from "@/shared/types/Events";

interface EditEventModalProps {
    event: EventType;
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

const EditEventModal = ({ event, isOpen, onClose, onSaved }: EditEventModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: event.name,
        description: event.description || "",
        date: event.date?.split("T")[0] || "",
        time_from: event.time_from || "",
        time_to: event.time_to || "",
        location: event.location || "",
        location_url: event.location_url || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post(`/v1/Hub/Events/${event.id}/Update`, formData);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Не вдалося оновити подію");
            }
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="w-full max-w-md rounded-2xl bg-primary p-6 shadow-2xl flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-primary">Редагувати подію</h2>
                                <CloseButton onClick={onClose} />
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <Input
                                    label="Назва події"
                                    type="text"
                                    value={formData.name}
                                    onChange={(value) => setFormData({ ...formData, name: value })}
                                    isRequired
                                />

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-secondary">Опис</label>
                                    <textarea
                                        className="w-full rounded-lg border border-secondary px-3 py-2 text-md focus:ring-2 focus:ring-brand outline-none bg-primary text-primary"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <Input
                                    label="Дата"
                                    type="date"
                                    value={formData.date}
                                    onChange={(value) => setFormData({ ...formData, date: value })}
                                    isRequired
                                />

                                <div className="flex gap-4">
                                    <Input
                                        label="Час початку"
                                        type="time"
                                        value={formData.time_from}
                                        onChange={(value) => setFormData({ ...formData, time_from: value })}
                                        isRequired
                                    />
                                    <Input
                                        label="Час завершення"
                                        type="time"
                                        value={formData.time_to}
                                        onChange={(value) => setFormData({ ...formData, time_to: value })}
                                        isRequired
                                    />
                                </div>

                                <Input
                                    label="Локація"
                                    type="text"
                                    value={formData.location}
                                    onChange={(value) => setFormData({ ...formData, location: value })}
                                />

                                <Input
                                    label="Посилання на локацію"
                                    type="text"
                                    value={formData.location_url}
                                    onChange={(value) => setFormData({ ...formData, location_url: value })}
                                />

                                {error && <div className="text-red-500 text-sm">{error}</div>}

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button color="secondary" onClick={onClose} type="button">
                                        Скасувати
                                    </Button>
                                    <Button type="submit" isLoading={loading} showTextWhileLoading>
                                        Зберегти
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

export default EditEventModal;
