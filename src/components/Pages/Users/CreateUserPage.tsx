import { api } from "../../../utils/api";
import SmartForm from "../../basic/SmartForm/SmartForm";
import { useNavigate } from "react-router-dom";

const CreateUserPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <button onClick={() => navigate("/users/list")}>← Назад</button>

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
        </>
    );
};

export default CreateUserPage;
