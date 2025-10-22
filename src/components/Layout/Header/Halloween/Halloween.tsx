import React, { useState } from "react";
import styles from "./Halloween.module.css";
import { Ghost } from "lucide-react";

const Halloween: React.FC = () => {
    const [spooked, setSpooked] = useState(false);

    const handleClick = () => {
        if (spooked) return; // не спрацьовує, якщо вже спукано
        setSpooked(true);
        const audio = new Audio("https://vcore.b-cdn.net/public/VisionCoreHub/halloween-night-257575.mp3");
        audio.play();
        setTimeout(() => setSpooked(false), 30000);
    };

    return (
        <span
            className={`${styles.halloween} ${spooked ? styles.spooked : ""}`}
            onClick={handleClick}
            title="🎃 Halloween surprise!"
        >
            <Ghost size={20} className={styles.ghost} />
        </span>
    );
};

export default Halloween;
