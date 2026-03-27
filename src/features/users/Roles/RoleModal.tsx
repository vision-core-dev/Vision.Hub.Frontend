import { useState, useEffect } from "react";
import { Heading } from "react-aria-components";
import { Shield01 } from "@untitledui/icons";

import { api } from "@/shared/utils/api";
import { Button } from "@/shared/ui/buttons/button";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { Input } from "@/shared/ui/input/input";
import { FeaturedIcon } from "@/shared/assets/icons/featured-icon/featured-icon";
import { BackgroundPattern } from "@/shared/assets/background-patterns";

import { Checkbox } from "@/shared/ui/checkbox/checkbox";
import { getSidebarText } from "@/shared/types/Messages";

const ALL_MENU_KEYS = [
    "dashboard",
    "calendar",
    "boards",
    "events",
    "users",
    "knowledge",
    "salary",
    "finance",
    "reports",
    "settings",
    "drive",
    "forms",
    "chat",
    "vision-bot",
    "vision-support",
    "org-structure",
];

export interface UserRole {
    id: string;
    name: string;
    key: string;
    order: number;
    menu?: string[];
}

interface RoleModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    role: UserRole | null;
    onSuccess: () => void;
}

export function RoleModal({ isOpen, setIsOpen, role, onSuccess }: RoleModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        key: "",
        order: 0,
        menu: [] as string[],
    });

    useEffect(() => {
        if (role) {
            setForm({
                name: role.name,
                key: role.key,
                order: role.order,
                menu: role.menu || [],
            });
        } else {
            setForm({
                name: "",
                key: "",
                order: 0,
                menu: [],
            });
        }
    }, [role, isOpen]);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const endpoint = role ? `/v1/Hub/UserRoles/${role.id}` : "/v1/Hub/UserRoles";
            const reqBody = { ...form };
            
            const res = role 
                ? await api.patch(endpoint, reqBody)
                : await api.post(endpoint, reqBody);

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Помилка збереження");
            }

            setIsOpen(false);
            onSuccess();
        } catch (e: any) {
            setError(e.message || "Сталася помилка");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog className="overflow-hidden">
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl sm:max-w-172 lg:max-w-[500px]">
                            <CloseButton onClick={() => setIsOpen(false)} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max max-sm:hidden">
                                    <FeaturedIcon color="gray" size="lg" theme="modern" icon={Shield01} />
                                    <BackgroundPattern pattern="circle" size="sm" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <Heading slot="title" className="text-md font-semibold text-primary">
                                        {role ? "Редагувати роль" : "Створити роль"}
                                    </Heading>
                                    <p className="text-sm text-tertiary">Заповніть інформацію про роль.</p>
                                </div>
                            </div>

                            <div className="h-5 w-full" />
                            <div className="w-full border-t border-secondary" />
                            <div className="flex flex-col justify-start gap-4 px-4 pt-5 sm:px-6">

                                <Input isRequired label="Назва ролі" placeholder="Менеджер"
                                    value={form.name}
                                    onChange={(value) => setForm({ ...form, name: value })}
                                />

                                <Input isRequired label="Ключ (англійською)" placeholder="manager"
                                    value={form.key}
                                    onChange={(value) => setForm({ ...form, key: value })}
                                />

                                <Input isRequired label="Порядок (Ієрархія)" type="number" placeholder="10"
                                    value={form.order.toString()}
                                    onChange={(value) => setForm({ ...form, order: parseInt(value) || 0 })}
                                />

                                <div className="flex flex-col gap-2 mt-2">
                                    <span className="text-sm font-medium text-primary">Доступи (Меню)</span>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                        {ALL_MENU_KEYS.map((key) => {
                                            const isSelected = form.menu.includes(key);
                                            return (
                                                <Checkbox 
                                                    key={key} 
                                                    isSelected={isSelected} 
                                                    onChange={(checked) => {
                                                        let newMenu = [...form.menu];
                                                        if (checked) {
                                                            newMenu.push(key);
                                                        } else {
                                                            newMenu = newMenu.filter((m) => m !== key);
                                                        }
                                                        setForm({ ...form, menu: newMenu });
                                                    }}
                                                    label={getSidebarText(key)}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-sm text-error">{error}</p>
                                )}
                            </div>

                            <div className="z-10 flex flex-col pt-6 pb-4 sm:pt-8 sm:pb-6">
                                <div className="w-full border-t border-secondary" />
                                <div className="h-4 w-full sm:h-6" />
                                <div className="flex flex-1 flex-col-reverse gap-3 px-4 sm:grid sm:grid-cols-2 sm:px-6">
                                    <Button color="secondary" onClick={() => setIsOpen(false)}>Скасувати</Button>
                                    <Button color="primary" onClick={handleSubmit} isLoading={loading} showTextWhileLoading>
                                        Зберегти
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}
