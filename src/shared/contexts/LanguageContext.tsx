import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

type Language = "en" | "ua";

type Translations = {
    [key in Language]: {
        [key: string]: string;
    };
};

const translations: Translations = {
    en: {
        "discord": "Discord",
        "telegram": "Telegram",
        "email": "Email",
        "phone": "Phone",

        "hero.hiring": "We are hiring!",
        "hero.title.prefix": "Build the Future of",
        "hero.subtitle": "Join a team of visionaries, builders, and creators. We are looking for passionate individuals to help us redefine how teams work together.",
        "hero.viewOpenings": "View Openings",
        "hero.chatTelegram": "Chat with us on Telegram",

        "perks.remote.title": "100% Remote",
        "perks.remote.desc": "Work from anywhere in the world. We believe in freedom and responsibility.",
        "perks.fastPaced.title": "Fast-Paced",
        "perks.fastPaced.desc": "Minimal bureaucracy, maximum impact. We ship fast and iterate often.",
        "perks.team.title": "Great Team",
        "perks.team.desc": "Work with passionate and talented individuals who love what they do.",
        "perks.pay.title": "Fair Pay",
        "perks.pay.desc": "Competitive salaries pegged to the US Dollar/Euro market rates.",

        "vacancies.title": "Open Positions",
        "vacancies.subtitle": "Browse our current openings and find the role that fits you. Don't see what you're looking for? Reach out to us anyway!",
        "vacancies.active": "Active",
        "vacancies.apply": "Apply Now",

        "jobs.salary": "month",
        "jobs.type.fullTime": "Full-time",
        "jobs.type.partTime": "Part-time",
        "jobs.type.commission": "Commission",
        "jobs.type.contract": "Contract",
        "jobs.location.remote": "Remote",
        "jobs.location.hybrid": "Remote/Hybrid",

        "footer.title": "Have a question?",
        "footer.desc": "Our support team is always ready to help. Contact us directly via our Telegram bot.",
        "footer.contact": "Contact Support",

        "modal.applyFor": "Apply for",
        "modal.fillForm": "Fill out the form below to submit your application.",
        "modal.fullName": "Full Name",
        "modal.email": "Email Address",
        "modal.resume": "Resume/CV",
        "modal.message": "Message (Optional)",
        "modal.messagePlaceholder": "Tell us why you're a great fit...",
        "modal.submit": "Submit Application",
        "modal.success.title": "Application Sent!",
        "modal.success.desc": "Thanks for applying. We'll review your application and get back to you shortly.",
        "modal.success.button": "Got it",
        "modal.upload.hint": "PDF, DOC up to 10MB",
        "modal.upload.drop": "Click to upload or drag and drop",
        "modal.contact": "Contact",
        "modal.contactVariant": "Contact Variant",
        "modal.select": "Select",

        "modal.contact.telegram": "@username",
        "modal.contact.email": "john.doe@mail.com",
        "modal.contact.phone": "+1 234 567 890",
        "modal.contact.discord": "@username"
    },
    ua: {
        "discord": "Discord",
        "telegram": "Telegram",
        "email": "Ел. пошта",
        "phone": "Телефон",

        "hero.hiring": "Ми наймаємо!",
        "hero.title.prefix": "Будуй майбутнє з",
        "hero.subtitle": "Приєднуйся до команди візіонерів та розробників. Ми шукаємо захоплених людей, щоб разом переосмислити командну роботу.",
        "hero.viewOpenings": "Переглянути вакансії",
        "hero.chatTelegram": "Написати в Telegram",

        "perks.remote.title": "100% Віддалено",
        "perks.remote.desc": "Працюйте з будь-якої точки світу. Ми віримо в свободу та відповідальність.",
        "perks.fastPaced.title": "Швидкий темп",
        "perks.fastPaced.desc": "Мінімум бюрократії, максимум впливу. Ми швидко запускаємо та покращуємо продукти.",
        "perks.team.title": "Чудова команда",
        "perks.team.desc": "Працюйте з талановитими людьми, які люблять свою справу.",
        "perks.pay.title": "Гідна оплата",
        "perks.pay.desc": "Конкурентні зарплати з прив'язкою до долара США або Євро.",

        "vacancies.title": "Відкриті позиції",
        "vacancies.subtitle": "Перегляньте наші вакансії та знайдіть роль для себе. Не знайшли потрібного? Все одно напишіть нам!",
        "vacancies.active": "Активно",
        "vacancies.apply": "Подати заявку",

        "jobs.salary": "місяць",
        "jobs.type.fullTime": "Повна зайнятість",
        "jobs.type.partTime": "Часткова зайнятість",
        "jobs.type.commission": "Позаштатна робота",
        "jobs.type.contract": "Контракт",
        "jobs.location.remote": "Віддалено",
        "jobs.location.hybrid": "Гібрид",

        "footer.title": "Маєте питання?",
        "footer.desc": "Наша команда підтримки завжди готова допомогти. Зв'яжіться з нами через Telegram бота.",
        "footer.contact": "Зв'язатися з підтримкою",

        "modal.applyFor": "Подача на",
        "modal.fillForm": "Заповніть форму нижче, щоб подати заявку.",
        "modal.fullName": "ПІБ",
        "modal.email": "Email",
        "modal.resume": "Резюме/CV",
        "modal.message": "Повідомлення (Необов'язково)",
        "modal.messagePlaceholder": "Розкажіть, чому ви нам підходите...",
        "modal.submit": "Надіслати заявку",
        "modal.success.title": "Заявку надіслано!",
        "modal.success.desc": "Дякуємо за відгук. Ми розглянемо вашу заявку та зв'яжемося найближчим часом.",
        "modal.success.button": "Зрозуміло",
        "modal.upload.hint": "PDF, DOC до 10MB",
        "modal.upload.drop": "Натисніть або перетягніть файл",
        "modal.contact": "Контакт",
        "modal.contactVariant": "Варіант зв'язку",
        "modal.select": "Виберіть",

        "modal.contact.telegram": "@username",
        "modal.contact.email": "john.doe@example.com",
        "modal.contact.phone": "+380 1234 567 890",
        "modal.contact.discord": "@username"
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize language from URL, then LocalStorage, then default to 'ua'
    const [language, setLanguageState] = useState<Language>(() => {
        const urlLang = searchParams.get("lang");
        if (urlLang === "en" || urlLang === "ua") {
            return urlLang;
        }

        const storedLang = localStorage.getItem("language");
        if (storedLang === "en" || storedLang === "ua") {
            return storedLang;
        }

        return "ua";
    });

    // Update URL if missing or save to localStorage when language changes
    useEffect(() => {
        localStorage.setItem("language", language);
    }, [language]);

    // Handle URL param changes (e.g. forward/back button)
    useEffect(() => {
        const urlLang = searchParams.get("lang");
        if ((urlLang === "en" || urlLang === "ua") && urlLang !== language) {
            setLanguageState(urlLang);
        }
    }, [searchParams]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        // Also update URL to reflect the manual change, so sharing the link works as expected
        setSearchParams(prev => {
            prev.set("lang", lang);
            return prev;
        }, { replace: true });
    };

    const t = (key: string) => {
        return translations[language]?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
