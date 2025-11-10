import React, { useState, useRef, useEffect } from "react";
import styles from "./DropdownMenu.module.css";

export interface MenuItem {
    label: string;
    icon?: React.ReactNode;
    danger?: boolean;
    onClick?: () => void;
}

interface Props {
    trigger: React.ReactNode;
    items: MenuItem[];
}

const DropdownMenu: React.FC<Props> = ({ trigger, items }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
            <div onClick={() => setOpen((v) => !v)}>
                {trigger}
            </div>

            {open && (
                <div className={styles.dropdownMenu}>
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className={`${styles.dropdownItem} ${item.danger ? styles.danger : ""}`}
                            onClick={() => {
                                item.onClick?.();
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

export default DropdownMenu;
