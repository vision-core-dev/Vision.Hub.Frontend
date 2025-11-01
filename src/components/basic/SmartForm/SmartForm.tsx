import React, { useState } from "react";
import styles from "./SmartForm.module.css";
import { getErrorText } from "../../../types/Messages";
import UserSelect from "../UserSelect/UserSelect.tsx";

type FieldType =
    | "text"
    | "number"
    | "email"
    | "password"
    | "select"
    | "textarea"
    | "date"
    | "time"
    | "user-select";

interface Field {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    options?: string[];
    placeholder?: string;
}

interface SmartFormProps {
    title?: string | null;
    fields: Field[];
    submitText?: string;
    onSubmit: (values: Record<string, any>) => Promise<void> | void;
    onSuccess?: () => void;
}

const SmartForm: React.FC<SmartFormProps> = ({
    title,
    fields,
    submitText = "Зберегти",
    onSubmit,
    onSuccess,
}) => {
    const [values, setValues] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (name: string, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await onSubmit(values);
            setSuccess(true);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            const detail =
                err?.response?.data?.detail ||
                err?.message ||
                "Сталася невідома помилка 😢";
            setError(detail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {title && <h2 className={styles.title}>{title}</h2>}

            {fields.map((field) => (
                <div key={field.name} className={styles.field}>
                    <label htmlFor={field.name}>{field.label} {field.required && (<span>*</span>)}</label>

                    {field.type === "select" ? (
                        <select
                            id={field.name}
                            required={field.required}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        >
                            <option value="">Оберіть...</option>
                            {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    ) : field.type === "textarea" ? (
                        <textarea
                            id={field.name}
                            placeholder={field.placeholder}
                            required={field.required}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        />
                    ) : field.type === "user-select" ? (
                        <UserSelect onChange={(ids) => handleChange(field.name, ids)} />
                    ) : (
                        <input
                            type={field.type}
                            id={field.name}
                            placeholder={field.placeholder}
                            required={field.required}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        />
                    )}
                </div>
            ))}

            {error && <div className={styles.error}>❌ {getErrorText(error)}</div>}
            {success && <div className={styles.success}>✅ Успішно збережено!</div>}

            <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? "⏳ Збереження..." : submitText}
            </button>
        </form>
    );
};

export default SmartForm;
