import { useEffect, useMemo, useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { Dropdown } from "@/ui/base/dropdown/dropdown";
import { AvatarLabelGroup } from "@/ui/base/avatar/avatar-label-group";
import { ButtonUtility } from "@/ui/base/buttons/button-utility";
import { api } from "@/utils/api";
import styles from "./AssigneeSelector.module.css";
import {Input} from "@/ui/base/input/input.tsx";
import type {TaskUser} from "@/components/Pages/Tasks/Board/TaskDetails/TaskDetailsModal.tsx";
import type {UserType} from "@/types/Users.ts";
import {Badge} from "@/ui/base/badges/badges.tsx";

interface Props {
    taskId: string;
    assignees: TaskUser[];
    onUpdate: (list: TaskUser[]) => void;
}

export const AssigneeSelector = ({ taskId, assignees, onUpdate }: Props) => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [search, setSearch] = useState("");

    /* load users */
    useEffect(() => {
        api.get("/v1/Hub/Users/List?only_active=true")
            .then((r) => r.json())
            .then((d) => setUsers(d.list || []));
    }, []);

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

                    <Badge color="gray" size="lg">
                        <AvatarLabelGroup
                            size="sm"
                            src={u.avatar_url}
                            title={u.first_name}
                        />
                        <X size={14} onClick={() => unassign(u.id)} />
                    </Badge>

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
                                    <AvatarLabelGroup
                                        size="md"
                                        src={u.avatar_url}
                                        title={`${u.first_name} ${u.last_name ?? ""}`}
                                        subtitle={u.role.name}
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
            </div>
        </div>
    );
};
