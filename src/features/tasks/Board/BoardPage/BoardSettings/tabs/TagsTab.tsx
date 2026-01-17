import { useState } from "react";
import { api } from "@/shared/utils/api";
import { Trash } from "lucide-react";
import {Button} from "@/shared/ui/buttons/button.tsx";
import {Input} from "@/shared/ui/input/input.tsx";

/* ===================== TYPES ===================== */

export interface BoardTag {
    id: string;
    name: string;
    color: string;
}

interface TagsTabProps {
    boardId: string;
    tags: BoardTag[];
    onUpdate: () => void;
}

/* ===================== COMPONENT ===================== */

export default function TagsTab({
                                    boardId,
                                    tags,
                                    onUpdate,
                                }: TagsTabProps) {
    const [newTag, setNewTag] = useState({
        name: "",
        color: "#5a8dee",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ===================== ACTIONS ===================== */

    const createTag = async () => {
        if (!newTag.name.trim()) return;

        try {
            setLoading(true);
            setError(null);

            await api.post(
                `/v1/Hub/Boards/${boardId}/Tags/Create`,
                newTag
            );

            setNewTag({ name: "", color: "#5a8dee" });
            onUpdate();
        } catch {
            setError("Не вдалося створити тег");
        } finally {
            setLoading(false);
        }
    };

    const deleteTag = async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            await api.post(
                `/v1/Hub/Boards/${boardId}/Tags/${id}/Remove`
            );

            onUpdate();
        } catch {
            setError("Не вдалося видалити тег");
        } finally {
            setLoading(false);
        }
    };

    /* ===================== RENDER ===================== */

    return (
        <div className="flex flex-col gap-8">
            {/* Create tag */}
            <div className="rounded-xl border border-secondary bg-secondary/20 p-4">
                <h3 className="text-lg font-semibold">Додати тег</h3>
                <p className="text-sm text-secondary mt-1">
                    Теги допомагають швидко фільтрувати та
                    структурувати задачі.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-3">
                    <Input
                        type="text"
                        placeholder="Назва тегу"
                        value={newTag.name}
                        onChange={(value) =>
                            setNewTag({
                                ...newTag,
                                name: value,
                            })
                        }
                    />

                    <Input
                        type="color"
                        value={newTag.color}
                        onChange={(value) =>
                            setNewTag({
                                ...newTag,
                                color: value,
                            })
                        }
                    />

                    <Button
                        size="md"
                        onClick={createTag}
                        isLoading={loading}
                    >
                        Додати
                    </Button>
                </div>
            </div>

            {/* Tags list */}
            <div className="rounded-xl border border-secondary bg-secondary/20 p-4">
                <h3 className="text-lg font-semibold">
                    Теги дошки
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                    {tags.length === 0 && (
                        <span className="text-sm text-secondary">
                            Тегів ще немає
                        </span>
                    )}

                    {tags.map((tag) => (
                        <div
                            key={tag.id}
                            className="flex items-center gap-2 rounded-full border border-secondary bg-primary px-3 py-1.5"
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                    backgroundColor: tag.color,
                                }}
                            />
                            <span className="text-sm font-medium">
                                {tag.name}
                            </span>

                            <Button
                                size="md"
                                color="primary-destructive"
                                onClick={() =>
                                    deleteTag(tag.id)
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









