import { useState } from "react";
import { api } from "@/shared/utils/api";
import { useNavigate } from "react-router-dom";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";

const CreateBoardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/v1/Hub/Boards/Create", formData);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Помилка створення");
            }
            navigate("/boards/list");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DefaultPage>
            <Button color="link-color" onClick={() => navigate("/boards/list")} iconLeading={ArrowLeft}>
                Назад до списку
            </Button>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mt-6">
                <h2 className="text-xl font-semibold">Створити дошку</h2>

                <Input
                    label="Назва"
                    type="text"
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    isRequired
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Опис</label>
                    <textarea
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-md focus:ring-2 focus:ring-brand outline-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                    />
                </div>

                {error && <div className="text-red-500">❌ {error}</div>}

                <Button type="submit" isLoading={loading} showTextWhileLoading>
                    Створити
                </Button>
            </form>
        </DefaultPage>
    );
};

export default CreateBoardPage;
