import React, { useState, useEffect } from "react";
import styles from "./CalendarTimeline.module.css";
import { addDays, format, isSameDay } from "date-fns";
import { uk } from "date-fns/locale";
import type { EventType } from "@/types/Events.ts";
import DefaultPage from "../../../basic/DefaultPage/DefaultPage";
import { ChevronLeft, ChevronRight, Undo2 } from "lucide-react";
import { api } from "@/utils/api.ts";
import {useNavigate} from "react-router-dom";
import {Button} from "@/ui/base/buttons/button.tsx";

const CalendarTimeline: React.FC = () => {
    const navigate = useNavigate();

    const [events, setEvents] = useState<EventType[]>([]);
    const today = new Date();

    const [currentDate, setCurrentDate] = useState(today);
    const [daysCount, setDaysCount] = useState<number>(
        window.innerWidth < 700 ? 1 : 3
    );

    // 📡 Фетч івентів
    const fetchEvents = async () => {
        try {
            const response = await api.get("/v1/Hub/Events/List");
            const data = await response.json();

            // 🧠 Нормалізація дат
            const normalized = data.list.map((e: any) => ({
                ...e,
                date: new Date(e.date), // повна дата
                time_from: e.time_from ? e.time_from.slice(0, 5) : null, // "HH:MM"
                time_to: e.time_to ? e.time_to.slice(0, 5) : null,
            }));
            setEvents(normalized);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setDaysCount(window.innerWidth < 700 ? 1 : 3);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const goToday = () => setCurrentDate(today);
    const isToday =
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getDate() === today.getDate();

    const days = Array.from({ length: daysCount }, (_, i) =>
        addDays(currentDate, i)
    );

    const goNext = () => setCurrentDate(addDays(currentDate, daysCount));
    const goPrev = () => setCurrentDate(addDays(currentDate, -daysCount));

    return (
        <DefaultPage>
            <div className={styles.timeline}>
                <div className={styles.header}>
                    <h2 className={styles.dates}>
                        {format(
                            days[0],
                            days.length === 1 ? "dd.MM.yyyy" : "dd.MM",
                            { locale: uk }
                        )}
                        {days.length > 1 && (
                            <>
                                {" - "}
                                {format(days[days.length - 1], "dd.MM", { locale: uk })}
                            </>
                        )}
                    </h2>

                    <div className={styles.actions}>
                        {!isToday && (
                            <div className={styles.returnWrap}>
                                <Button color="primary" onClick={goToday} iconTrailing={Undo2}>
                                    Сьогодні
                                </Button>
                            </div>
                        )}

                        <Button color="secondary" onClick={goPrev} iconLeading={ChevronLeft}>
                            Назад
                        </Button>

                        <Button color="secondary" onClick={goNext} iconTrailing={ChevronRight}>
                            Вперед
                        </Button>
                    </div>
                </div>

                <div className={styles.grid}>
                    {days.map((day) => {
                        const eventsForDay = events.filter((e) =>
                            isSameDay(new Date(e.date), day)
                        );

                        if (eventsForDay.length === 0) {
                            return (
                                <div key={day.toISOString()} className={styles.dayColumn}>
                                    <div className={styles.dayHeader}>
                                        {format(day, "EEE, d MMM", { locale: uk })}
                                    </div>
                                    <div className={styles.empty}>Подій немає 📭</div>
                                </div>
                            );
                        }

                        const timeEvents = eventsForDay.filter((e) => e.time_from);

                        if (timeEvents.length === 0) {
                            return (
                                <div key={day.toISOString()} className={styles.dayColumn}>
                                    <div className={styles.dayHeader}>
                                        {format(day, "EEE, d MMM", { locale: uk })}
                                    </div>
                                    <div className={styles.empty}>Лише дедлайни 📌</div>
                                </div>
                            );
                        }

                        const minTime = Math.min(
                            ...timeEvents.map((e) => parseInt(e.time_from!.split(":")[0]))
                        );
                        const maxTime = Math.max(
                            ...timeEvents.map((e) =>
                                e.time_to
                                    ? parseInt(e.time_to.split(":")[0])
                                    : parseInt(e.time_from!.split(":")[0])
                            )
                        );

                        const totalHours = maxTime - minTime;
                        const totalHeight = (totalHours + 1) * 60;

                        return (
                            <div key={day.toISOString()} className={styles.dayColumn}>
                                <div className={styles.dayHeader}>
                                    {format(day, "EEE, d MMM", { locale: uk })}
                                </div>

                                <div
                                    className={styles.dayBody}
                                    style={{ height: `${totalHeight}px` }}
                                >
                                    {Array.from({ length: Math.ceil(totalHours) + 2 }).map(
                                        (_, i) => (
                                            <div key={i} className={styles.hourMark}>
                                                {Math.floor(minTime) + i}:00
                                            </div>
                                        )
                                    )}

                                    {/* 🧭 Події */}
                                    {eventsForDay.map((e) => {
                                        const startHour = parseInt(e.time_from!.split(":")[0]);
                                        const endHour = e.time_to
                                            ? parseInt(e.time_to.split(":")[0])
                                            : startHour;
                                        const durationHours = endHour - startHour;

                                        return (
                                            <div
                                                key={e.id}
                                                className={styles.event}
                                                style={{
                                                    top: `${(startHour - minTime) * 60}px`,
                                                    height: `${durationHours * 60 - 16}px`,
                                                }}
                                                onClick={() => navigate(`/calendar/e/${e.id}`)}
                                            >
                                                <strong>{e.name}</strong>
                                                {e.location && (
                                                    <div className={styles.eventLocation}>
                                                        {e.location}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DefaultPage>
    );
};

export default CalendarTimeline;