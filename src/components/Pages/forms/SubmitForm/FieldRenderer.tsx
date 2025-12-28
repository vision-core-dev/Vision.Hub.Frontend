import styles from "./SubmitForm.module.css";
import type { FormField } from "./SubmitForm";
import Input from "../../../basic/Input/Input.tsx";

interface Props {
    field: FormField;
    value: any;
    onChange: (value: any) => void;
    onAutoNext?: () => void;
}

export default function FieldRenderer({
                                          field,
                                          value,
                                          onChange,
                                          onAutoNext,
                                      }: Props) {
    switch (field.type) {
        case "text":
            return (
                <Input
                    type="text"
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            );

        case "long_text":
            return (
                <Input
                    type="textarea"
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            );

        case "rating":
            return (
                <div className={styles.rating}>
                    {Array.from({ length: field.properties?.steps ?? 10 }).map((_, i) => {
                        const val = i + 1;
                        return (
                            <button
                                key={val}
                                className={`${styles.ratingItem} ${
                                    value === val ? styles.active : ""
                                }`}
                                onClick={() => {
                                    onChange(val);
                                    onAutoNext && setTimeout(onAutoNext, 250);
                                }}
                            >
                                {val}
                            </button>
                        );
                    })}
                </div>
            );

        case "multiple_choice":
            return (
                <div className={styles.choicesGrid}>
                    {field.properties?.choices?.map((c) => {
                        const checked = value?.includes(c.label);

                        return (
                            <button
                                key={c.label}
                                type="button"
                                className={`${styles.choiceCard} ${
                                    checked ? styles.choiceActive : ""
                                }`}
                                onClick={() => {
                                    const set = new Set(value ?? []);
                                    checked ? set.delete(c.label) : set.add(c.label);
                                    onChange([...set]);
                                }}
                            >
                        <span className={styles.checkbox}>
                            {checked && "✓"}
                        </span>
                                <span>{c.label}</span>
                            </button>
                        );
                    })}
                </div>
            );

        default:
            return null;
    }
}
