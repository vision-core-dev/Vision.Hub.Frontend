import React, { useEffect, useState } from "react";
import styles from "./BoardSettings.module.css";
import { api } from "../../../../../../utils/api.ts";
import Button from "../../../../../basic/Button/Button.tsx";
import LoaderDots from "../../../../../basic/LoaderDots/LoaderDots.tsx";
import { Trash, Image, Upload } from "lucide-react";
import type {UserType} from "../../../../../../types/Users.ts";
import UserLabel from "../../../../../basic/User/UserLabel.tsx";

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
type Member = {
    id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    role: string;
};



const BoardSettings: React.FC<Props> = ({ boardId }) => {
    const [activeTab, setActiveTab] = useState<"tags" | "lists" | "banner" | "members">("tags");
    const [tags, setTags] = useState<Tag[]>([]);
    const [lists, setLists] = useState<List[]>([]);
    const [bannerUrl, setBannerUrl] = useState<string>("");

    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    const [members, setMembers] = useState<Member[]>([]);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
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
                setBannerUrl(data.board.banner_url || "");
                setAllUsers(data.users || []);

                const boardMembers: Record<string, string> = data.board.members || {};
                const users: UserType[] = data.users || [];

                const combinedMembers = users
                    .filter((u) => Object.keys(boardMembers).includes(u.id)) // беремо лише тих, хто у members
                    .map((u) => ({
                        id: u.id,
                        first_name: u.first_name,
                        last_name: u.last_name,
                        avatar_url: u.avatar_url,
                        role: boardMembers[u.id] || "member",
                    }));

                setMembers(combinedMembers);

            } else {
                setError(data.detail);
            }
        } finally {
            setLoading(false);
        }
    };

    const refresh = async (res: Response) => {
        setError(null);
        if (res.ok) {
            fetchSettings();
        } else {
            const data = await res.json();
            setError(data.detail);
        }

        setNewList({ name: "", color: "#f1f2f4" });
        setNewTag({ name: "", color: "#5a8dee" });
    };

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

    const updateBanner = async () => {
        if (!bannerUrl.trim()) return;
        const res = await api.post(`/v1/Hub/Boards/${boardId}/SetBanner`, { banner_url: bannerUrl });
        await refresh(res);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post(`/v1/Hub/Boards/${boardId}/UploadBanner`, formData);
            const data = await res.json();

            if (!res.ok) setError(data.detail || "unknown_error");
            setBannerUrl(data.banner_url);
        } finally {
            setUploading(false);
        }
    };

    const [newMemberId, setNewMemberId] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("member");

    const addMember = async () => {
        const res = await api.post(`/v1/Hub/Boards/${boardId}/Members/Add`, {
            user_id: newMemberId,
            role: newMemberRole,
        });
        await refresh(res);
    };

    const removeMember = async (id: string) => {
        const res = await api.post(`/v1/Hub/Boards/${boardId}/Members/Remove`, {
            user_id: id,
        });
        await refresh(res);
    };

    const changeRole = async (id: string, newRole: string) => {
        const res = await api.post(`/v1/Hub/Boards/${boardId}/Members/ChangeRole`, {
            user_id: id,
            new_role: newRole,
        });
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
                <Button
                    variant={activeTab === "tags" ? "primary" : "secondary"}
                    onClick={() => setActiveTab("tags")}
                >
                    Теги
                </Button>
                <Button
                    variant={activeTab === "lists" ? "primary" : "secondary"}
                    onClick={() => setActiveTab("lists")}
                >
                    Списки
                </Button>
                <Button
                    variant={activeTab === "banner" ? "primary" : "secondary"}
                    onClick={() => setActiveTab("banner")}
                >
                    Банер
                </Button>
                <Button
                    variant={activeTab === "members" ? "primary" : "secondary"}
                    onClick={() => setActiveTab("members")}
                >
                    Учасники
                </Button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

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
                                <Button variant="danger" onClick={() => deleteTag(tag.id)}><Trash /></Button>
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
                                <Button variant="danger" onClick={() => deleteList(list.id)}>
                                    <Trash />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "banner" && (
                <div className={styles.tabContent}>
                    <div className={styles.bannerPreview}>
                        {bannerUrl ? (
                            <img src={bannerUrl} alt="Banner preview" />
                        ) : (
                            <div className={styles.placeholder}>Банер не встановлено</div>
                        )}
                    </div>

                    <div className={styles.createRow}>
                        <input
                            type="text"
                            placeholder="URL зображення банера"
                            value={bannerUrl}
                            onChange={(e) => setBannerUrl(e.target.value)}
                        />
                        <Button onClick={updateBanner} disabled={uploading}>
                            <Image strokeWidth={2} /> {uploading ? "..." : "Оновити"}
                        </Button>
                    </div>

                    <div className={styles.uploadRow}>
                        <label className={styles.uploadButton}>
                            <Upload strokeWidth={2} />
                            Завантажити файл
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                        </label>
                    </div>
                </div>
            )}

            {activeTab === "members" && (
                <div className={styles.tabContent}>
                    <div className={styles.createRow}>
                        <select
                            value={newMemberId}
                            onChange={(e) => setNewMemberId(e.target.value)}
                        >
                            <option value="">Вибери користувача...</option>
                            {allUsers
                                .filter((u) => !members.some((m) => m.id === u.id)) // не показує вже доданих
                                .map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.first_name || "Без імені"}
                                    </option>
                                ))}
                        </select>

                        <select
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value)}
                        >
                            <option value="member">Учасник</option>
                            <option value="admin">Адмін</option>
                            <option value="viewer">Перегляд</option>
                        </select>

                        <Button onClick={addMember} disabled={!newMemberId}>
                            Додати
                        </Button>
                    </div>

                    <div className={styles.list}>
                        {members.map((m) => (
                            <div key={m.id} className={styles.memberItem}>
                                <div>
                                    <UserLabel user_id={m.id} avatar_url={m.avatar_url} name={`${m.first_name} ${m.last_name || ""}`} />
                                    <select
                                        value={m.role || "member"}
                                        onChange={(e) => changeRole(m.id, e.target.value)}
                                    >
                                        <option value="member">Учасник</option>
                                        <option value="admin">Адмін</option>
                                    </select>
                                </div>

                                <Button variant="danger" onClick={() => removeMember(m.id)}>
                                    <Trash />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
};

export default BoardSettings;
