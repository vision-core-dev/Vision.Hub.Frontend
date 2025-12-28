import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../../utils/api.ts";

import styles from "./SubmitForm.module.css";
import LoaderDots from "../../../basic/LoaderDots/LoaderDots.tsx";
import Button from "../../../basic/Button/Button.tsx";
import FieldRenderer from "./FieldRenderer.tsx";

/* ================= TYPES ================= */

export type FormFieldType =
    | "text"
    | "long_text"
    | "rating"
    | "multiple_choice";

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

    welcome_screens?: {
        title: string;
        properties?: {
            description?: string;
        };
    }[];

    thankyou_screens?: {
        title: string;
        properties?: {
            description?: string;
        };
    }[];
}


interface GetFormResponse {
    id: string;
    title: string;
    is_anonymous: boolean;
    data: FormSchema;
}

/* ================= API ================= */

async function getForm(slug?: string) {
    return api.post("/v1/Hub/Forms/GetForm", { slug });
}

async function submitForm(formId: string | undefined, answers: Record<string, any>) {
    return api.post("/v1/Hub/Forms/Submit", {
        form_id: formId,
        answers,
    });
}

/* ================= COMPONENT ================= */

export default function SubmitForm() {
    const { formSlug } = useParams<{ formSlug: string }>();

    const [formId, setFormId] = useState<string | undefined>(undefined);
    const [form, setForm] = useState<FormSchema | null>(null);
    const [values, setValues] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    const hasWelcome = Boolean(form?.welcome_screens?.length);
    const [step, setStep] = useState<number>(hasWelcome ? -1 : 0);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await getForm(formSlug);
                const json: GetFormResponse = await res.json();
                if (res.ok) {
                    setFormId(json.id);
                    setForm(json.data);
                    setStep(json.data.welcome_screens?.length ? -1 : 0);
                }
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [formSlug]);

    if (loading || !form) return <LoaderDots />;

    const fields = form.fields;
    const field = fields[step];
    const isLast = step === fields.length - 1;

    const totalQuestions = fields.length;

    const isWelcome = step === -1;
    const isQuestion = step >= 0 && step < totalQuestions;
    const isThankYou = step === totalQuestions;

    function updateValue(id: string, value: any) {
        setValues((prev) => ({ ...prev, [id]: value }));
    }

    function canContinue(): boolean {
        if (!field.required) return true;
        const v = values[field.id];
        return v !== undefined && v !== "" && (!Array.isArray(v) || v.length > 0);
    }

    function goNext() {
        if (isWelcome) {
            setStep(0);
            return;
        }

        if (!canContinue()) return;

        if (step < totalQuestions) {
            setStep(step + 1);
        }
    }

    function goBack() {
        if (step > 0) setStep(step - 1);
    }


    async function handleSubmit() {
        await submitForm(formId, values);
        setStep(totalQuestions); // thank you screen
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                {isWelcome && (
                    <div className={styles.questionAnimated}>
                        <h1 className={styles.title}>
                            {form.welcome_screens?.[0]?.title}
                        </h1>

                        {form.welcome_screens?.[0]?.properties?.description && (
                            <p className={styles.description}>
                                {form.welcome_screens[0].properties.description}
                            </p>
                        )}

                        <Button onClick={goNext}>
                            Почати
                        </Button>
                    </div>
                )}

                {isQuestion && (
                    <>
                        <div className={styles.progress}>
                            {step + 1} / {totalQuestions}
                        </div>

                        <h1 className={styles.title}>{form.title}</h1>

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
                            {step > 0 && (
                                <Button variant="link" onClick={goBack}>
                                    Назад
                                </Button>
                            )}

                            {isLast ? (
                                <Button onClick={handleSubmit} disabled={!canContinue()}>
                                    Надіслати
                                </Button>
                            ) : (
                                <Button onClick={goNext} disabled={!canContinue()}>
                                    Далі
                                </Button>
                            )}
                        </div>
                    </>
                )}

                {isThankYou && (
                    <div className={styles.questionAnimated}>
                        <h1 className={styles.title}>
                            {form.thankyou_screens?.[0]?.title ?? "Дякуємо!"}
                        </h1>

                        {form.thankyou_screens?.[0]?.properties?.description && (
                            <p className={styles.description}>
                                {form.thankyou_screens[0].properties.description}
                            </p>
                        )}
                    </div>
                )}

            </div>
        </div>
    )

    // return (
    //     <div className={styles.wrapper}>
    //         <div className={styles.card}>
    //             <div className={styles.progress}>
    //                 {step + 1} / {fields.length}
    //             </div>
    //
    //             <h1 className={styles.title}>{form.title}</h1>
    //
    //             <div key={step} className={styles.questionAnimated}>
    //                 <h2 className={styles.questionTitle}>{field.title}</h2>
    //
    //                 <FieldRenderer
    //                     field={field}
    //                     value={values[field.id]}
    //                     onChange={(v) => updateValue(field.id, v)}
    //                     onAutoNext={field.type === "rating" ? goNext : undefined}
    //                 />
    //             </div>
    //
    //             <div className={styles.actions}>
    //                 {step > 0 && (
    //                     <Button variant="link" onClick={goBack}>
    //                         Назад
    //                     </Button>
    //                 )}
    //
    //                 {isLast ? (
    //                     <Button onClick={handleSubmit} disabled={!canContinue()}>
    //                         Надіслати
    //                     </Button>
    //                 ) : (
    //                     <Button onClick={goNext} disabled={!canContinue()}>
    //                         Далі
    //                     </Button>
    //                 )}
    //             </div>
    //         </div>
    //     </div>
    // );
}