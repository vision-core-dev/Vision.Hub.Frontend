import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import UserSelect from "@/shared/ui/user-select/UserSelect";

const CreateEventPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        date: "",
        time_from: "",
        time_to: "",
        location: "",
        location_url: "",
        invitees: [] as string[],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post("/v1/Hub/Events/Create", formData);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Не вдалося створити подію");
            }
            navigate("/events/list");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DefaultPage title="Створити подію">
            <Button color="link-color" onClick={() => navigate("/events/list")} iconLeading={ArrowLeft}>
                Назад до списку
            </Button>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mt-6">
                <h2 className="text-xl font-semibold text-primary">Нова подія</h2>

                <Input
                    label="Назва події"
                    type="text"
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    isRequired
                />

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-secondary">Опис</label>
                    <textarea
                        className="w-full rounded-lg border border-secondary px-3 py-2 text-md focus:ring-2 focus:ring-brand outline-none bg-primary text-primary"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                    />
                </div>

                <Input
                    label="Дата"
                    type="date"
                    value={formData.date}
                    onChange={(value) => setFormData({ ...formData, date: value })}
                    isRequired
                />

                <div className="flex gap-4">
                    <Input
                        label="Час початку"
                        type="time"
                        value={formData.time_from}
                        onChange={(value) => setFormData({ ...formData, time_from: value })}
                        isRequired
                    />
                    <Input
                        label="Час завершення"
                        type="time"
                        value={formData.time_to}
                        onChange={(value) => setFormData({ ...formData, time_to: value })}
                        isRequired
                    />
                </div>

                <Input
                    label="Локація"
                    type="text"
                    value={formData.location}
                    onChange={(value) => setFormData({ ...formData, location: value })}
                />

                <Input
                    label="Посилання на локацію"
                    type="text"
                    value={formData.location_url}
                    onChange={(value) => setFormData({ ...formData, location_url: value })}
                />

                <div>
                    <label className="block text-sm font-medium mb-2 text-secondary">
                        Учасники ({formData.invitees.length})
                    </label>
                    <UserSelect onChange={(ids) => setFormData({ ...formData, invitees: ids })} />
                </div>

                {error && <div className="text-red-500">❌ {error}</div>}

                <Button type="submit" isLoading={loading} showTextWhileLoading>
                    Створити подію
                </Button>
            </form>
        </DefaultPage>
    );
};

export default CreateEventPage;
