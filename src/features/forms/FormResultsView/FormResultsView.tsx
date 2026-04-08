import { useEffect, useState } from "react";
import styles from "./FormResultsView.module.css";
import type { FormField } from "../SubmitForm/SubmitForm";
import {api} from "@/shared/utils/api.ts";
import LoaderDots from "@/shared/ui/loader-dots/LoaderDots.tsx";
import {useParams} from "react-router-dom";

interface FormResultItem {
    id: string;
    submitted_at: string;
    data: Record<string, any>;
}

interface ResponseData {
    form: {
        id: string;
        title: string;
        fields: FormField[];
    };
    results: FormResultItem[];
}

function FieldResultBlock({
                              field,
                              results,
                          }: {
    field: FormField;
    results: { data: Record<string, any> }[];
}) {
    const answers = results
        .map((r) => r.data[field.id])
        .filter(Boolean);

    return (
        <div className={styles.block}>
            <h2 className={styles.question}>{field.title}</h2>

            {field.type === "rating" && (
                <RatingStats values={answers as number[]} />
            )}

            {field.type === "multiple_choice" && (
                <MultipleChoiceStats
                    choices={field.properties?.choices ?? []}
                    answers={answers as string[][]}
                />
            )}

            {(field.type === "text" || field.type === "long_text") && (
                <TextAnswers answers={answers as string[]} />
            )}
        </div>
    );
}

function RatingStats({ values }: { values: number[] }) {
    const avg = values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1);
    const dist: Record<number, number> = {};
    values.forEach(v => { dist[v] = (dist[v] || 0) + 1; });
    const maxCount = Math.max(...Object.values(dist), 1);

    return (
        <div className={styles.ratingStat}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-text-brand-secondary)" }}>{avg.toFixed(1)}</span>
                <span style={{ fontSize: "0.9rem", color: "var(--color-text-quaternary)" }}>/ 10</span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-text-quaternary)", marginLeft: "auto" }}>{values.length} відп.</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {Array.from({ length: 10 }, (_, i) => 10 - i).map(n => {
                    const count = dist[n] || 0;
                    const pct = (count / maxCount) * 100;
                    return (
                        <div key={n} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ width: "1.5rem", textAlign: "right", fontSize: "0.8rem", fontWeight: 500, color: "var(--color-text-tertiary)" }}>{n}</span>
                            <div style={{ flex: 1, height: "8px", borderRadius: "4px", background: "var(--color-bg-quaternary)" }}>
                                {count > 0 && <div style={{ height: "100%", width: `${pct}%`, borderRadius: "4px", background: "var(--color-bg-brand-solid)", transition: "width 0.3s" }} />}
                            </div>
                            <span style={{ width: "1.5rem", fontSize: "0.75rem", color: count > 0 ? "var(--color-text-primary)" : "var(--color-text-quaternary)", fontWeight: count > 0 ? 600 : 400 }}>{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function MultipleChoiceStats({
                                 choices,
                                 answers,
                             }: {
    choices: { label: string }[];
    answers: string[][];
}) {
    const counter: Record<string, number> = {};

    answers.flat().forEach((a) => {
        counter[a] = (counter[a] || 0) + 1;
    });

    return (
        <div className={styles.choicesStats}>
            {choices.map((c) => {
                const count = counter[c.label] || 0;
                const percent =
                    answers.length > 0
                        ? Math.round((count / answers.length) * 100)
                        : 0;

                return (
                    <div key={c.label} className={styles.choiceRow}>
                        <span>{c.label}</span>
                        <span>
                            {count} ({percent}%)
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function TextAnswers({ answers }: { answers: string[] }) {
    return (
        <div className={styles.textAnswers}>
            {answers.map((a, i) => (
                <div key={i} className={styles.textAnswer}>
                    {a}
                </div>
            ))}
        </div>
    );
}



export default function FormResultsView() {
    const { formId } = useParams<{ formId: string }>();

    const [data, setData] = useState<ResponseData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await api.post("/v1/Hub/Forms/GetResults", { form_id: formId });
                const json = await res.json();
                if (res.ok) setData(json);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [formId]);

    if (loading || !data) return <LoaderDots />;

    const { form, results } = data;

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>{form.title}</h1>

            {form.fields.map((field) => (
                <FieldResultBlock
                    key={field.id}
                    field={field}
                    results={results}
                />
            ))}
        </div>
    );
}









