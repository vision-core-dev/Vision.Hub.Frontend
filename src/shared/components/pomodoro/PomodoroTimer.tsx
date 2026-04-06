import { useState, useEffect, useCallback, useRef } from "react";
import { Timer, Coffee, Play, Pause, RotateCcw } from "lucide-react";
import { cx } from "@/shared/utils/cx";

type Phase = "work" | "break";

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export function usePomodoroEnabled() {
    const [enabled, setEnabled] = useState(() => localStorage.getItem("pomodoro_enabled") === "true");

    const toggle = (value: boolean) => {
        localStorage.setItem("pomodoro_enabled", String(value));
        setEnabled(value);
    };

    return { enabled, toggle };
}

export default function PomodoroTimer() {
    const [isOpen, setIsOpen] = useState(false);
    const [phase, setPhase] = useState<Phase>("work");
    const [secondsLeft, setSecondsLeft] = useState(WORK_SECONDS);
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalSeconds = phase === "work" ? WORK_SECONDS : BREAK_SECONDS;
    const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    const playSound = useCallback(() => {
        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.value = 0.3;
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.stop(ctx.currentTime + 0.8);
            // Second beep
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.value = 1100;
                gain2.gain.value = 0.3;
                osc2.start();
                gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
                osc2.stop(ctx.currentTime + 0.8);
            }, 300);
        } catch { /* audio not available */ }
    }, []);

    const tick = useCallback(() => {
        setSecondsLeft((prev) => {
            if (prev <= 1) {
                playSound();
                if (phase === "work") {
                    setSessions((s) => s + 1);
                    setPhase("break");
                    return BREAK_SECONDS;
                } else {
                    setPhase("work");
                    return WORK_SECONDS;
                }
            }
            return prev - 1;
        });
    }, [phase]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(tick, 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, tick]);

    const reset = () => {
        setIsRunning(false);
        setPhase("work");
        setSecondsLeft(WORK_SECONDS);
    };

    const isWork = phase === "work";
    const ringColor = isWork ? "stroke-brand-solid" : "stroke-warning-solid";

    // Collapsed — just a nav-style row
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={cx(
                    "group relative flex w-full cursor-pointer items-center rounded-md px-3 py-2",
                    "text-md font-semibold text-secondary transition duration-100 ease-linear",
                    "hover:bg-primary_hover select-none",
                )}
            >
                <Timer aria-hidden className="mr-2 size-5 shrink-0 text-fg-quaternary" />
                <span className="flex-1 text-left">Pomodoro</span>
                {isRunning && (
                    <span className={cx(
                        "text-xs font-mono tabular-nums",
                        isWork ? "text-fg-brand-primary" : "text-fg-warning-primary",
                    )}>
                        {display}
                    </span>
                )}
                {isRunning && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-secondary overflow-hidden">
                        <div
                            className={cx("h-full rounded-full transition-all duration-1000 linear", isWork ? "bg-brand-solid" : "bg-warning-solid")}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </button>
        );
    }

    // Expanded
    return (
        <div className="rounded-xl border border-border-secondary bg-primary p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {isWork ? (
                        <Timer size={14} className="text-fg-brand-primary" />
                    ) : (
                        <Coffee aria-hidden className="size-3.5 text-fg-warning-primary" />
                    )}
                    <span className={cx(
                        "text-xs font-semibold uppercase tracking-wider",
                        isWork ? "text-fg-brand-primary" : "text-fg-warning-primary",
                    )}>
                        {isWork ? "Фокус" : "Перерва"}
                    </span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-medium text-fg-quaternary hover:text-fg-secondary transition-colors cursor-pointer"
                >
                    Згорнути
                </button>
            </div>

            {/* Ring + time */}
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" strokeWidth="5"
                            className="stroke-secondary" />
                        <circle cx="50" cy="50" r="44" fill="none" strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 44}`}
                            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                            className={ringColor}
                            style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-semibold font-mono tabular-nums text-fg-primary">{display}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={cx(
                            "flex items-center justify-center w-9 h-9 rounded-lg transition-colors cursor-pointer",
                            isRunning
                                ? "bg-secondary hover:bg-secondary_hover text-fg-secondary"
                                : "bg-brand-solid hover:bg-brand-solid_hover text-white shadow-xs-skeuomorphic",
                        )}
                    >
                        {isRunning ? (
                            <Pause aria-hidden className="size-4.5" />
                        ) : (
                            <Play aria-hidden className="size-4.5" />
                        )}
                    </button>
                    <button
                        onClick={reset}
                        className="flex items-center justify-center w-9 h-9 rounded-lg bg-secondary hover:bg-secondary_hover text-fg-quaternary transition-colors cursor-pointer"
                    >
                        <RotateCcw aria-hidden className="size-4" />
                    </button>
                </div>

                {/* Sessions */}
                {sessions > 0 && (
                    <span className="text-xs text-fg-quaternary">
                        {sessions} {sessions === 1 ? "сесія" : sessions < 5 ? "сесії" : "сесій"}
                    </span>
                )}
            </div>
        </div>
    );
}
