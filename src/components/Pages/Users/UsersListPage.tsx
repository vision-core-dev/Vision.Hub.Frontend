import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useNavigate } from "react-router-dom";
import Table from "../../basic/Table/Table.tsx";
import UserLabel from "../../basic/User/UserLabel.tsx";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import Button from "../../basic/Button/Button.tsx";
import {Plus} from "lucide-react";
import type {UserRoleType} from "../../../types/Users.ts";

interface User {
    id: string;
    email: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    role: { name: string };
    is_active: boolean;
    created_at: string;
}

const UsersListPage = () => {
    const [usersCount, setUsersCount] = useState<number>(0);

    const [activeUsers, setActiveUsers] = useState<User[]>([]);
    const [archivedUsers, setArchivedUsers] = useState<User[]>([]);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/v1/Hub/Users/List").then(async (res) => {
            const data = await res.json();

            setUsersCount(data.list.length);
            setActiveUsers(data.list.filter((u: User) => u.is_active));
            setArchivedUsers(data.list.filter((u: User) => !u.is_active));

            setLoading(false);
        });
    }, []);

    const usersColumns = [
        {
            key: "first_name",
            label: "Користувач",
            render: (v: string, row: User) => v && (
                <UserLabel
                    name={`${row.first_name} ${row.last_name || ""}`.trim()}
                    avatar_url={row.avatar_url}
                />
            ),
        },
        { key: "role", label: "Роль", render: (v: UserRoleType) => v?.name || "—" },
        { key: "email", label: "Email" },
    ]

    if (loading) {
        return <DefaultPage title="Користувачі" isLoading={true} />;
    }

    if (usersCount === 0) {
        return (
            <DefaultPage
                title={`Користувачі`}
                action={
                    <Button adaptive={true} onClick={() => navigate("/users/add-user")}
                    >
                        <Plus strokeWidth={2.25} />Додати
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
                title={`Користувачі ${activeUsers.length}`}
                action={
                    <Button adaptive={true} onClick={() => navigate("/users/add-user")}
                    >
                        <Plus strokeWidth={2.25} />Додати
                    </Button>
                }
            >
                <Table
                    columns={usersColumns}
                    data={activeUsers}
                    onRowClick={(row) => navigate(`/users/u/${row.id}`)}
                />
            </DefaultPage>

            <DefaultPage
                title={`Архівні користувачі ${archivedUsers.length}`}
            >
                <Table
                    columns={usersColumns}
                    data={archivedUsers}
                    onRowClick={(row) => navigate(`/users/u/${row.id}`)}
                />
            </DefaultPage>
        </>
    );
};

export default UsersListPage;