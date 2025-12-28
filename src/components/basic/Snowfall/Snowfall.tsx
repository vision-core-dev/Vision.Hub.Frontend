import { useEffect } from "react";

type Snowflake = {
    el: HTMLDivElement;
    x: number;
    y: number;
    speed: number;
    size: number;
    drift: number;
};

const SNOWFLAKE_COUNT = 80;

export default function Snowfall() {
    useEffect(() => {
        const snowflakes: Snowflake[] = [];
        let rafId: number;

        const createSnowflake = (): Snowflake => {
            const el = document.createElement("div");
            el.innerText = "❄";
            el.style.position = "fixed";
            el.style.top = "0";
            // el.style.color = "white";
            el.style.pointerEvents = "none";
            el.style.userSelect = "none";
            el.style.zIndex = "9999";
            el.style.willChange = "transform";
            el.style.textShadow = `
              0 0 4px rgba(0,0,0,0.35),
              0 0 8px rgba(255,255,255,0.6)
            `;

            const colors = [
                "rgba(230,238,255,0.9)",
                "rgba(255,255,255,0.8)",
                "rgba(220,230,255,0.85)",
            ];
            el.style.color = colors[Math.floor(Math.random() * colors.length)];


            document.body.appendChild(el);

            const size = 10 + Math.random() * 14;
            el.style.fontSize = `${size}px`;

            return {
                el,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                speed: 0.5 + Math.random() * 1.5,
                size,
                drift: Math.random() * 0.6 - 0.3,
            };
        };

        for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
            snowflakes.push(createSnowflake());
        }

        const animate = () => {
            for (const s of snowflakes) {
                s.y += s.speed;
                s.x += s.drift;

                if (s.y > window.innerHeight + 20) {
                    s.y = -20;
                    s.x = Math.random() * window.innerWidth;
                }

                s.el.style.transform = `translate(${s.x}px, ${s.y}px)`;
            }

            rafId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(rafId);
            snowflakes.forEach((s) => s.el.remove());
        };
    }, []);

    return null;
}
