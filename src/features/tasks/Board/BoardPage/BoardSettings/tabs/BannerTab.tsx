import { useState } from "react";
import { api } from "@/shared/utils/api";
import { Image, Upload } from "lucide-react";
import {Input} from "@/shared/ui/input/input.tsx";
import {Button} from "@/shared/ui/buttons/button.tsx";

/* ===================== TYPES ===================== */

interface BannerTabProps {
    boardId: string;
    bannerUrl?: string | null;
    onUpdate: () => void;
}

/* ===================== COMPONENT ===================== */

export default function BannerTab({
                                      boardId,
                                      bannerUrl,
                                      onUpdate,
                                  }: BannerTabProps) {
    const [url, setUrl] = useState(bannerUrl || "");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ===================== ACTIONS ===================== */

    const updateBannerByUrl = async () => {
        if (!url.trim()) return;

        try {
            setUploading(true);
            setError(null);

            await api.post(
                `/v1/Hub/Boards/${boardId}/SetBanner`,
                { banner_url: url }
            );

            onUpdate();
        } catch {
            setError("Не вдалося оновити банер");
        } finally {
            setUploading(false);
        }
    };

    const uploadBannerFile = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post(
                `/v1/Hub/Boards/${boardId}/UploadBanner`,
                formData
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.detail || "upload_error");
            }

            setUrl(data.banner_url);
            onUpdate();
        } catch {
            setError("Помилка завантаження файлу");
        } finally {
            setUploading(false);
        }
    };

    /* ===================== RENDER ===================== */

    return (
        <div className="flex flex-col gap-8">
            {/* Preview */}
            <div className="rounded-xl border border-secondary bg-secondary/20 p-4">
                <h3 className="text-lg font-semibold">Банер дошки</h3>
                <p className="text-sm text-secondary mt-1">
                    Банер відображається у шапці дошки та задачах.
                </p>

                <div className="mt-4 aspect-[16/6] overflow-hidden rounded-lg bg-secondary flex items-center justify-center">
                    {url ? (
                        <img
                            src={url}
                            alt="Board banner"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-sm text-secondary">
                            Банер не встановлено
                        </span>
                    )}
                </div>
            </div>

            {/* Update by URL */}
            <div className="rounded-xl border border-secondary bg-secondary/20 p-4">
                <h4 className="font-medium">Встановити через URL</h4>

                <div className="mt-3 flex flex-col md:flex-row gap-3">
                    <Input
                        type="text"
                        value={url}
                        onChange={(value) => setUrl(value)}
                        placeholder="https://example.com/banner.png"
                        className="flex-1"
                    />

                    <Button
                        size="md"
                        onClick={updateBannerByUrl}
                        isLoading={uploading}
                        iconLeading={Image}
                    >
                        Оновити
                    </Button>
                </div>
            </div>

            {/* Upload */}
            <div className="rounded-xl border border-secondary bg-secondary/20 p-4">
                <h4 className="font-medium">Завантажити файл</h4>

                <label className="mt-3 inline-flex items-center gap-2 cursor-pointer text-sm text-primary">
                    <Upload size={18} />
                    Обрати файл
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={uploadBannerFile}
                        disabled={uploading}
                    />
                </label>
            </div>

            {error && (
                <div className="text-sm text-danger">
                    {error}
                </div>
            )}
        </div>
    );
}









