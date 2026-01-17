import { useState } from "react";
import { api } from "@/shared/utils/api";
import { useNavigate } from "react-router-dom";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";

const CreateUserPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        first_name: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/v1/Hub/Users/Create", formData);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Помилка створення");
            }
            navigate("/users/list");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DefaultPage>
            <Button color="link-color" onClick={() => navigate("/users/list")} iconLeading={ArrowLeft}>
                Назад до списку
            </Button>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mt-6">
                <h2 className="text-xl font-semibold">Створити користувача</h2>

                <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(value) => setFormData({ ...formData, email: value })}
                    isRequired
                />

                <Input
                    label="Ім'я"
                    type="text"
                    value={formData.first_name}
                    onChange={(value) => setFormData({ ...formData, first_name: value })}
                    isRequired
                />

                <Input
                    label="Пароль"
                    type="text"
                    value={formData.password}
                    onChange={(value) => setFormData({ ...formData, password: value })}
                    isRequired
                />

                {error && <div className="text-red-500">❌ {error}</div>}

                <Button type="submit" isLoading={loading} showTextWhileLoading>
                    Створити
                </Button>
            </form>
        </DefaultPage>
    );
};

export default CreateUserPage;
