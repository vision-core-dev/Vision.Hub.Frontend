import React, { useState } from "react";
import styles from "./TagSelector.module.css";
import { Plus, X, Search } from "lucide-react";
import { api } from "@/utils/api.ts";
import { getTextColor } from "@/utils/colors.ts";
import {ButtonUtility} from "@/ui/base/buttons/button-utility.tsx";

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface Props {
    taskId: string;
    boardTags: Tag[];
    selectedTags: Tag[];
    onUpdate: (newTags: Tag[]) => void;
}

const TagSelector: React.FC<Props> = ({ taskId, boardTags, selectedTags, onUpdate }) => {
    const [showSelect, setShowSelect] = useState(false);
    const [search, setSearch] = useState("");

    // 🔎 Фільтрація тегів
    const filteredTags = boardTags.filter(
        (tag) =>
            tag.name.toLowerCase().includes(search.toLowerCase()) &&
            !selectedTags.some((t) => t.id === tag.id)
    );

    const handleAddTag = async (tag: Tag) => {
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/AssignTag`, { tag_id: tag.id });
            onUpdate([...selectedTags, tag]);
            setShowSelect(false);
            setSearch("");
        } catch (e) {
            console.error("Failed to assign tag", e);
        }
    };

    const handleRemoveTag = async (tagId: string) => {
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/UnassignTag`, { tag_id: tagId });
            onUpdate(selectedTags.filter((t) => t.id !== tagId));
        } catch (e) {
            console.error("Failed to unassign tag", e);
        }
    };

    return (
        <div className={styles.tagsWrapper}>
            <div className={styles.tagsList}>
                {selectedTags.map((tag) => (
                    <div
                        key={tag.id}
                        className={styles.tag}
                        style={{ backgroundColor: tag.color, color: getTextColor(tag.color) }}
                    >
                        <span>{tag.name}</span>
                        <X
                            color={getTextColor(tag.color)}
                            onClick={() => handleRemoveTag(tag.id)}
                            className={styles.removeBtn}
                            size={14}
                        />
                    </div>
                ))}
                <ButtonUtility onClick={() => setShowSelect((prev) => !prev)} icon={Plus} />
            </div>

            {showSelect && (
                <div className={styles.dropdown}>
                    <div className={styles.searchBox}>
                        <Search size={14} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Пошук мітки..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className={styles.tagsListDropdown}>
                        {filteredTags.map((tag) => (
                            <div
                                key={tag.id}
                                className={styles.tagOption}
                                onClick={() => handleAddTag(tag)}
                            >
                                <span
                                    className={styles.tagColor}
                                    style={{ backgroundColor: tag.color }}
                                />
                                {tag.name}
                            </div>
                        ))}
                        {filteredTags.length === 0 && (
                            <div className={styles.empty}>Нічого не знайдено</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagSelector;
