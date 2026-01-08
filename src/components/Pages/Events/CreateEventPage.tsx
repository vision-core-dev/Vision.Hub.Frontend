import { useNavigate } from "react-router-dom";
import SmartForm from "../../basic/SmartForm/SmartForm.tsx";
import {api} from "@/utils/api.ts";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/ui/base/buttons/button.tsx";

const CreateEventPage = () => {
    const navigate = useNavigate();

    return (
        <DefaultPage title={"Створити подію"}>
            <Button color="link-color" onClick={() => navigate("/events/list")} iconLeading={ArrowLeft}>
                Назад до списку
            </Button>

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
                    { name: "location_url", label: "Посилання на локацію", type: "text" },
                    { name: "invitees", label: "Учасники", type: "user-select" },
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
        </DefaultPage>
    );
};

export default CreateEventPage;