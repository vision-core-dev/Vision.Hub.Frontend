import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsPage() {
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

                <h1 className="text-display-sm font-bold text-fg-primary mb-2">Умови використання</h1>
                <p className="text-fg-quaternary text-sm mb-10">Останнє оновлення: 5 квітня 2026</p>

                <div className="flex flex-col gap-8 text-fg-secondary text-base leading-relaxed">
                    <Section title="1. Загальні положення">
                        <p>
                            Ці Умови використання (далі — «Умови») регулюють відносини між Vision Core
                            («ми», «нас», «наш») та користувачем (далі — «ви», «користувач») при використанні
                            платформи Vision Core Hub (далі — «Сервіс»).
                        </p>
                        <p>
                            Реєструючись або входячи в Сервіс, ви підтверджуєте, що прочитали, зрозуміли
                            та погоджуєтесь з цими Умовами.
                        </p>
                    </Section>

                    <Section title="2. Опис Сервісу">
                        <p>
                            Vision Core Hub — це внутрішня платформа для управління командою, проєктами,
                            задачами, комунікацією та фінансами. Сервіс надається «як є» та може змінюватись
                            без попереднього повідомлення.
                        </p>
                    </Section>

                    <Section title="3. Реєстрація та акаунт">
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Для доступу до Сервісу необхідний акаунт, створений адміністратором або через запрошення</li>
                            <li>Ви зобовʼязуєтесь надавати достовірну інформацію</li>
                            <li>Ви несете відповідальність за безпеку свого акаунту та пароля</li>
                            <li>Один акаунт може бути привʼязаний до зовнішніх сервісів (Google, Discord, Telegram, Roblox)</li>
                        </ul>
                    </Section>

                    <Section title="4. Правила використання">
                        <p>Під час використання Сервісу забороняється:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Передавати дані свого акаунту третім особам</li>
                            <li>Використовувати Сервіс для незаконних дій</li>
                            <li>Намагатися отримати несанкціонований доступ до даних інших користувачів</li>
                            <li>Завантажувати шкідливий контент або файли</li>
                            <li>Порушувати роботу Сервісу (DDoS, спам, експлойти)</li>
                        </ul>
                    </Section>

                    <Section title="5. Інтелектуальна власність">
                        <p>
                            Весь контент, дизайн, код та функціональність Сервісу є власністю Vision Core.
                            Контент, створений користувачами в рамках Сервісу, залишається власністю
                            відповідних авторів, але Vision Core має право використовувати його для
                            забезпечення роботи платформи.
                        </p>
                    </Section>

                    <Section title="6. Фінансові операції">
                        <p>
                            Сервіс може відображати баланс та фінансові транзакції. Усі фінансові операції
                            регулюються окремими угодами між сторонами. Vision Core не є фінансовою установою
                            та не несе відповідальності за спори щодо оплати між користувачами.
                        </p>
                    </Section>

                    <Section title="7. Деактивація акаунту">
                        <p>
                            Адміністратор має право деактивувати ваш акаунт у будь-який момент.
                            Ви можете запросити видалення свого акаунту, звернувшись до підтримки.
                            Після деактивації доступ до Сервісу буде обмежено.
                        </p>
                    </Section>

                    <Section title="8. Обмеження відповідальності">
                        <p>
                            Vision Core надає Сервіс «як є» без гарантій доступності, безперебійності
                            чи відсутності помилок. Ми не несемо відповідальності за:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Втрату даних внаслідок технічних збоїв</li>
                            <li>Тимчасову недоступність Сервісу</li>
                            <li>Дії третіх осіб, що вплинули на роботу Сервісу</li>
                        </ul>
                    </Section>

                    <Section title="9. Зміни до Умов">
                        <p>
                            Ми залишаємо за собою право змінювати ці Умови. Про суттєві зміни
                            ви будете повідомлені через Сервіс. Продовження використання Сервісу після
                            змін означає згоду з оновленими Умовами.
                        </p>
                    </Section>

                    <Section title="10. Контакти">
                        <p>
                            Якщо у вас є питання щодо цих Умов, звʼяжіться з нами через
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
