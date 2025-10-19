import { useEffect, useState } from "react";
import { api } from "../../../utils/api";
import { useNavigate } from "react-router-dom";
import styles from "./Events.module.css";
import Table from "../../basic/Table/Table.tsx";
import type {EventType} from "../../../types/Events.ts";
import {safeDate} from "../../../utils/safeDate.ts";

const UsersListPage = () => {
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/v1/Hub/Events/List").then(async (res) => {
            const data = await res.json();
            setEvents(data.list);
            setLoading(false);
        });
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Події</h1>
                <button
                    className={styles.button}
                    onClick={() => navigate("/events/create-event")}
                >
                    Додати подію
                </button>
            </div>

            {loading ? (
                <p>⏳ Завантаження...</p>
            ) : events.length === 0 ? (
                <p>Поки немає жодної події.</p>
            ) : (
                <Table
                    columns={[
                        { key: "date", label: "Дата", render: (v) => safeDate(v.date) },
                        { key: "name", label: "Назва події", render: (v) => v.name || "—" },
                        { key: "time_from", label: "Початок", render: (v) => v.time_from?.slice(0, 5) || "—" },
                        { key: "time_to", label: "Завершення", render: (v) => v.time_to?.slice(0, 5) || "—" },
                    ]}
                    data={events}
                    onRowClick={(row) => navigate(`/events/e/${row.id}`)}
                />
            )}
        </div>
    );
};

export default UsersListPage;