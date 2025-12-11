import React, { useEffect, useState } from "react";
import styles from "./AssigneeSelector.module.css";
import { Plus, X, Search } from "lucide-react";
import { api } from "../../../../../../utils/api.ts";
import Button from "../../../../../basic/Button/Button.tsx";
import UserLabel from "../../../../../basic/User/UserLabel.tsx";

interface User {
    id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
}

interface Props {
    taskId: string;
    assignees: User[];
    onUpdate: (newAssignees: User[]) => void;
}

const AssigneeSelector: React.FC<Props> = ({ taskId, assignees, onUpdate }) => {
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [showSelect, setShowSelect] = useState(false);
    const [search, setSearch] = useState("");

    // 🧠 Завантаження користувачів
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get("/v1/Hub/Users/List?only_active=true");
                const data = await res.json();
                setAvailableUsers(data.list || []);
                setFilteredUsers(data.list || []);
            } catch (e) {
                console.error("Failed to load users", e);
            }
        };
        fetchUsers();
    }, []);

    // 🔎 Фільтр пошуку
    useEffect(() => {
        if (!search) {
            setFilteredUsers(availableUsers);
            return;
        }
        const lower = search.toLowerCase();
        setFilteredUsers(
            availableUsers.filter(
                (u) =>
                    u.first_name.toLowerCase().includes(lower) ||
                    (u.last_name && u.last_name.toLowerCase().includes(lower))
            )
        );
    }, [search, availableUsers]);

    const handleAddAssignee = async (user: User) => {
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/AssignUser`, { user_id: user.id });
            onUpdate([...assignees, user]);
            setShowSelect(false);
            setSearch("");
        } catch (e) {
            console.error("Failed to assign user", e);
        }
    };

    const handleRemoveAssignee = async (userId: string) => {
        try {
            await api.post(`/v1/Hub/Tasks/${taskId}/UnassignUser`, { user_id: userId });
            onUpdate(assignees.filter((u) => u.id !== userId));
        } catch (e) {
            console.error("Failed to unassign user", e);
        }
    };

    return (
        <div className={styles.assigneesWrapper}>
            <div className={styles.assigneesList}>
                {assignees.map((a) => (
                    <div key={a.id} className={styles.assignee}>
                        <UserLabel user_id={a.id} avatar_url={a.avatar_url} name={a.first_name} />
                        {/*<Avatar className={styles.avatar} url={a.avatar_url} name={a.first_name} />*/}
                        {/*<span>{a.first_name}</span>*/}
                        <X onClick={() => handleRemoveAssignee(a.id)}
                           className={styles.removeBtn}
                           size={16} />
                    </div>
                ))}
                <Button variant="secondary" onClick={() => setShowSelect((prev) => !prev)}>
                    <Plus />
                </Button>
            </div>

            {showSelect && (
                <div className={styles.dropdown}>
                    <div className={styles.searchBox}>
                        <Search size={14} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Пошук користувача..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className={styles.userList}>
                        {filteredUsers
                            .filter((u) => !assignees.some((a) => a.id === u.id))
                            .map((u) => (
                                <div
                                    key={u.id}
                                    className={styles.userOption}
                                    onClick={() => handleAddAssignee(u)}
                                >
                                    <UserLabel avatar_url={u.avatar_url} name={u.first_name} />
                                </div>
                            ))}

                        {filteredUsers.filter((u) => !assignees.some((a) => a.id === u.id)).length === 0 && (
                            <div className={styles.empty}>Нічого не знайдено</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssigneeSelector;
