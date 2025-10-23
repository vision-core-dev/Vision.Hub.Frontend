import React, { useRef, useEffect, useState } from "react";
import styles from "./TaskNameInput.module.css";

interface Props {
    value: string;
    onChange?: (val: string) => void;
}

const TaskNameInput: React.FC<Props> = ({ value, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [internalValue, setInternalValue] = useState(value);

    // 🔄 Синхронізація зовнішнього value з внутрішнім
    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    // 🔹 Автоматична висота textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }, [internalValue]);

    const handleBlur = () => {
        if (onChange && internalValue.trim() !== value.trim()) {
            onChange(internalValue.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") e.preventDefault(); // ❌ блокуємо перенос рядка
    };

    return (
        <div className={styles.taskName}>
            <textarea
                ref={textareaRef}
                value={internalValue}
                onChange={(e) => setInternalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                rows={1}
                spellCheck={false}
            />
        </div>
    );
};

export default TaskNameInput;
