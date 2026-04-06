import { useEffect, useState } from "react";
import { api } from "@/shared/utils/api";
import { Trash, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";

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

    const [editing, setEditing] = useState<Record<string, BoardList>>({});
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    /* ===================== INIT ===================== */

    useEffect(() => {
        const map: Record<string, BoardList> = {};
        lists.forEach((l) => (map[l.id] = l));
        setEditing(map);
    }, [lists]);

    /* ===================== ACTIONS ===================== */

    const createList = async () => {
        if (!newList.name.trim()) return;

        try {
            setError(null);
            await api.post(
                `/v1/Hub/Boards/${boardId}/Lists/Create`,
                newList
            );

            setNewList({ name: "", color: "#f1f2f4" });
            onUpdate();
        } catch {
            setError("Не вдалося створити список");
        }
    };

    const deleteList = async (id: string) => {
        try {
            setLoadingId(id);
            setError(null);

            await api.post(
                `/v1/Hub/Boards/${boardId}/Lists/${id}/Remove`
            );

            onUpdate();
        } catch {
            setError("Не вдалося видалити список");
        } finally {
            setLoadingId(null);
        }
    };

    const updateList = async (id: string, extraFields?: Partial<BoardList>) => {
        const edited = { ...editing[id], ...extraFields };
        const original = lists.find(l => l.id === id);
        if (!edited || !original) return;

        if (
            edited.name === original.name &&
            edited.color === original.color &&
            !extraFields?.order
        ) {
            return;
        }

        try {
            setLoadingId(id);
            await api.post(
                `/v1/Hub/Boards/${boardId}/Lists/${id}/Update`,
                {
                    name: edited.name,
                    color: edited.color,
                    ...(extraFields?.order != null ? { order: extraFields.order } : {}),
                }
            );
            onUpdate();
        } finally {
            setLoadingId(null);
        }
    };

    const moveList = async (index: number, direction: "up" | "down") => {
        const swapIndex = direction === "up" ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= lists.length) return;

        const current = lists[index];
        const target = lists[swapIndex];

        // Swap orders
        const currentOrder = current.order ?? index;
        const targetOrder = target.order ?? swapIndex;

        try {
            setLoadingId(current.id);
            await Promise.all([
                api.post(`/v1/Hub/Boards/${boardId}/Lists/${current.id}/Update`, { order: targetOrder }),
                api.post(`/v1/Hub/Boards/${boardId}/Lists/${target.id}/Update`, { order: currentOrder }),
            ]);
            onUpdate();
        } finally {
            setLoadingId(null);
        }
    };

    /* ===================== RENDER ===================== */

    return (
        <div className="flex flex-col gap-8">
            {/* Create */}
            <div className="rounded-xl border border-secondary bg-secondary/20 p-4">
                <h3 className="text-lg font-semibold">Додати список</h3>
                <p className="text-sm text-secondary mt-1">
                    Списки використовуються для організації задач.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-3">
                    <Input
                        placeholder="Назва списку"
                        value={newList.name}
                        onChange={(v) =>
                            setNewList({ ...newList, name: v })
                        }
                    />

                    <Input
                        type="color"
                        value={newList.color}
                        onChange={(v) =>
                            setNewList({ ...newList, color: v })
                        }
                    />

                    <Button onClick={createList}>
                        Додати
                    </Button>
                </div>
            </div>

            {/* Existing */}
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

                    {lists.map((list, index) => {
                        const value = editing[list.id];

                        return (
                            <div
                                key={list.id}
                                className="flex items-center gap-2 rounded-lg border border-secondary bg-primary px-3 py-2"
                            >
                                {/* Reorder arrows */}
                                <div className="flex flex-col -my-1">
                                    <button
                                        type="button"
                                        disabled={index === 0}
                                        onClick={() => moveList(index, "up")}
                                        className="p-0.5 text-fg-quaternary hover:text-fg-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={index === lists.length - 1}
                                        onClick={() => moveList(index, "down")}
                                        className="p-0.5 text-fg-quaternary hover:text-fg-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                </div>

                                <Input
                                    className="w-16"
                                    type="color"
                                    value={value?.color || "#f1f2f4"}
                                    onChange={(v) =>
                                        setEditing((prev) => ({
                                            ...prev,
                                            [list.id]: {
                                                ...prev[list.id],
                                                color: v,
                                            },
                                        }))
                                    }
                                    onBlur={() =>
                                        updateList(list.id)
                                    }
                                />

                                <Input
                                    value={value?.name || ""}
                                    onChange={(v) =>
                                        setEditing((prev) => ({
                                            ...prev,
                                            [list.id]: {
                                                ...prev[list.id],
                                                name: v,
                                            },
                                        }))
                                    }
                                    onBlur={() =>
                                        updateList(list.id)
                                    }
                                />

                                <Button
                                    color="primary-destructive"
                                    size="sm"
                                    iconLeading={Trash}
                                    isLoading={loadingId === list.id}
                                    onClick={() =>
                                        deleteList(list.id)
                                    }
                                />
                            </div>
                        );
                    })}
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
