import React, { useEffect, useState } from "react";
import styles from "./Button.module.css";

interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "link";
    adaptive?: boolean;
}

const Button: React.FC<ButtonProps> = ({
                                           onClick = () => {},
                                           children,
                                           disabled = false,
                                           variant = "primary",
                                           adaptive = false,
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
