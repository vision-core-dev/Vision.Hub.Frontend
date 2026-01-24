import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heading, type SortDescriptor } from "react-aria-components";
import { Eye, Plus, User01 } from "@untitledui/icons";

import { api } from "@/shared/utils/api";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";

import {
    Table,
    TableCard,
} from "@/shared/components/table/table";

import { Button } from "@/shared/ui/buttons/button";
import type { UserType } from "@/shared/types/Users.ts";
import { safeDate } from "@/shared/utils/safeDate.ts";
import { getAge } from "@/shared/utils/date.ts";
import { AvatarLabelGroupWithDropdown } from "@/shared/ui/avatar";
import { Dialog, DialogTrigger, Modal, ModalOverlay } from "@/shared/components/modals/modal.tsx";
import { BackgroundPattern } from "@/shared/assets/background-patterns";
import { FeaturedIcon } from "@/shared/assets/icons/featured-icon/featured-icon.tsx";
import { CloseButton } from "@/shared/ui/buttons/close-button.tsx";
import { Input, InputBase } from "@/shared/ui/input/input.tsx";
import { InputGroup } from "@/shared/ui/input/input-group.tsx";
import { Shuffle } from "lucide-react";
import type { Role } from "@/features/users/UserDetails/UserDetailsPage.tsx";
import { Select } from "@/shared/ui/select/select.tsx";


const UsersTable = ({
    title,
    users,
    onRowClick,
}: {
    title: string;
    users: UserType[];
    onRowClick: (u: UserType) => void;
}) => {
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "first_name",
        direction: "ascending",
    });

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof UserType];
            const second = b[sortDescriptor.column as keyof UserType];

            if (typeof first === "string" && typeof second === "string") {
                const cmp = first.localeCompare(second);
                return sortDescriptor.direction === "descending" ? -cmp : cmp;
            }

            return 0;
        });
    }, [users, sortDescriptor]);

    return (
        <TableCard.Root>
            <TableCard.Header
                title={title}
                badge={`${users.length}`}
            />

            <Table
                aria-label={title}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
            >
                <Table.Header>
                    <Table.Head id="first_name" label="Користувач" isRowHeader allowsSorting />
                    <Table.Head id="birthday" label="День народження" allowsSorting />
                    <Table.Head id="email" label="Email" />
                    <Table.Head id="actions" />
                </Table.Header>

                <Table.Body items={sortedUsers}>
                    {(user) => (
                        <Table.Row id={user.id}>
                            <Table.Cell>
                                <AvatarLabelGroupWithDropdown
                                    src={user.avatar_url}
                                    alt={user.first_name}
                                    size="md"
                                    title={`${user.first_name} ${user.last_name || ""}`}
                                    subtitle={user.role.name}
                                    userId={user.id}
                                    onViewProfile={() => onRowClick(user)}
                                />
                            </Table.Cell>

                            <Table.Cell>
                                {user.birthday && `${safeDate(user.birthday)} (${getAge(user.birthday)} років)`}
                            </Table.Cell>

                            <Table.Cell>
                                {user.email}
                            </Table.Cell>

                            <Table.Cell>
                                <Button size="sm" color="secondary"
                                    onClick={() => onRowClick(user)}
                                    iconLeading={Eye}
                                >Переглянути</Button>
                            </Table.Cell>

                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </TableCard.Root>
    );
};

const UsersListPage = () => {
    const [loading, setLoading] = useState(true);
    const [activeUsers, setActiveUsers] = useState<UserType[]>([]);
    const [archivedUsers, setArchivedUsers] = useState<UserType[]>([]);

    const [createModalOpen, setCreateModalOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        api.get("/v1/Hub/Users/List").then(async (res) => {
            const data = await res.json();
            setActiveUsers(data.list.filter((u: UserType) => u.is_active));
            setArchivedUsers(data.list.filter((u: UserType) => !u.is_active));
            setLoading(false);
        });
    }, []);

    return (
        <>
            <DefaultPage
                isLoading={loading}
                title="Користувачі"
                action={
                    <Button onClick={() => setCreateModalOpen(true)} iconLeading={Plus}>
                        Додати
                    </Button>
                }
            >
                <UsersTable
                    title="Активні користувачі"
                    users={activeUsers}
                    onRowClick={(u) => navigate(`/users/u/${u.id}`)}
                />
                <UsersTable
                    title="Архів"
                    users={archivedUsers}
                    onRowClick={(u) => navigate(`/users/u/${u.id}`)}
                />
            </DefaultPage>
            <CreateUserModal isOpen={createModalOpen} setIsOpen={setCreateModalOpen} />
        </>
    );
};

interface CreateUserModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const CreateUserModal = ({ isOpen, setIsOpen }: CreateUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        first_name: "",
        email: "",
        password: "",
        role_id: null as string | null,
    });

    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        if (!isOpen) return;

        api.get("/v1/Hub/UserRoles/MyLowerRoles").then(async (res) => {
            if (res.ok) {
                setRoles(await res.json());
            }
        });
    }, [isOpen]);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/v1/Hub/Users/Create", form);

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Помилка");
            }

            setIsOpen(false);
            window.location.reload(); // або callback для оновлення списку
        } catch {
            setError("Не вдалося створити користувача.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog className="overflow-hidden">
                        <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl sm:max-w-172 lg:max-w-[400px]">
                            <CloseButton onClick={() => setIsOpen(false)} theme="light" size="lg" className="absolute top-3 right-3" />
                            <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                                <div className="relative w-max max-sm:hidden">
                                    <FeaturedIcon color="gray" size="lg" theme="modern" icon={User01} />

                                    <BackgroundPattern pattern="circle" size="sm" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <div className="z-10 flex flex-col gap-0.5">
                                    <Heading slot="title" className="text-md font-semibold text-primary">
                                        Додати користувача
                                    </Heading>
                                    <p className="text-sm text-tertiary">Додати користувача до команди Vision Core Dev.</p>
                                </div>
                            </div>

                            <div className="h-5 w-full" />
                            <div className="w-full border-t border-secondary" />
                            <div className="flex flex-col justify-start gap-4 px-4 pt-5 sm:px-6">

                                <Input isRequired label="Ім'я користувача" placeholder="Тестовий"
                                    value={form.first_name}
                                    onChange={(value) =>
                                        setForm({ ...form, first_name: value })
                                    }
                                />

                                <Input isRequired label="Email" type="email" placeholder="test@mail.com"
                                    value={form.email}
                                    onChange={(value) =>
                                        setForm({ ...form, email: value })
                                    }
                                />

                                <InputGroup
                                    label="Пароль"
                                    isRequired
                                    trailingAddon={
                                        <Button
                                            color="secondary"
                                            iconLeading={Shuffle}
                                            onClick={() =>
                                                setForm({
                                                    ...form,
                                                    password: Math.random().toString(36).slice(-10),
                                                })
                                            }
                                        />
                                    }
                                >
                                    <InputBase
                                        value={form.password}
                                        onChange={(value: string) =>
                                            setForm({ ...form, password: value })
                                        }
                                        placeholder="••••••••"
                                    />
                                </InputGroup>

                                <Select
                                    label="Роль"
                                    selectedKey={form.role_id}
                                    onSelectionChange={(key) =>
                                        setForm({ ...form, role_id: key as string })
                                    }
                                    className="w-full"
                                    placeholder="Виберіть роль"
                                >
                                    {roles.map((role) => (
                                        <Select.Item
                                            key={role.id}
                                            id={role.id}
                                            label={role.name}
                                        />
                                    ))}
                                </Select>

                                {error && (
                                    <p className="text-sm text-error">
                                        {error}
                                    </p>
                                )}
                            </div>


                            <div className="z-10 flex flex-col pt-6 pb-4 sm:pt-8 sm:pb-6">
                                <div className="w-full border-t border-secondary" />

                                <div className="h-4 w-full sm:h-6" />
                                <div className="flex flex-1 flex-col-reverse gap-3 px-4 sm:grid sm:grid-cols-2 sm:px-6">
                                    <Button color="secondary" onClick={() => setIsOpen(false)}>
                                        Скасувати
                                    </Button>
                                    <Button color="primary" onClick={handleSubmit} isLoading={loading} showTextWhileLoading>
                                        Додати
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
};

export default UsersListPage;









