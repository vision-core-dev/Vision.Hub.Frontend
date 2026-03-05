import { useEffect, useMemo, useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { Dropdown } from "@/shared/ui/dropdown/dropdown";
import { Avatar } from "@/shared/ui/avatar/avatar";
import { AvatarLabelGroupWithDropdown } from "@/shared/ui/avatar";
import { ButtonUtility } from "@/shared/ui/buttons/button-utility";
import { api } from "@/shared/utils/api";
import styles from "./AssigneeSelector.module.css";
import { Input } from "@/shared/ui/input/input.tsx";
import type { TaskUser } from "@/features/tasks/Board/TaskDetails/TaskDetailsModal.tsx";
import type { UserType } from "@/shared/types/Users.ts";
// import { Badge } from "@/shared/ui/badges/badges.tsx"; // unused

interface Props {
    taskId: string;
    assignees: TaskUser[];
    onUpdate: (list: TaskUser[]) => void;
    isReadOnly?: boolean;
}

export const AssigneeSelector = ({ taskId, assignees, onUpdate, isReadOnly = false }: Props) => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [search, setSearch] = useState("");

    /* load users */
    useEffect(() => {
        if (isReadOnly) return;
        api.get("/v1/Hub/Users/List?only_active=true")
            .then((r) => r.json())
            .then((d) => setUsers(d.list || []));
    }, [isReadOnly]);

    const availableUsers = useMemo(() => {
        const lower = String(search).toLowerCase();
        return users.filter(
            (u) =>
                !assignees.some((a) => a.id === u.id) &&
                (
                    u.first_name.toLowerCase().includes(lower) ||
                    u.last_name?.toLowerCase().includes(lower) ||
                    u.email?.toLowerCase().includes(lower) ||
                    u.role.name.toLowerCase().includes(lower)
                )
        );
    }, [users, assignees, search]);

    /* actions */
    const assign = async (user: TaskUser) => {
        await api.post(`/v1/Hub/Tasks/${taskId}/AssignUser`, { user_id: user.id });
        onUpdate([...assignees, user]);
    };

    const unassign = async (id: string) => {
        await api.post(`/v1/Hub/Tasks/${taskId}/UnassignUser`, { user_id: id });
        onUpdate(assignees.filter((a) => a.id !== id));
    };

    return (
        <div className={styles.wrapper}>
            {/* selected users */}
            <div className={styles.chips}>
                {assignees.map((u) => (

                    <div
                        key={u.id}
                        className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white pl-1 ${isReadOnly ? "pr-2" : "pr-2"} py-0.5 shadow-sm dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors`}
                    >
                        <Avatar
                            size="xs"
                            src={u.avatar_url}
                            initials={(u.first_name[0] || "") + (u.last_name?.[0] || "")}
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                            {u.first_name}
                        </span>
                        {!isReadOnly && (
                            <button
                                className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                                onClick={() => unassign(u.id)}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    // <div key={u.id} className={styles.chip}>
                    //     <AvatarLabelGroup
                    //         size="sm"
                    //         src={u.avatar_url}
                    //         title={u.first_name}
                    //     />
                    //     <X size={14} onClick={() => unassign(u.id)} />
                    // </div>
                ))}

                {/* add */}
                {!isReadOnly && (
                    <Dropdown.Root>
                        <ButtonUtility icon={Plus} />

                        <Dropdown.Popover className={styles.dropdown}>
                            {/* search */}
                            <Input
                                placeholder="Пошук користувача…"
                                value={search}
                                onChange={(value) => setSearch(value as string)}
                                icon={Search}
                            />

                            {/* list */}
                            <div className={styles.list}>
                                {availableUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        className={styles.option}
                                        onClick={() => assign(u)}
                                    >
                                        <AvatarLabelGroupWithDropdown
                                            size="md"
                                            src={u.avatar_url}
                                            title={`${u.first_name} ${u.last_name ?? ""}`}
                                            subtitle={u.role.name}
                                            userId={u.id}
                                            disableDropdown
                                        />
                                    </div>
                                ))}

                                {availableUsers.length === 0 && (
                                    <div className={styles.empty}>
                                        Нічого не знайдено
                                    </div>
                                )}
                            </div>
                        </Dropdown.Popover>
                    </Dropdown.Root>
                )}
            </div>
        </div>
    );
};









