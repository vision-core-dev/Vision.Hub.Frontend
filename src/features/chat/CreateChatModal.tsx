import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { CloseButton } from "@/shared/ui/buttons/close-button";
import { Tabs } from "@/shared/components/tabs/tabs";
import { AvatarLabelGroup } from "@/shared/ui/avatar";
import { chatApi } from "./api";
import { api } from "@/shared/utils/api";
import type { UserType } from "@/shared/types/Users";
import { cx } from "@/shared/utils/cx";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import type { Key } from "react-aria-components";

interface CreateChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onChatCreated?: () => void;
}

const tabs = [
    { id: "direct", label: "Особистий чат" },
    { id: "group", label: "Груповий чат" },
];

export default function CreateChatModal({ isOpen, onClose, onChatCreated }: CreateChatModalProps) {
    const [tab, setTab] = useState<Key>("direct");
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [groupName, setGroupName] = useState("");
    const navigate = useNavigate();

    // Load users
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.get("/v1/Hub/Users/List")
                .then((res) => res.json())
                .then((data) => setUsers(data.list || []))
                .catch(() => setUsers([]))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearch("");
            setSelectedUserId(null);
            setSelectedUserIds([]);
            setGroupName("");
            setTab("direct");
        }
    }, [isOpen]);

    // Filter users based on search
    const filteredUsers = users.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name || ""}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
    });

    // Create direct chat
    const handleCreateDirectChat = async () => {
        if (!selectedUserId) return;

        try {
            setCreating(true);
            const chat = await chatApi.getOrCreateDirectChat(selectedUserId);
            onChatCreated?.();
            navigate(`/chat/${chat.id}`);
        } catch (error) {
            console.error("Failed to create chat:", error);
        } finally {
            setCreating(false);
        }
    };

    // Create group chat
    const handleCreateGroupChat = async () => {
        if (!groupName.trim() || selectedUserIds.length === 0) return;

        try {
            setCreating(true);
            const chat = await chatApi.createGroupChat(groupName.trim(), selectedUserIds);
            onChatCreated?.();
            navigate(`/chat/${chat.id}`);
        } catch (error) {
            console.error("Failed to create group chat:", error);
        } finally {
            setCreating(false);
        }
    };

    // Toggle user selection for group chat
    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="w-full max-w-md rounded-2xl bg-primary p-6 shadow-2xl flex flex-col gap-6">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Новий чат</h2>
                                <CloseButton onClick={onClose} />
                            </div>

                            {/* Tabs */}
                            <Tabs selectedKey={tab} onSelectionChange={setTab}>
                                <Tabs.List type="underline" items={tabs}>
                                    {(tab) => <Tabs.Item {...tab} />}
                                </Tabs.List>
                            </Tabs>

                            {/* Content */}
                            <div className="flex flex-col gap-4">
                                {tab === "group" && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Назва групи</label>
                                        <Input
                                            value={groupName}
                                            onChange={setGroupName}
                                            placeholder="Введіть назву групи..."
                                        />
                                    </div>
                                )}

                                {/* User search */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">
                                        {tab === "direct" ? "Оберіть користувача" : "Оберіть учасників"}
                                    </label>
                                    <Input
                                        icon={Search}
                                        value={search}
                                        onChange={setSearch}
                                        placeholder="Пошук користувачів..."
                                    />
                                </div>

                                {/* User list */}
                                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                                    {loading ? (
                                        <p className="text-sm text-tertiary text-center py-4">
                                            Завантаження...
                                        </p>
                                    ) : filteredUsers.length === 0 ? (
                                        <p className="text-sm text-tertiary text-center py-4">
                                            Користувачів не знайдено
                                        </p>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className={cx(
                                                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                                    tab === "direct"
                                                        ? selectedUserId === user.id
                                                            ? "bg-secondary ring-1 ring-brand-500"
                                                            : "hover:bg-secondary/50"
                                                        : selectedUserIds.includes(user.id)
                                                            ? "bg-secondary ring-1 ring-brand-500"
                                                            : "hover:bg-secondary/50"
                                                )}
                                                onClick={() => {
                                                    if (tab === "direct") {
                                                        setSelectedUserId(user.id);
                                                    } else {
                                                        toggleUserSelection(user.id);
                                                    }
                                                }}
                                            >
                                                <AvatarLabelGroup
                                                    size="sm"
                                                    src={user.avatar_url}
                                                    title={`${user.first_name} ${user.last_name || ""}`}
                                                    subtitle={user.role?.name}
                                                    badgeEmoji={user.active_badge_emoji}
                                                />

                                                {tab === "group" && selectedUserIds.includes(user.id) && (
                                                    <span className="ml-auto text-brand-500">✓</span>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Selected users count for group */}
                                {tab === "group" && selectedUserIds.length > 0 && (
                                    <p className="text-sm text-tertiary">
                                        Обрано: {selectedUserIds.length} користувачів
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2">
                                <Button type="button" color="secondary" onClick={onClose}>
                                    Скасувати
                                </Button>
                                <Button
                                    type="button"
                                    isLoading={creating}
                                    disabled={
                                        creating ||
                                        (tab === "direct" && !selectedUserId) ||
                                        (tab === "group" && (!groupName.trim() || selectedUserIds.length === 0))
                                    }
                                    onClick={tab === "direct" ? handleCreateDirectChat : handleCreateGroupChat}
                                >
                                    Створити чат
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}
