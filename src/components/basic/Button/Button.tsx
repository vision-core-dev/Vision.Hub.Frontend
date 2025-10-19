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

    // 🧠 Розбиваємо children на іконку та текст
    const childArray = React.Children.toArray(children);
    const iconChild = childArray.find(
        (child) =>
            React.isValidElement(child) &&
            (typeof child.type === "function" || typeof child.type === "object")
    );
    const textChild = childArray.find(
        (child) => typeof child === "string" || typeof child === "number"
    );

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
            {iconChild}
            {!adaptive || !isCompact ? <span className={styles.text}>{textChild}</span> : null}
        </button>
    );
};

export default Button;
