import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Dropdown } from "@/ui/base/dropdown/dropdown";
import { ButtonUtility } from "@/ui/base/buttons/button-utility";
import { Input } from "@/ui/base/input/input";
import {BadgeWithButton} from "@/ui/base/badges/badges";
import { api } from "@/utils/api";
import styles from "./TagSelector.module.css";

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface Props {
    taskId: string;
    boardTags: Tag[];
    selectedTags: Tag[];
    onUpdate: (tags: Tag[]) => void;
}

export const TagSelector = ({
                                taskId,
                                boardTags,
                                selectedTags,
                                onUpdate,
                            }: Props) => {
    const [search, setSearch] = useState("");

    /* available tags */
    const availableTags = useMemo(() => {
        const lower = search.toLowerCase();
        return boardTags.filter(
            (t) =>
                !selectedTags.some((s) => s.id === t.id) &&
                t.name.toLowerCase().includes(lower)
        );
    }, [boardTags, selectedTags, search]);

    /* actions */
    const assign = async (tag: Tag) => {
        await api.post(`/v1/Hub/Tasks/${taskId}/AssignTag`, {
            tag_id: tag.id,
        });
        onUpdate([...selectedTags, tag]);
        setSearch("");
    };

    const unassign = async (id: string) => {
        await api.post(`/v1/Hub/Tasks/${taskId}/UnassignTag`, {
            tag_id: id,
        });
        onUpdate(selectedTags.filter((t) => t.id !== id));
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.chips}>
                {/* selected tags */}
                {selectedTags.map((tag) => (
                    <BadgeWithButton type="color" color="gray" size="lg" buttonLabel="Clear" onButtonClick={() => unassign(tag.id)}>
                        {tag.name}
                    </BadgeWithButton >
                ))}

                {/* add */}
                <Dropdown.Root>
                    <ButtonUtility icon={Plus} />

                    <Dropdown.Popover className={styles.dropdown}>
                        <Input
                            placeholder="Пошук мітки…"
                            value={search}
                            onChange={(v) => setSearch(v as string)}
                            icon={Search}
                        />

                        <div className={styles.list}>
                            {availableTags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className={styles.option}
                                    onClick={() => assign(tag)}
                                >
                                    <span
                                        className={styles.color}
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    {tag.name}
                                </div>
                            ))}

                            {availableTags.length === 0 && (
                                <div className={styles.empty}>
                                    Нічого не знайдено
                                </div>
                            )}
                        </div>
                    </Dropdown.Popover>
                </Dropdown.Root>
            </div>
        </div>
    );
};
