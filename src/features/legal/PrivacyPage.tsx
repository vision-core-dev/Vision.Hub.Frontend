import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-primary py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-fg-quaternary hover:text-fg-secondary text-sm mb-8 transition-colors"
                >
                    <ArrowLeft className="size-4" />
                    Назад
                </button>

                <h1 className="text-display-sm font-bold text-fg-primary mb-2">Політика конфіденційності</h1>
                <p className="text-fg-quaternary text-sm mb-10">Останнє оновлення: 5 квітня 2026</p>

                <div className="flex flex-col gap-8 text-fg-secondary text-base leading-relaxed">
                    <Section title="1. Загальні положення">
                        <p>
                            Ця Політика конфіденційності описує, як Vision Core («ми», «нас», «наш») збирає,
                            використовує та захищає вашу персональну інформацію під час використання платформи
                            Vision Core Hub (далі — «Сервіс»).
                        </p>
                        <p>
                            Використовуючи Сервіс, ви погоджуєтесь із умовами цієї Політики.
                        </p>
                    </Section>

                    <Section title="2. Яку інформацію ми збираємо">
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Електронна пошта та пароль (при реєстрації через email)</li>
                            <li>Імʼя, прізвище, аватар, дата народження</li>
                            <li>Ідентифікатори зовнішніх акаунтів (Google, Discord, Telegram, Roblox) — при їх привʼязці</li>
                            <li>IP-адреса, тип браузера, дата та час входу</li>
                            <li>Дані про активність у Сервісі (дії, перегляди, повідомлення)</li>
                        </ul>
                    </Section>

                    <Section title="3. Як ми використовуємо інформацію">
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Для автентифікації та авторизації в Сервісі</li>
                            <li>Для відображення профілю та персоналізації досвіду</li>
                            <li>Для забезпечення безпеки акаунту</li>
                            <li>Для комунікації (сповіщення, підтримка)</li>
                            <li>Для внутрішньої аналітики та покращення Сервісу</li>
                        </ul>
                    </Section>

                    <Section title="4. Зберігання даних">
                        <p>
                            Ваші дані зберігаються на захищених серверах. Ми застосовуємо шифрування паролів (bcrypt)
                            та безпечну передачу даних (HTTPS). Дані зберігаються протягом усього часу існування
                            вашого акаунту. Після видалення акаунту дані видаляються протягом 30 днів.
                        </p>
                    </Section>

                    <Section title="5. Передача даних третім особам">
                        <p>
                            Ми не продаємо та не передаємо вашу персональну інформацію третім особам,
                            за винятком випадків:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Коли це необхідно для роботи Сервісу (хостинг, CDN, база даних)</li>
                            <li>За вашою явною згодою</li>
                            <li>На вимогу законодавства України</li>
                        </ul>
                    </Section>

                    <Section title="6. OAuth-провайдери">
                        <p>
                            При привʼязці зовнішніх акаунтів (Google, Discord, Telegram, Roblox) ми отримуємо
                            лише базову інформацію: ідентифікатор, імʼя користувача та email (якщо доступний).
                            Ми не отримуємо доступ до ваших повідомлень, контактів чи інших приватних даних
                            у цих сервісах.
                        </p>
                    </Section>

                    <Section title="7. Ваші права">
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Переглядати та редагувати свої персональні дані</li>
                            <li>Відвʼязувати зовнішні акаунти</li>
                            <li>Запитувати видалення акаунту та всіх повʼязаних даних</li>
                            <li>Отримати копію своїх даних</li>
                        </ul>
                    </Section>

                    <Section title="8. Контакти">
                        <p>
                            Якщо у вас є питання щодо цієї Політики, звʼяжіться з нами через
                            Telegram: <a href="https://t.me/VisionCoreDevBot" className="text-fg-brand-primary hover:underline">@VisionCoreDevBot</a>
                        </p>
                    </Section>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-lg font-semibold text-fg-primary mb-3">{title}</h2>
            <div className="flex flex-col gap-2">{children}</div>
        </section>
    );
}
