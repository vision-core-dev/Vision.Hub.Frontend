import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/utils/api";
import DefaultPage from "@/shared/ui/default-page/DefaultPage";
import { Button } from "@/shared/ui/buttons/button";
import { FileText, ExternalLink, BarChart3, Copy, Check, Users, EyeOff } from "lucide-react";
import { Badge } from "@/shared/ui/badges/badges";

interface FormItem {
    id: string;
    title: string;
    slug: string;
    is_anonymous: boolean;
    results_count: number;
    created_at: string | null;
}

export default function FormsListPage() {
    const [forms, setForms] = useState<FormItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/v1/Hub/Forms/List").then(async (res) => {
            if (res.ok) setForms(await res.json());
            setLoading(false);
        });
    }, []);

    return (
        <DefaultPage title="Форми" isLoading={loading}>
            {forms.length === 0 && !loading && (
                <p className="text-fg-tertiary text-sm">Форм ще немає</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {forms.map((form) => (
                    <FormCard key={form.id} form={form} navigate={navigate} />
                ))}
            </div>
        </DefaultPage>
    );
}

function FormCard({ form, navigate }: { form: FormItem; navigate: ReturnType<typeof useNavigate> }) {
    const [copied, setCopied] = useState(false);
    const submitUrl = `${window.location.origin}/form/${form.slug}/submit`;

    const handleCopy = () => {
        navigator.clipboard.writeText(submitUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const date = form.created_at ? new Date(form.created_at).toLocaleDateString("uk-UA", {
        day: "numeric", month: "short", year: "numeric",
    }) : "";

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border-secondary bg-primary p-5 shadow-xs">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <FileText size={18} className="text-fg-brand-primary" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-fg-primary truncate">{form.title}</h3>
                    <p className="text-xs text-fg-quaternary">{date}</p>
                </div>
                <div className="flex gap-1.5">
                    {form.is_anonymous && (
                        <Badge color="warning" type="pill-color" size="sm">
                            <EyeOff size={10} className="mr-1" />
                            Анонімна
                        </Badge>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-fg-secondary">
                    <Users size={14} className="text-fg-quaternary" />
                    <span className="font-semibold">{form.results_count}</span>
                    <span className="text-fg-tertiary">відповідей</span>
                </div>
            </div>

            {/* Link */}
            <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                <code className="flex-1 text-xs text-fg-tertiary truncate">/form/{form.slug}/submit</code>
                <button onClick={handleCopy} className="shrink-0 text-fg-quaternary hover:text-fg-secondary transition-colors cursor-pointer">
                    {copied ? <Check size={14} className="text-fg-success-primary" /> : <Copy size={14} />}
                </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    size="sm"
                    color="primary"
                    className="flex-1"
                    iconLeading={BarChart3}
                    onClick={() => navigate(`/forms/f/${form.id}/results`)}
                >
                    Результати
                </Button>
                <Button
                    size="sm"
                    color="secondary"
                    iconLeading={ExternalLink}
                    href={submitUrl}
                    target="_blank"
                >
                    Відкрити
                </Button>
            </div>
        </div>
    );
}
