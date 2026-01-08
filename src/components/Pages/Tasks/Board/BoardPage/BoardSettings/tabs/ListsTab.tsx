import { useState } from "react";
import { api } from "@/utils/api";
import { Trash } from "lucide-react";
import {Button} from "@/ui/base/buttons/button.tsx";
import {Input} from "@/ui/base/input/input.tsx";

/* ===================== TYPES ===================== */

export interface BoardList {
    id: string;
    name: string;
    color?: string;
    order?: number;
}

interface ListsTabProps {
    boardId: string;
    lists: BoardList[];
    onUpdate: () => void;
}

/* ===================== COMPONENT ===================== */

export default function ListsTab({
                                     boardId,
                                     lists,
                                     onUpdate,
                                 }: ListsTabProps) {
    const [newList, setNewList] = useState({
        name: "",
        color: "#f1f2f4",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ===================== ACTIONS ===================== */

    const createList = async () => {
        if (!newList.name.trim()) return;

        try {
            setLoading(true);
            setError(null);

            await api.post(
                `/v1/Hub/Boards/${boardId}/Lists/Create`,
                newList
            );

            setNewList({ name: "", color: "#f1f2f4" });
            onUpdate();
        } catch {
            setError("Не вдалося створити список");
        } finally {
            setLoading(false);
        }
    };

    const deleteList = async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            await api.post(
                `/v1/Hub/Boards/${boardId}/Lists/${id}/Remove`
            );

            onUpdate();
        } catch {
            setError("Не вдалося видалити список");
        } finally {
            setLoading(false);
        }
    };

    /* ===================== RENDER ===================== */

    return (
        <div className="flex flex-col gap-8">
            {/* Create list */}
            <div className="rounded-xl border border-secondary bg-secondary/20 p-4">
                <h3 className="text-lg font-semibold">Додати список</h3>
                <p className="text-sm text-secondary mt-1">
                    Списки використовуються для організації задач на дошці.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-3">
                    <Input
                        type="text"
                        placeholder="Назва списку"
                        value={newList.name}
                        onChange={(value) =>
                            setNewList({
                                ...newList,
                                name: value,
                            })
                        }
                    />

                    <Input
                        type="color"
                        value={newList.color}
                        onChange={(value) =>
                            setNewList({
                                ...newList,
                                color: value,
                            })
                        }
                    />

                    <Button
                        size="md"
                        onClick={createList}
                        isLoading={loading}
                    >
                        Додати
                    </Button>
                </div>
            </div>

            {/* Lists */}
            <div className="rounded-xl border border-secondary bg-secondary/20 p-4">
                <h3 className="text-lg font-semibold">
                    Списки дошки
                </h3>

                <div className="mt-4 flex flex-col gap-2">
                    {lists.length === 0 && (
                        <span className="text-sm text-secondary">
                            Списків ще немає
                        </span>
                    )}

                    {lists.map((list) => (
                        <div
                            key={list.id}
                            className="flex items-center justify-between rounded-lg border border-secondary bg-primary px-3 py-2"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-4 w-4 rounded"
                                    style={{
                                        backgroundColor:
                                            list.color || "#f1f2f4",
                                    }}
                                />
                                <span className="font-medium">
                                    {list.name}
                                </span>
                            </div>

                            <Button
                                color="primary-destructive"
                                size="sm"
                                onClick={() =>
                                    deleteList(list.id)
                                }
                                isLoading={loading}
                                iconLeading={Trash}
                            />

                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className="text-sm text-danger">
                    {error}
                </div>
            )}
        </div>
    );
}
