import { useNavigate } from "react-router-dom";
import SmartForm from "../../basic/SmartForm/SmartForm.tsx";
import {api} from "../../../utils/api.ts";

const CreateEventPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>📅 Створити подію</h1>

            <SmartForm
                title="Нова подія"
                submitText="Створити подію"
                fields={[
                    { name: "name", label: "Назва події", type: "text", required: true },
                    { name: "description", label: "Опис", type: "textarea" },
                    { name: "date", label: "Дата", type: "date", required: true },
                    { name: "time_from", label: "Час початку", type: "time", required: true },
                    { name: "time_to", label: "Час завершення", type: "time", required: true },
                    { name: "location", label: "Локація", type: "text" },
                    { name: "invites", label: "Учасники", type: "user-select" },
                ]}
                onSubmit={async (values) => {
                    const res = await api.post("/v1/Hub/Events/Create", values);
                    if (res.ok) {
                        navigate("/events/list");
                    } else {
                        const err = await res.json();
                        throw new Error(err.detail || "Не вдалося створити подію");
                    }
                }}
                onSuccess={() => {
                    console.log("✅ Подія створена!");
                }}
            />
        </div>
    );
};

export default CreateEventPage;