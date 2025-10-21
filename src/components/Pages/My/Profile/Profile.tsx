import React, { useState } from "react";
import styles from "./Profile.module.css";
import { Save, Upload, Link2, X } from "lucide-react";
import KnowledgeCard from "../../../basic/KnowledgeLink/KnowledgeCard.tsx";

const ProfilePage: React.FC = () => {
    const initialData = {
        firstName: "Кирило",
        lastName: "Власенко",
        birthday: "2004-10-15",
        avatar: "https://i.pravatar.cc/150?img=32",
        currency: "UAH",
        email: "kyrylo@example.com",
        currentPassword: "",
        newPassword: "",
    };

    const [formData, setFormData] = useState(initialData);
    const [originalData, setOriginalData] = useState(initialData);

    // ✅ перевіряємо чи були зміни у секції
    const isChanged = (keys: (keyof typeof formData)[]) => {
        return keys.some((k) => formData[k] !== originalData[k]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, avatar: url }));
        }
    };

    const handleSaveSection = (keys: (keyof typeof formData)[]) => {
        const updated = { ...originalData };
        keys.forEach((k) => (updated[k] = formData[k]));
        setOriginalData(updated);
        alert("✅ Зміни збережено!");
    };

    const handleCancelSection = (keys: (keyof typeof formData)[]) => {
        const reverted = { ...formData };
        keys.forEach((k) => (reverted[k] = originalData[k]));
        setFormData(reverted);
    };

    return (
        <div className={styles.profilePage}>
            <h1 className={styles.title}>Налаштування профілю</h1>

            {/* 👤 Особиста інформація */}
            <div className={styles.section}>
                <h2>👤 Особиста інформація</h2>
                <div className={styles.row}>
                    <div className={styles.avatarWrapper}>
                        <img src={formData.avatar} alt="Avatar" className={styles.avatar} />
                        <label className={styles.uploadBtn}>
                            <Upload size={16} /> Змінити аватар
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
                        </label>
                    </div>

                    <div className={styles.inputs}>
                        <label>
                            Ім’я:
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
                        </label>
                        <label>
                            Прізвище:
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
                        </label>
                        <label>
                            День народження:
                            <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} />
                        </label>
                    </div>
                </div>

                {isChanged(["firstName", "lastName", "birthday", "avatar"]) && (
                    <div className={styles.sectionActions}>
                        <button
                            className={styles.saveBtn}
                            onClick={() => handleSaveSection(["firstName", "lastName", "birthday", "avatar"])}
                        >
                            <Save size={16} /> Зберегти
                        </button>
                        <button
                            className={styles.cancelBtn}
                            onClick={() => handleCancelSection(["firstName", "lastName", "birthday", "avatar"])}
                        >
                            <X size={16} /> Скасувати
                        </button>
                    </div>
                )}
            </div>

            {/* 💱 Валюта */}
            <div className={styles.section}>
                <h2>💱 Валюта</h2>

                <KnowledgeCard
                    type="warning"
                    icon="AlertCircle"
                    html="Ми ведемо всі розрахунки у гривнях. Якщо ви оберете іншу валюту — суми будуть показані <strong>за поточним курсом</strong>."
                    link="/knowledge/finance/rate"
                />


                <select name="currency" value={formData.currency} onChange={handleChange} className={styles.select}>
                    <option value="UAH">🇺🇦 Гривня (₴)</option>
                    <option value="USD">🇺🇸 Долар ($)</option>
                </select>

                {isChanged(["currency"]) && (
                    <div className={styles.sectionActions}>
                        <button className={styles.saveBtn} onClick={() => handleSaveSection(["currency"])}>
                            <Save size={16} /> Зберегти
                        </button>
                        <button className={styles.cancelBtn} onClick={() => handleCancelSection(["currency"])}>
                            <X size={16} /> Скасувати
                        </button>
                    </div>
                )}
            </div>

            {/* 📧 Email */}
            <div className={styles.section}>
                <h2>📧 Зміна email</h2>
                <label>
                    Поточний email:
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </label>

                {isChanged(["email"]) && (
                    <div className={styles.sectionActions}>
                        <button className={styles.saveBtn} onClick={() => handleSaveSection(["email"])}>
                            <Save size={16} /> Зберегти
                        </button>
                        <button className={styles.cancelBtn} onClick={() => handleCancelSection(["email"])}>
                            <X size={16} /> Скасувати
                        </button>
                    </div>
                )}
            </div>

            {/* 🔐 Пароль */}
            <div className={styles.section}>
                <h2>🔐 Зміна пароля</h2>
                <label>
                    Поточний пароль:
                    <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} />
                </label>
                <label>
                    Новий пароль:
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} />
                </label>

                {isChanged(["currentPassword", "newPassword"]) && (
                    <div className={styles.sectionActions}>
                        <button className={styles.saveBtn} onClick={() => handleSaveSection(["currentPassword", "newPassword"])}>
                            <Save size={16} /> Зберегти
                        </button>
                        <button className={styles.cancelBtn} onClick={() => handleCancelSection(["currentPassword", "newPassword"])}>
                            <X size={16} /> Скасувати
                        </button>
                    </div>
                )}
            </div>

            {/* 🤖 Підключені акаунти */}
            <div className={styles.section}>
                <h2>🔗 Підключені акаунти</h2>
                <div className={styles.integrations}>
                    <div className={styles.integrationCard}>
                        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111644.png" alt="Telegram" />
                        <p>Telegram</p>
                        <button className={styles.linkBtn}><Link2 size={16} /> Прив’язати</button>
                    </div>
                    <div className={styles.integrationCard}>
                        <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" alt="Discord" />
                        <p>Discord</p>
                        <button className={styles.linkBtn}><Link2 size={16} /> Прив’язати</button>
                    </div>
                    <div className={styles.integrationCard}>
                        <img src="https://cdn-icons-png.flaticon.com/512/15077/15077125.png" alt="Roblox" />
                        <p>Roblox</p>
                        <button className={styles.linkBtn}><Link2 size={16} /> Прив’язати</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
