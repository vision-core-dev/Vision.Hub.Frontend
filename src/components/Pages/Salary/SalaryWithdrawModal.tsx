import React, { useEffect, useState } from "react";
import { api } from "@/utils/api";

import { Button } from "@/ui/base/buttons/button";
import { InputBase } from "@/ui/base/input/input";
import { TextArea } from "@/ui/base/textarea/textarea";
import { InputGroup } from "@/ui/base/input/input-group";
import { Select } from "@/ui/base/select/select";

import {
    DialogTrigger,
    Modal,
    ModalOverlay,
    Dialog,
} from "@/ui/application/modals/modal";

import { CloseButton } from "@/ui/base/buttons/close-button";
import { FeaturedIcon } from "@/ui/foundations/featured-icon/featured-icon";
import { BackgroundPattern } from "@/ui/shared-assets/background-patterns";
import { HandCoins } from "lucide-react";
import { Heading } from "react-aria-components";

/* ===================== TYPES ===================== */

interface WithdrawMethod {
    id: string;
    title: string;
    description?: string;
    fee_percent?: number;
}

interface Props {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSuccess: () => void;
    withdrawLimit: number;
}

/* ===================== COMPONENT ===================== */

const SalaryWithdrawModal: React.FC<Props> = ({
                                                  isOpen,
                                                  onOpenChange,
                                                  onSuccess,
                                                  withdrawLimit,
                                              }) => {
    const [amount, setAmount] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const [methods, setMethods] = useState<WithdrawMethod[]>([]);
    const [methodId, setMethodId] = useState<string | null>(null);

    /* ===================== LOAD METHODS ===================== */

    useEffect(() => {
        if (!isOpen) return;

        (async () => {
            try {
                const res = await api.get("/v1/Hub/Finance/GetWithdrawMethods");
                const json = await res.json();
                if (res.ok) {
                    setMethods(json);
                    setMethodId(json[0]?.id ?? null);
                }
            } catch {
                setError("Не вдалося завантажити способи виводу");
            }
        })();
    }, [isOpen]);

    /* ===================== SUBMIT ===================== */

    const handleSubmit = async () => {
        setError("");

        if (!methodId) return setError("Оберіть спосіб виводу");
        if (amount <= 0) return setError("Вкажіть суму більше 0 ₴");
        if (amount > withdrawLimit)
            return setError(`Максимум — ${withdrawLimit} ₴`);

        try {
            const res = await api.post(
                "/v1/Hub/Finance/CreateWithdrawalRequest",
                {
                    amount,
                    withdraw_method_id: methodId,
                    comment: comment || null,
                }
            );

            const json = await res.json();
            if (!res.ok) throw new Error(json.message);

            onSuccess();
            onOpenChange(false);
        } catch {
            setError("Помилка при відправці запиту");
        }
    };

    /* ===================== RENDER ===================== */

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl sm:max-w-100">

                            <CloseButton
                                onClick={() => onOpenChange(false)}
                                theme="light"
                                size="lg"
                                className="absolute top-3 right-3"
                            />

                            {/* Header */}
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max">
                                    <FeaturedIcon
                                        color="gray"
                                        size="lg"
                                        theme="modern"
                                        icon={HandCoins}
                                    />
                                    <BackgroundPattern
                                        pattern="circle"
                                        size="sm"
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                    />
                                </div>

                                <div>
                                    <Heading className="text-md font-semibold">
                                        Запит на вивід коштів
                                    </Heading>
                                    <p className="text-sm text-tertiary">
                                        Ліміт: {withdrawLimit} ₴
                                    </p>
                                </div>
                            </div>



                            {/* Body */}
                            <div className="flex flex-col gap-4 px-4 sm:px-6 mt-4">
                                {/* Method */}
                                <Select
                                    isRequired={true}
                                    label="Спосіб виводу"
                                    selectedKey={methodId ?? undefined}
                                    onSelectionChange={(key) =>
                                        setMethodId(String(key))
                                    }
                                    items={methods}
                                    placeholder="Оберіть спосіб виводу"
                                >
                                    {(item) => (
                                        <Select.Item key={item.id} id={item.id}>
                                            <div className="flex flex-col">
                                                <span>{item.label}</span>
                                                {item.supportingText && (
                                                    <span className="text-xs text-tertiary">
                                                            {item.supportingText}
                                                        </span>
                                                )}
                                            </div>
                                        </Select.Item>
                                    )}
                                </Select>

                                {/* Amount */}
                                <InputGroup
                                    label="Сума"
                                    isRequired
                                    value={String(amount)}
                                    onChange={(v) =>
                                        setAmount(
                                            parseFloat(v.replace(/,/g, "")) || 0
                                        )
                                    }
                                >
                                    <InputBase
                                        type="number"
                                        placeholder="1,000.00"
                                    />
                                </InputGroup>

                                {/* Comment */}
                                <TextArea
                                    label="Коментар"
                                    value={comment}
                                    onChange={setComment}
                                    placeholder="Коментар (необов’язково)"
                                />

                                {error && (
                                    <p className="text-sm text-error">
                                        {error}
                                    </p>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col-reverse gap-3 p-4 sm:grid sm:grid-cols-2 sm:px-6">
                                <Button
                                    color="secondary"
                                    size="lg"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Скасувати
                                </Button>
                                <Button
                                    color="primary"
                                    size="lg"
                                    onClick={handleSubmit}
                                >
                                    Відправити
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

export default SalaryWithdrawModal;
