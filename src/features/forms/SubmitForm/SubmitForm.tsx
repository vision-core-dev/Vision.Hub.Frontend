import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/shared/utils/api";
import styles from "./SubmitForm.module.css";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots";
import FieldRenderer from "./FieldRenderer";
import { Button } from "@/shared/ui/buttons/button";
import { ArrowRight, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

/* ================= TYPES ================= */

export type FormFieldType = "text" | "long_text" | "rating" | "multiple_choice";

export interface FormField {
    id: string;
    title: string;
    type: FormFieldType;
    required?: boolean;
    properties?: {
        steps?: number;
        allow_multiple_selections?: boolean;
        choices?: { label: string }[];
    };
}

export interface FormSchema {
    title: string;
    is_anonymous: boolean;
    fields: FormField[];
    welcome_screens?: { title: string; properties?: { description?: string } }[];
    thankyou_screens?: { title: string; properties?: { description?: string } }[];
}

interface GetFormResponse {
    id: string;
    title: string;
    is_anonymous: boolean;
    data: FormSchema;
}

/* ================= LOCAL STORAGE ================= */

function getSavedProgress(slug: string): { values: Record<string, any>; step: number } | null {
    try {
        const raw = localStorage.getItem(`form_progress_${slug}`);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function saveProgress(slug: string, values: Record<string, any>, step: number, title: string) {
    localStorage.setItem(`form_progress_${slug}`, JSON.stringify({ values, step, title }));
}

function clearProgress(slug: string) {
    localStorage.removeItem(`form_progress_${slug}`);
}

/** Check if any form has unsaved progress — used by dashboard banner */
export function getUnfinishedForm(): { slug: string; title: string } | null {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("form_progress_")) {
            try {
                const data = JSON.parse(localStorage.getItem(key) || "");
                if (data?.title) {
                    return { slug: key.replace("form_progress_", ""), title: data.title };
                }
            } catch { /* skip */ }
        }
    }
    return null;
}

/* ================= COMPONENT ================= */

export default function SubmitForm() {
    const { formSlug } = useParams<{ formSlug: string }>();

    const [formId, setFormId] = useState<string>();
    const [form, setForm] = useState<FormSchema | null>(null);
    const [values, setValues] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await api.post("/v1/Hub/Forms/GetForm", { slug: formSlug });
                const json: GetFormResponse = await res.json();
                if (res.ok) {
                    setFormId(json.id);
                    setForm(json.data);

                    const saved = getSavedProgress(formSlug!);
                    if (saved) {
                        setValues(saved.values);
                        setStep(saved.step);
                    } else {
                        setStep(json.data.welcome_screens?.length ? -1 : 0);
                    }
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [formSlug]);

    // Save progress on every change
    useEffect(() => {
        if (!form || !formSlug || step < 0 || step >= form.fields.length) return;
        saveProgress(formSlug, values, step, form.title);
    }, [values, step]);

    if (loading || !form) return <div className={styles.wrapper}><LoaderDots /></div>;

    const fields = form.fields;
    const field = fields[step];
    const totalQuestions = fields.length;
    const isWelcome = step === -1;
    const isQuestion = step >= 0 && step < totalQuestions;
    const isThankYou = step === totalQuestions;
    const isLast = step === totalQuestions - 1;
    const progressPct = isQuestion ? ((step + 1) / totalQuestions) * 100 : 0;

    function updateValue(id: string, value: any) {
        setValues((prev) => ({ ...prev, [id]: value }));
    }

    function canContinue(): boolean {
        if (!field?.required) return true;
        const v = values[field.id];
        return v !== undefined && v !== "" && (!Array.isArray(v) || v.length > 0);
    }

    function goNext() {
        if (isWelcome) { setStep(0); return; }
        if (!canContinue()) return;
        if (step < totalQuestions) setStep(step + 1);
    }

    function goBack() {
        if (step > 0) setStep(step - 1);
    }

    async function handleSubmit() {
        if (submitting) return;
        setSubmitting(true);
        await api.post("/v1/Hub/Forms/Submit", { form_id: formId, answers: values });
        clearProgress(formSlug!);
        setStep(totalQuestions);
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                {/* Welcome */}
                {isWelcome && (
                    <div className={styles.questionAnimated}>
                        <h1 className={styles.title}>{form.welcome_screens?.[0]?.title}</h1>
                        {form.welcome_screens?.[0]?.properties?.description && (
                            <p className={styles.description}>{form.welcome_screens[0].properties.description}</p>
                        )}
                        <Button onClick={goNext} iconTrailing={ArrowRight}>Почати</Button>
                    </div>
                )}

                {/* Question */}
                {isQuestion && (
                    <>
                        <div className={styles.progress}>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
                            </div>
                            <span className={styles.progressText}>{step + 1} / {totalQuestions}</span>
                        </div>

                        <div key={step} className={styles.questionAnimated}>
                            <h2 className={styles.questionTitle}>{field.title}</h2>

                            <FieldRenderer
                                field={field}
                                value={values[field.id]}
                                onChange={(v) => updateValue(field.id, v)}
                                onAutoNext={field.type === "rating" ? goNext : undefined}
                            />
                        </div>

                        <div className={styles.actions}>
                            {step > 0 ? (
                                <Button color="link-gray" onClick={goBack} iconLeading={ArrowLeft}>Назад</Button>
                            ) : <div />}

                            {isLast ? (
                                <Button onClick={handleSubmit} isDisabled={!canContinue()} iconTrailing={Send}>
                                    Надіслати
                                </Button>
                            ) : (
                                <Button onClick={goNext} isDisabled={!canContinue()} iconTrailing={ArrowRight}>
                                    Далі
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {/* Thank you */}
                {isThankYou && (
                    <div className={styles.questionAnimated} style={{ alignItems: "center", textAlign: "center", padding: "2rem 0" }}>
                        <CheckCircle2 size={48} className="text-fg-success-primary" />
                        <h1 className={styles.title}>
                            {form.thankyou_screens?.[0]?.title ?? "Дякуємо!"}
                        </h1>
                        {form.thankyou_screens?.[0]?.properties?.description && (
                            <p className={styles.description}>{form.thankyou_screens[0].properties.description}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
