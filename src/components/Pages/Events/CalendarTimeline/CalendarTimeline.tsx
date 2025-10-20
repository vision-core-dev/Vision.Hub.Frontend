import React, { useState, useEffect } from "react";
import styles from "./CalendarTimeline.module.css";
import { addDays, format } from "date-fns";
import { uk } from "date-fns/locale";
import type { EventType } from "../../../../types/Events.ts";
import DefaultPage from "../../../basic/DefaultPage/DefaultPage.tsx";
import Button from "../../../basic/Button/Button.tsx";
import {ChevronLeft, ChevronRight, Undo2} from "lucide-react";

const mockEvents: EventType[] = [

];

const CalendarTimeline: React.FC = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [daysCount, setDaysCount] = useState<number>(window.innerWidth < 700 ? 1 : 3);

    useEffect(() => {
        const handleResize = () => {
            setDaysCount(window.innerWidth < 700 ? 1 : 3);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const goToday = () => setCurrentDate(today);
    const isToday = currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getDate() === today.getDate();


    const days = Array.from({ length: daysCount }, (_, i) => addDays(currentDate, i));

    const goNext = () => setCurrentDate(addDays(currentDate, daysCount));
    const goPrev = () => setCurrentDate(addDays(currentDate, -daysCount));

    return (
        <DefaultPage>
            <div className={styles.timeline}>
                <div className={styles.header}>
                    <h2 className={styles.dates}>
                        {format(days[0], days.length === 1 ? "dd.MM.yyyy" : "dd.MM", { locale: uk })}
                        { days.length > 1  && (
                            <>
                                {" - "}
                                {format(days[days.length - 1], "dd.MM", { locale: uk })}
                            </>
                        )}
                    </h2>

                    <div className={styles.actions}>
                        {!isToday && (
                            <div className={styles.returnWrap}>
                                <Button variant="primary" adaptive={true} onClick={goToday}>
                                    <Undo2 /> Сьогодні
                                </Button>
                            </div>
                        )}


                        <Button variant="secondary" adaptive={true} onClick={goPrev}>
                            <ChevronLeft /> Назад
                        </Button>

                        <Button variant="secondary" adaptive={true} onClick={goNext}>
                            Вперед <ChevronRight />
                        </Button>
                    </div>
                </div>

                <div className={styles.grid}>
                    {days.map((day) => {
                        const eventsForDay = mockEvents.filter(
                            (e) => e.date === format(day, "yyyy-MM-dd")
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

                        // ✅ враховуємо тільки події з часом
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
                            ...timeEvents.map(
                                (e) =>
                                    new Date(e.time_from!).getHours() +
                                    new Date(e.time_from!).getMinutes() / 60
                            )
                        );
                        const maxTime = Math.max(
                            ...timeEvents.map((e) =>
                                e.time_to
                                    ? new Date(e.time_to).getHours() + new Date(e.time_to).getMinutes() / 60
                                    : new Date(e.time_from!).getHours() + new Date(e.time_from!).getMinutes() / 60
                            )
                        );

                        const totalHours = maxTime - minTime;
                        const totalHeight = (totalHours + 1) * 60;

                        return (
                            <div key={day.toISOString()} className={styles.dayColumn}>
                                <div className={styles.dayHeader}>
                                    {format(day, "EEE, d MMM", { locale: uk })}
                                </div>

                                <div className={styles.dayBody} style={{ height: `${totalHeight}px` }}>
                                    {Array.from({ length: Math.ceil(totalHours) + 2 }).map((_, i) => (
                                        <div key={i} className={styles.hourMark}>
                                            {Math.floor(minTime) + i}:00
                                        </div>
                                    ))}

                                    {/* події */}
                                    {eventsForDay.map((e) => {
                                        // дедлайни
                                        if (e.deadline) {
                                            const deadlineTime =
                                                new Date(e.deadline).getHours() +
                                                new Date(e.deadline).getMinutes() / 60;

                                            return (
                                                <div
                                                    key={e.id}
                                                    className={styles.deadlineDot}
                                                    style={{
                                                        top: `${(deadlineTime - minTime) * 60}px`,
                                                    }}
                                                    title={e.name}
                                                ></div>
                                            );
                                        }

                                        // звичайні події
                                        const startDate = new Date(e.time_from!);
                                        const endDate = new Date(e.time_to || e.time_from!);
                                        const startHour = startDate.getHours() + startDate.getMinutes() / 60;
                                        const endHour = endDate.getHours() + endDate.getMinutes() / 60;
                                        const durationHours = endHour - startHour;

                                        return (
                                            <div
                                                key={e.id}
                                                className={styles.event}
                                                style={{
                                                    top: `${(startHour - minTime) * 60}px`,
                                                    height: `${(durationHours * 60) - 16}px`,
                                                }}
                                            >
                                                <strong>{e.name}</strong>
                                                {e.location && (
                                                    <div className={styles.eventLocation}>{e.location}</div>
                                                )}
                                                {/*{e.description && (*/}
                                                {/*    <div className={styles.eventDescription}>{e.description}</div>*/}
                                                {/*)}*/}
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
