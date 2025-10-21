import { api } from "../../../utils/api";
import SmartForm from "../../basic/SmartForm/SmartForm";
import { useNavigate } from "react-router-dom";
import DefaultPage from "../../basic/DefaultPage/DefaultPage.tsx";
import Button from "../../basic/Button/Button.tsx";
import {ArrowLeft} from "lucide-react";

const CreateBoardPage = () => {
    const navigate = useNavigate();

    return (
        <DefaultPage>
            <Button variant="link" onClick={() => navigate("/boards/list")}>
                <ArrowLeft size={20} /> Назад до списку
            </Button>

            <SmartForm
                title="Створити користувача"
                submitText="Створити"
                fields={[
                    { name: "name", label: "Назва", type: "text", required: true },
                    { name: "description", label: "Опис", type: "textarea", required: false },
                ]}
                onSubmit={async (values) => {
                    const res = await api.post("/v1/Hub/Boards/Create", values);
                    if (!res.ok) throw new Error((await res.json()).detail);
                }}
                onSuccess={() => navigate("/boards/list")} // ✅ автоматичний редірект
            />
        </DefaultPage>
    );
};

export default CreateBoardPage;
