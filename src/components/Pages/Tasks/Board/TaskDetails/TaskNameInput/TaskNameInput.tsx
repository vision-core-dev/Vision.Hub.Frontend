import React, { useRef, useEffect } from "react";
import styles from "./TaskNameInput.module.css";

interface Props {
    value: string;
    onChange?: (val: string) => void;
}

const TaskNameInput: React.FC<Props> = ({ value, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 🔹 Автоматична висота
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto"; // скидаємо висоту
        el.style.height = el.scrollHeight + "px"; // підлаштовуємо
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") e.preventDefault(); // ❌ блокуємо перенос рядка
    };

    return (
        <div className={styles.taskName}>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                spellCheck={false}
            />
        </div>
    );
};

export default TaskNameInput;
