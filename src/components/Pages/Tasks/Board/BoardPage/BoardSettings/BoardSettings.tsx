import React, { useEffect, useState } from "react";
import styles from "./BoardSettings.module.css";
import {api} from "../../../../../../utils/api.ts";
import Button from "../../../../../basic/Button/Button.tsx";
import LoaderDots from "../../../../../basic/LoaderDots/LoaderDots.tsx";
import {Trash} from "lucide-react";

type Tag = {
    id: string;
    name: string;
    color: string;
};

type List = {
    id: string;
    name: string;
    color?: string;
    order?: number;
};

interface Props {
    boardId: string;
}

const BoardSettings: React.FC<Props> = ({ boardId }) => {
    const [activeTab, setActiveTab] = useState<"tags" | "lists">("tags");
    const [tags, setTags] = useState<Tag[]>([]);
    const [lists, setLists] = useState<List[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newTag, setNewTag] = useState({ name: "", color: "#5a8dee" });
    const [newList, setNewList] = useState({ name: "", color: "#f1f2f4" });

    useEffect(() => {
        fetchSettings();
    }, [boardId]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/v1/Hub/Boards/${boardId}/GetDetails`);
            const data = await res.json();

            if (res.ok) {
                setTags(data.tags);
                setLists(data.lists);
            } else {
                setError(data.detail)
            }
        } finally {
            setLoading(false);
        }
    };

    const refresh = async (res: Response) => {
        setError(null);
        if (res.ok) {
            fetchSettings()
        } else {
            const data = await res.json();
            setError(data.detail)
        }

        setNewList({ name: "", color: "#f1f2f4" });
        setNewTag({ name: "", color: "#5a8dee" });
    }

    const createTag = async () => {
        if (!newTag.name.trim()) return;
        const res = await api.post(`/v1/Hub/Boards/${boardId}/Tags/Create`, newTag);
        await refresh(res);
    };

    const createList = async () => {
        if (!newList.name.trim()) return;
        const res = await api.post(`/v1/Hub/Boards/${boardId}/Lists/Create`, newList);
        await refresh(res);
    };

    const deleteTag = async (id: string) => {
        const res = await api.post(`/v1/Hub/Boards/${boardId}/Tags/${id}/Remove`);
        await refresh(res);
    };

    const deleteList = async (id: string) => {
        const res = await api.post(`/v1/Hub/Boards/${boardId}/Lists/${id}/Remove`);
        await refresh(res);
    };

    if (loading) {
        return (
            <div className={styles.settings}>
                <LoaderDots />
            </div>
        );
    }

    return (
        <div className={styles.settings}>
            <div className={styles.tabs}>
                <button
                    className={activeTab === "tags" ? styles.active : ""}
                    onClick={() => setActiveTab("tags")}
                >
                    🏷️ Теги
                </button>
                <button
                    className={activeTab === "lists" ? styles.active : ""}
                    onClick={() => setActiveTab("lists")}
                >
                    📋 Списки
                </button>
            </div>

            {error}


            {activeTab === "tags" && (
                <div className={styles.tabContent}>
                    <div className={styles.createRow}>
                        <input
                            type="text"
                            placeholder="Назва тегу"
                            value={newTag.name}
                            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                        />
                        <input
                            type="color"
                            value={newTag.color}
                            onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                        />
                        <Button onClick={createTag}>Додати</Button>
                    </div>

                    <div className={styles.list}>
                        {tags.map((tag) => (
                            <div key={tag.id} className={styles.tagItem}>
                                <div
                                    className={styles.colorPreview}
                                    style={{ backgroundColor: tag.color }}
                                />
                                <span>{tag.name}</span>
                                <button onClick={() => deleteTag(tag.id)}>🗑</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "lists" && (
                <div className={styles.tabContent}>
                    <div className={styles.createRow}>
                        <input
                            type="text"
                            placeholder="Назва списку"
                            value={newList.name}
                            onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                        />
                        <input
                            type="color"
                            value={newList.color}
                            onChange={(e) => setNewList({ ...newList, color: e.target.value })}
                        />
                        <Button onClick={createList}>Додати</Button>
                    </div>

                    <div className={styles.list}>
                        {lists.map((list) => (
                            <div key={list.id} className={styles.listItem}>
                                <div
                                    className={styles.colorPreview}
                                    style={{ backgroundColor: list.color }}
                                />
                                <span>{list.name}</span>
                                <Button variant="danger" onClick={() => deleteList(list.id)}><Trash /></Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoardSettings;
