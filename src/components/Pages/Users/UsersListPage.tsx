import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SortDescriptor } from "react-aria-components";
import { Plus } from "@untitledui/icons";

import { api } from "@/utils/api";
import DefaultPage from "@/components/basic/DefaultPage/DefaultPage";

import {
    Table,
    TableCard,
} from "@/ui/application/table/table";

import { Button } from "@/ui/base/buttons/button";
import type {UserType} from "@/types/Users.ts";
import {safeDate} from "@/utils/safeDate.ts";
import {getAge} from "@/utils/date.ts";
import {AvatarLabelGroup} from "@/ui/base/avatar/avatar-label-group.tsx";


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
                </Table.Header>

                <Table.Body items={sortedUsers}>
                    {(user) => (
                        <Table.Row id={user.id} onAction={() => onRowClick(user)}>
                            <Table.Cell>
                                <AvatarLabelGroup
                                    src={user.avatar_url}
                                    alt={user.first_name}
                                    size="md"
                                    title={`${user.first_name} ${user.last_name || ""}`}
                                    subtitle={user.role.name}
                                />
                            </Table.Cell>

                            <Table.Cell>
                                {user.birthday}
                                {/*{safeDate(user.birthday)} {getAge(user.birthday)}*/}
                            </Table.Cell>

                            <Table.Cell>
                                {user.email}
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

    const navigate = useNavigate();

    useEffect(() => {
        api.get("/v1/Hub/Users/List").then(async (res) => {
            const data = await res.json();
            setActiveUsers(data.list.filter((u: UserType) => u.is_active));
            setArchivedUsers(data.list.filter((u: UserType) => !u.is_active));
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <DefaultPage title="Користувачі" isLoading />;
    }

    if (!activeUsers.length && !archivedUsers.length) {
        return (
            <DefaultPage
                title="Користувачі"
                action={
                    <Button onClick={() => navigate("/users/add-user")} iconLeading={Plus}>
                        Додати
                    </Button>
                }
            >
                <p>Поки немає жодного користувача.</p>
            </DefaultPage>
        );
    }

    return (
        <>
            <DefaultPage
                title="Користувачі"
                action={
                    <Button onClick={() => navigate("/users/add-user")} iconLeading={Plus}>
                        Додати
                    </Button>
                }
            >
                <UsersTable
                    title="Активні користувачі"
                    users={activeUsers}
                    onRowClick={(u) => navigate(`/users/u/${u.id}`)}
                />
            </DefaultPage>

            {archivedUsers.length > 0 && (
                <DefaultPage title="Архівні користувачі">
                    <UsersTable
                        title="Архів"
                        users={archivedUsers}
                        onRowClick={(u) => navigate(`/users/u/${u.id}`)}
                    />
                </DefaultPage>
            )}
        </>
    );
};

export default UsersListPage;
