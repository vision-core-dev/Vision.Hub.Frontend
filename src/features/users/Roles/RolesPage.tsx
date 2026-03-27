import { useState, useEffect } from "react";
import { useDragAndDrop, Button as AriaButton } from "react-aria-components";
import { Plus, Edit01, Trash01, Menu01 } from "@untitledui/icons";

import { api } from "@/shared/utils/api";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { Table, TableCard } from "@/shared/components/table/table";
import { Button } from "@/shared/ui/buttons/button";
import { useAuth } from "@/core/auth/AuthContext";

import { RoleModal, type UserRole } from "./RoleModal.tsx";

export default function RolesPage() {
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const { role: myRole } = useAuth();
    
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

    const canEdit = (targetRole: UserRole) => {
        if (!myRole) return false;
        return targetRole.order > myRole.order;
    };

    const fetchRoles = () => {
        setLoading(true);
        api.get("/v1/Hub/UserRoles").then(async (res) => {
            if (res.ok) {
                const data: UserRole[] = await res.json();
                setRoles(data.sort((a, b) => a.order - b.order));
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleDelete = async (role: UserRole) => {
        if (!confirm(`Ви впевнені, що хочете видалити роль "${role.name}"?`)) return;
        const response = await api.delete(`/v1/Hub/UserRoles/${role.id}`);
        if (response.ok) fetchRoles();
    };

    const { dragAndDropHooks } = useDragAndDrop({
        getItems: (keys) => {
            const dragId = [...keys][0] as string;
            const draggedRole = roles.find((r) => r.id === dragId);
            if (!draggedRole || !canEdit(draggedRole)) return [];
            return [...keys].map((key) => ({ 'text/plain': key.toString() }));
        },
        onReorder: async (e) => {
            const keysArray = [...e.keys];
            const draggedKey = keysArray[0] as string;
            const targetKey = e.target.key as string;

            if (draggedKey === targetKey) return;

            const oldIndex = roles.findIndex((r) => r.id === draggedKey);
            const newIndex = roles.findIndex((r) => r.id === targetKey);

            if (oldIndex === -1 || newIndex === -1) return;
            
            const draggedRole = roles[oldIndex];
            if (!canEdit(draggedRole)) return;

            const reorderedRoles = [...roles];
            const [movedRole] = reorderedRoles.splice(oldIndex, 1);

            let dropIndex = newIndex;
            if (e.target.dropPosition === 'after') {
                dropIndex = newIndex + (oldIndex > newIndex ? 1 : 0);
            } else if (e.target.dropPosition === 'before') {
                dropIndex = newIndex - (oldIndex < newIndex ? 1 : 0);
            }
            
            if (myRole && dropIndex <= myRole.order) {
                return;
            }

            reorderedRoles.splice(dropIndex, 0, movedRole);

            const updatedRoles = reorderedRoles.map((role, idx) => ({ ...role, order: idx }));
            setRoles(updatedRoles);

            try {
                await Promise.all(
                    updatedRoles.map((role) =>
                        api.patch(`/v1/Hub/UserRoles/${role.id}`, { order: role.order })
                    )
                );
            } catch (err) {
                console.error("Order update failed", err);
                fetchRoles();
            }
        }
    });

    return (
        <DefaultPage
            isLoading={loading}
            title="Ролі користувачів"
            action={
                <Button 
                    onClick={() => {
                        setSelectedRole(null);
                        setModalOpen(true);
                    }} 
                    iconLeading={Plus}
                >
                    Додати роль
                </Button>
            }
        >
            <TableCard.Root>
                <TableCard.Header title="Усі ролі" badge={`${roles.length}`} />
                <Table dragAndDropHooks={dragAndDropHooks} aria-label="Ролі">
                    <Table.Header>
                        <Table.Head id="drag_handle" />
                        <Table.Head id="name" label="Назва" />
                        <Table.Head id="key" label="Ключ" />
                        <Table.Head id="order" label="Порядок (Ієрархія)" />
                        <Table.Head id="actions" />
                    </Table.Header>
                    <Table.Body items={roles}>
                        {(role) => {
                            const isEditable = canEdit(role);
                            return (
                                <Table.Row id={role.id}>
                                    <Table.Cell>
                                        {isEditable && (
                                            <AriaButton slot="drag" className="cursor-grab p-1 text-tertiary outline-none hover:text-primary data-[dragging]:cursor-grabbing">
                                                <Menu01 className="h-4 w-4" />
                                            </AriaButton>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>{role.name}</Table.Cell>
                                    <Table.Cell>{role.key}</Table.Cell>
                                    <Table.Cell>{role.order.toString()}</Table.Cell>
                                    <Table.Cell>
                                        {isEditable ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    color="secondary"
                                                    iconLeading={Edit01}
                                                    onClick={() => {
                                                        setSelectedRole(role);
                                                        setModalOpen(true);
                                                    }}
                                                >
                                                    Редагувати
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    color="secondary-destructive"
                                                    iconLeading={Trash01}
                                                    onClick={() => handleDelete(role)}
                                                >
                                                    Видалити
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-tertiary px-2 italic">Немає доступу</span>
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            );
                        }}
                    </Table.Body>
                </Table>
            </TableCard.Root>
            
            <RoleModal 
                isOpen={modalOpen} 
                setIsOpen={setModalOpen} 
                role={selectedRole}
                onSuccess={fetchRoles}
            />
        </DefaultPage>
    );
}
