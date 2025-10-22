import { useEffect } from "react";

type Options = {
    axis?: "x" | "y";
    speed?: number;
    onlyLeftButton?: boolean;
};

export const useDragScroll = (
    ref: React.RefObject<HTMLElement | null>, // 👈 важливо: ref може бути null
    { axis = "x", speed = 1.2, onlyLeftButton = true }: Options = {}
) => {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let dragging = false;
        let startX = 0;
        let startY = 0;
        let scrollLeft = 0;
        let scrollTop = 0;

        const onPointerDown = (e: PointerEvent) => {
            if (onlyLeftButton && e.button !== 0) return;
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            scrollLeft = el.scrollLeft;
            scrollTop = el.scrollTop;
            el.classList.add("dragging");
            el.setPointerCapture(e.pointerId);
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!dragging) return;
            e.preventDefault();
            const dx = (e.clientX - startX) * speed;
            const dy = (e.clientY - startY) * speed;
            if (axis === "x") el.scrollLeft = scrollLeft - dx;
            else el.scrollTop = scrollTop - dy;
        };

        const stop = (e: PointerEvent) => {
            if (!dragging) return;
            dragging = false;
            el.classList.remove("dragging");
            el.releasePointerCapture(e.pointerId);
        };

        const onWheel = (e: WheelEvent) => {
            if (axis === "x" && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                el.scrollLeft += e.deltaY;
                e.preventDefault();
            }
        };

        el.addEventListener("pointerdown", onPointerDown, { passive: false });
        el.addEventListener("pointermove", onPointerMove, { passive: false });
        el.addEventListener("pointerup", stop);
        el.addEventListener("pointercancel", stop);
        el.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            el.removeEventListener("pointerdown", onPointerDown);
            el.removeEventListener("pointermove", onPointerMove);
            el.removeEventListener("pointerup", stop);
            el.removeEventListener("pointercancel", stop);
            el.removeEventListener("wheel", onWheel);
        };
    }, [ref, axis, speed, onlyLeftButton]);
};