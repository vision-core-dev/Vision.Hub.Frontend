import { useState } from "react";
import { api } from "@/shared/utils/api";
import { Button } from "@/shared/ui/buttons/button";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { DialogTrigger, ModalOverlay, Modal, Dialog } from "@/shared/components/modals/modal";
import UserSelect from "@/shared/ui/user-select/UserSelect";

interface AddParticipantsModalProps {
    eventId: string;
    isOpen: boolean;
    onClose: () => void;
    onAdded: () => void;
}

const AddParticipantsModal = ({ eventId, isOpen, onClose, onAdded }: AddParticipantsModalProps) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (selectedIds.length === 0) return;
        setLoading(true);
        setError(null);

        try {
            const res = await api.post(`/v1/Hub/Events/${eventId}/Invitees/Add`, {
                user_ids: selectedIds,
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Не вдалося додати учасників");
            }
            onAdded();
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
                                <h2 className="text-xl font-semibold text-primary">Додати учасників</h2>
                                <CloseButton onClick={onClose} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-secondary">
                                    Оберіть користувачів ({selectedIds.length})
                                </label>
                                <UserSelect onChange={setSelectedIds} />
                            </div>

                            {error && <div className="text-red-500 text-sm">{error}</div>}

                            <div className="flex justify-end gap-2 pt-2">
                                <Button color="secondary" onClick={onClose}>
                                    Скасувати
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    isLoading={loading}
                                    showTextWhileLoading
                                    isDisabled={selectedIds.length === 0}
                                >
                                    Додати
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

export default AddParticipantsModal;
