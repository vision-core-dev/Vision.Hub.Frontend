import React, { useEffect, useState } from "react";
import styles from "./Button.module.css";

interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "link" | "danger";
    adaptive?: boolean;
    title?: string;
}

const Button: React.FC<ButtonProps> = ({
    onClick = () => {},
    children,
    disabled = false,
    variant = "primary",
    adaptive = false,
    title
}) => {
    const [isCompact, setIsCompact] = useState(window.innerWidth < 900);

    useEffect(() => {
        if (adaptive) {
            const handleResize = () => setIsCompact(window.innerWidth < 900);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, [adaptive]);

    return (
        <button
            type={"button"}
            title={title}
            onClick={onClick}
            disabled={disabled}
            className={[
                styles.button,
                styles[variant],
                adaptive && isCompact ? styles.adaptive : "",
            ].join(" ")}
        >
            {React.Children.map(children, (child) => {
                if (
                    adaptive &&
                    isCompact &&
                    typeof child === "string" // якщо текст — ховаємо
                ) {
                    return null;
                }
                return child;
            })}
        </button>
    );
};

export default Button;
