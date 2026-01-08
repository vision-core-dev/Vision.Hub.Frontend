import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem("theme") as Theme) || "light";
    });

    useEffect(() => {
        const root = document.documentElement;

        if (theme === "dark") {
            root.classList.add("dark-mode");
        } else {
            root.classList.remove("dark-mode");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    return {
        theme,
        isDark: theme === "dark",
        toggle: () =>
            setTheme((t) => (t === "dark" ? "light" : "dark")),
        setDark: () => setTheme("dark"),
        setLight: () => setTheme("light"),
    };
};
