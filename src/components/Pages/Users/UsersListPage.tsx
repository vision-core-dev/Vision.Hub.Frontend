import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useNavigate } from "react-router-dom";
import Table from "../../basic/Table/Table.tsx";
import UserLabel from "../../basic/User/UserLabel.tsx";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import Button from "../../basic/Button/Button.tsx";
import {Plus} from "lucide-react";

interface User {
    id: string;
    email: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    role: { name: string };
    created_at: string;
}

const UsersListPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/v1/Hub/Users/List").then(async (res) => {
            const data = await res.json();
            setUsers(data.list);
            setLoading(false);
        });
    }, []);

    return (
        <DefaultPage
            title="Користувачі"
            action={
                <Button adaptive={true} onClick={() => navigate("/users/add-user")}
                >
                    <Plus strokeWidth={2.25} />Додати
                </Button>
            }
            isLoading={loading}
        >
            {users.length === 0 ? (
                <p>Поки немає жодного користувача.</p>
            ) : (
                <Table
                    columns={[
                        {
                            key: "first_name",
                            label: "Користувач",
                            render: (v, row) => v && (
                                <UserLabel
                                    name={`${row.first_name} ${row.last_name || ""}`.trim()}
                                    avatar_url={row.avatar_url}
                                />
                            ),
                        },
                        { key: "role", label: "Роль", render: (v) => v?.name || "—" },
                        { key: "email", label: "Email" },
                    ]}
                    data={users}
                    onRowClick={(row) => navigate(`/users/u/${row.id}`)}
                />
            )}
        </DefaultPage>
    );
};

export default UsersListPage;