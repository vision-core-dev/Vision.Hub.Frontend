import { useState } from "react";
import { api } from "@/shared/utils/api";
import {Button} from "@/shared/ui/buttons/button.tsx";
import {Input} from "@/shared/ui/input/input.tsx";


/* ===================== COMPONENT ===================== */

interface Props {
    boardId: string;
    boardName: string;
    onUpdate: () => void;
}

export default function GeneralTab({
   boardId,
   boardName,
   onUpdate,
}: Props) {
    const [sName, setSName] = useState<string>(boardName);
    const [loading, setLoading] = useState(false);

    /* ===================== ACTIONS ===================== */

    const updateName = async () => {
        try {
            setLoading(true);
            await api.post(
                `/v1/Hub/Boards/${boardId}/UpdateName`, { name: sName });
            onUpdate();
        } finally {
            setLoading(false);
        }
    }

    /* ===================== RENDER ===================== */

    return (
        <div className="flex flex-col gap-8">
            {/* Add member */}
            <div className="rounded-xl border border-secondary bg-secondary/20 p-4">
                <h3 className="text-lg font-semibold">
                    Ім'я дошки
                </h3>
                <p className="text-sm text-secondary mt-1">
                    Змініть назву цієї дошки.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end">
                    <Input
                        label="Назва дошки"
                        value={sName}
                        onChange={(value) => setSName(value)}
                    />

                    <Button
                        size="md"
                        onClick={updateName}
                        isLoading={loading}
                    >
                        Оновити
                    </Button>
                </div>
            </div>

        </div>
    );
}









