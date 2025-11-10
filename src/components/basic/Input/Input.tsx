import React from "react";
import styles from "./Input.module.css";

interface InputProps {
    name?: string;
    type: string;
    id?: string;
    value?: string;
    placeholder?: string;
    required?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

const Input: React.FC<InputProps> = ({ name, type, id, value, placeholder, required, onChange, onKeyDown, disabled, ...props }) => {
    return (
        <input
            className={styles.input}
            name={name}
            type={type}
            id={id || name || ""}
            value={value}
            placeholder={placeholder}
            required={required}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={disabled}
            {...props}
        />
    );
};

export default Input;
