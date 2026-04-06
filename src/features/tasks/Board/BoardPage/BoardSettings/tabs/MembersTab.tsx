import { useMemo, useState } from "react";
import { api } from "@/shared/utils/api";
import { Trash } from "lucide-react";
import { Select } from "@/shared/ui/select/select";
import { AvatarLabelGroupWithDropdown } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/buttons/button.tsx";

/* ===================== TYPES ===================== */

export type BoardMember = {
    id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    active_badge_emoji?: string | null;
    role: string;
};

export type BoardUser = {
    id: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    is_active: boolean;
    role: {
        name: string;
    }
};

interface MembersTabProps {
    boardId: string;
    members: BoardMember[];
    users: BoardUser[];
    onUpdate: () => void;
}

const ROLE_ITEMS = [
    { id: "member", label: "Учасник" },
    { id: "admin", label: "Адмін" },
    { id: "viewer", label: "Перегляд" },
];

/* ===================== COMPONENT ===================== */

export default function MembersTab({
    boardId,
    members,
    users,
    onUpdate,
}: MembersTabProps) {
    const [newMemberId, setNewMemberId] = useState<string | null>(null);
    const [newMemberRole, setNewMemberRole] = useState("member");
    const [loading, setLoading] = useState(false);

    /* ===================== DERIVED ===================== */

    const memberIds = useMemo(
        () => new Set(members.map((m) => m.id)),
        [members]
    );

    const availableUsers = useMemo(
        () =>
            users.filter(
                (u) => u.is_active && !memberIds.has(u.id)
            ),
        [users, memberIds]
    );

    const memberItems = useMemo(
        () =>
            availableUsers.map((u) => ({
                id: u.id,
                label: `${u.first_name || "Без імені"}${u.last_name ? ` ${u.last_name}` : ""
                    }`,
                supportingText: u?.role?.name,
                avatarUrl: u.avatar_url,
            })),
        [availableUsers]
    );

    /* ===================== ACTIONS ===================== */

    const addMember = async () => {
        if (!newMemberId) return;

        try {
            setLoading(true);
            await api.post(
                `/v1/Hub/Boards/${boardId}/Members/Add`,
                {
                    user_id: newMemberId,
                    role: newMemberRole,
                }
            );
            setNewMemberId(null);
            setNewMemberRole("member");
            onUpdate();
        } finally {
            setLoading(false);
        }
    };

    const removeMember = async (userId: string) => {
        try {
            setLoading(true);
            await api.post(
                `/v1/Hub/Boards/${boardId}/Members/Remove`,
                { user_id: userId }
            );
            onUpdate();
        } finally {
            setLoading(false);
        }
    };

    const changeRole = async (userId: string, role: string) => {
        try {
            setLoading(true);
            await api.post(
                `/v1/Hub/Boards/${boardId}/Members/ChangeRole`,
                {
                    user_id: userId,
                    new_role: role,
                }
            );
            onUpdate();
        } finally {
            setLoading(false);
        }
    };

    /* ===================== RENDER ===================== */

    return (
        <div className="flex flex-col gap-8">
            {/* Add member */}
            <div className="rounded-xl border border-secondary bg-secondary/20 p-4">
                <h3 className="text-lg font-semibold">
                    Додати учасника
                </h3>
                <p className="text-sm text-secondary mt-1">
                    Запроси користувача до цієї дошки та задай йому роль.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end">
                    <Select
                        placeholder="Вибери користувача"
                        selectedKey={newMemberId}
                        onSelectionChange={(key) =>
                            setNewMemberId(String(key))
                        }
                        items={memberItems}
                    >
                        {(item) => (
                            <Select.Item
                                id={item.id}
                                avatarUrl={item.avatarUrl}
                                supportingText={item.supportingText}
                                label={item.label}
                            />
                        )}
                    </Select>

                    <Select
                        selectedKey={newMemberRole}
                        onSelectionChange={(key) =>
                            setNewMemberRole(String(key))
                        }
                        items={ROLE_ITEMS}
                    >
                        {(item) => (
                            <Select.Item id={item.id}>
                                {item.label}
                            </Select.Item>
                        )}
                    </Select>

                    <Button
                        size="md"
                        onClick={addMember}
                        isDisabled={!newMemberId}
                        isLoading={loading}
                    >
                        Додати
                    </Button>
                </div>
            </div>

            {/* Members list */}
            <div className="rounded-xl border border-secondary bg-secondary/20 p-4">
                <h3 className="text-lg font-semibold">
                    Учасники дошки
                </h3>
                <p className="text-sm text-secondary mt-1">
                    Керуй ролями та доступами учасників.
                </p>

                <div className="mt-4 flex flex-col divide-y divide-secondary">
                    {members.length === 0 && (
                        <div className="text-sm text-secondary py-4">
                            Учасників немає
                        </div>
                    )}

                    {members.map((m) => (
                        <div
                            key={m.id}
                            className="flex items-center justify-between py-3"
                        >
                            <div className="flex items-center gap-3">
                                <AvatarLabelGroupWithDropdown
                                    size="md"
                                    src={m.avatar_url}
                                    title={`${m.first_name}${m.last_name
                                            ? ` ${m.last_name}`
                                            : ""
                                        }`}
                                    badgeEmoji={m.active_badge_emoji}
                                    userId={m.id}
                                    disableDropdown
                                />

                                <Select
                                    selectedKey={m.role}
                                    onSelectionChange={(key) =>
                                        changeRole(
                                            m.id,
                                            String(key)
                                        )
                                    }
                                    items={ROLE_ITEMS}
                                    className="w-40"
                                >
                                    {(item) => (
                                        <Select.Item id={item.id}>
                                            {item.label}
                                        </Select.Item>
                                    )}
                                </Select>
                            </div>

                            <Button
                                color="primary-destructive"
                                size="md"
                                onClick={() =>
                                    removeMember(m.id)
                                }
                                isLoading={loading}
                                iconLeading={Trash}
                            />

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}









