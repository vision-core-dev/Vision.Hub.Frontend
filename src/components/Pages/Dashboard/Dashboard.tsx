import React from "react";
import styles from "./Dashboard.module.css";
import { Award, FileWarning, Wallet, Calendar, CheckCircle2 } from "lucide-react";

const DashboardPage: React.FC = () => {
    return (
        <div className={styles.dashboard}>
            {/* 🏅 Нагороди */}
            <div className={`${styles.card} ${styles.awards}`}>
                <div className={styles.cardHeader}>
                    <Award size={28} />
                    <h3>Мої нагороди</h3>
                </div>
                <div className={styles.badges}>
                    <img src="/badges/gold.svg" alt="Gold Badge" />
                    <img src="/badges/mentor.svg" alt="Mentor Badge" />
                    <img src="/badges/team.svg" alt="Team Badge" />
                </div>
                <p>🎖️ 12 бейджів • 🧠 Рівень 5 • ⭐ 2 350 XP</p>
                <button className={styles.action}>Заробити більше</button>
            </div>

            {/* ⚖️ Ситуації */}
            <div className={`${styles.card} ${styles.cases}`}>
                <div className={styles.cardHeader}>
                    <FileWarning size={28} />
                    <h3>Мої ситуації</h3>
                </div>
                <ul>
                    <li>⚠️ Запізнення на зустріч — <span>12.10.2025</span></li>
                    <li>✅ Успішно вирішено задачу — <span>09.10.2025</span></li>
                    <li>⚠️ Невчасно здана задача — <span>03.10.2025</span></li>
                </ul>
                <button className={styles.actionSecondary}>Переглянути журнал</button>
            </div>

            {/* 💰 Баланс */}
            <div className={`${styles.card} ${styles.balance}`}>
                <div className={styles.cardHeader}>
                    <Wallet size={28} />
                    <h3>Мій баланс</h3>
                </div>
                <p className={styles.amount}>1250 ₴</p>
                <div className={styles.transactions}>
                    <div>+120 ₴ — Виконано задачу</div>
                    <div>+80 ₴ — Участь в івенті</div>
                    <div>+200 ₴ — Досягнення рівня</div>
                </div>
                <div className={styles.actionsRow}>
                    <button className={styles.action}>📤 Вивести кошти</button>
                    <button className={styles.actionSecondary}>📊 Історія</button>
                </div>
            </div>

            {/* ✅ Активні задачі */}
            <div className={`${styles.card} ${styles.tasks}`}>
                <div className={styles.cardHeader}>
                    <CheckCircle2 size={28} />
                    <h3>Активні задачі</h3>
                </div>
                <div className={styles.progressBar}>
                    <div className={styles.progress} style={{ width: "70%" }}></div>
                </div>
                <p>✅ 7 з 10 задач виконано</p>
                <ul>
                    <li>📅 Підготувати звіт — 23.10.2025</li>
                    <li>📩 Відправити оновлення клієнту — 26.10.2025</li>
                </ul>
                <button className={styles.action}>Створити задачу</button>
            </div>

            {/* 📆 Івенти */}
            <div className={`${styles.card} ${styles.events}`}>
                <div className={styles.cardHeader}>
                    <Calendar size={28} />
                    <h3>Останні івенти</h3>
                </div>
                <ul>
                    <li>🚀 Планерка — 22.10.2025 (Discord)</li>
                    <li>📢 Обговорення релізу — 15.10.2025 (Zoom)</li>
                    <li>🎓 Воркшоп — 10.10.2025 (Google Meet)</li>
                </ul>
                <button className={styles.actionSecondary}>Переглянути календар</button>
            </div>
        </div>
    );
};

export default DashboardPage;
