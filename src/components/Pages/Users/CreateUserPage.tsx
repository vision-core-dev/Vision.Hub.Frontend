import { api } from "@/utils/api.ts";
import SmartForm from "../../basic/SmartForm/SmartForm";
import { useNavigate } from "react-router-dom";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/ui/base/buttons/button.tsx";

const CreateUserPage = () => {
    const navigate = useNavigate();

    return (
        <DefaultPage>
            <Button color="link-color" onClick={() => navigate("/users/list")} iconLeading={ArrowLeft}>
                Назад до списку
            </Button>

            <SmartForm
                title="Створити користувача"
                submitText="Створити"
                fields={[
                    { name: "email", label: "Email", type: "email", required: true },
                    { name: "first_name", label: "Ім’я", type: "text", required: true },
                    { name: "password", label: "Пароль", type: "text", required: true },
                ]}
                onSubmit={async (values) => {
                    const res = await api.post("/v1/Hub/Users/Create", values);
                    if (!res.ok) throw new Error((await res.json()).detail);
                }}
                onSuccess={() => navigate("/users/list")} // ✅ автоматичний редірект
            />
        </DefaultPage>
    );
};

export default CreateUserPage;
