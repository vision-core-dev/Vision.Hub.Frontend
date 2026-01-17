import { useEffect, useState } from "react";
import { api } from "@/shared/utils/api";
import UserValue from "../user-value/UserValue.tsx";
import type {SmallUser} from "@/shared/types/Users.ts";

import styles from "./UserSelect.module.css";

interface Props {
    onChange: (ids: string[]) => void;
}

const UserSelect: React.FC<Props> = ({ onChange }) => {
    const [users, setUsers] = useState<SmallUser[]>([]);
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            const res = await api.get("/v1/Hub/Users/List?only_active=true");
            const data = await res.json();
            setUsers(data.list || []);
        })();
    }, []);

    const toggleUser = (id: string) => {
        const newSelected = selected.includes(id)
            ? selected.filter((u) => u !== id)
            : [...selected, id];
        setSelected(newSelected);
        onChange(newSelected);
    };

    const selectAll = () => {
        const all = users.map((u) => u.id);
        setSelected(all);
        onChange(all);
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.input}>
                {users.map((u) => (
                    <label key={u.id} style={{ display: "block", marginBottom: "0.25rem", cursor: "pointer" }}>
                        <input
                            style={{display: "none"}}
                            type="checkbox"
                            checked={selected.includes(u.id)}
                            onChange={() => toggleUser(u.id)}
                        />{" "}
                        <UserValue
                            isActive={selected.includes(u.id)}
                            user={{
                                id: u.id,
                                email: u.email,
                                first_name: u.first_name,
                                last_name: u.last_name || "",
                                role_name: u.role?.name,
                                avatar_url: u.avatar_url
                            }}
                            showAvatar={true}
                        />
                    </label>
                ))}
            </div>
            <button type="button" onClick={selectAll} style={{ marginBottom: "0.5rem" }}>
                Вибрати всіх
            </button>
        </div>
    );
};

export default UserSelect;



