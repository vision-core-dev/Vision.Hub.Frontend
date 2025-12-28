import React, { useState, useRef, useEffect } from "react";
import styles from "./Select.module.css";

export interface MenuItem {
    label: string;
    value: string;
    icon?: React.ReactNode;
    danger?: boolean;
}

interface Props {
    value?: string;
    placeholder?: string;
    items: MenuItem[];
    onChange: (value: string) => void;
}

const Select: React.FC<Props> = ({
                                           value,
                                           placeholder = "Оберіть...",
                                           items,
                                           onChange,
                                       }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const selectedItem = items.find((i) => i.value === value);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={styles.menuWrapper} ref={menuRef}>
            <div
                className={styles.trigger}
                onClick={() => setOpen((v) => !v)}
            >
                {selectedItem ? selectedItem.label : placeholder}
            </div>

            {open && (
                <div className={styles.dropdownMenu}>
                    {items.map((item) => (
                        <div
                            key={item.value}
                            className={styles.dropdownItem}
                            onClick={() => {
                                onChange(item.value);
                                setOpen(false);
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Select;