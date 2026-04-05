export const AUTH_GREETINGS = [
    "🎄 З Новим роком! Нехай код компілюється з першого разу ✨",
    "❄️ Новий рік — нові ідеї, нові вершини 🚀",
    "🎁 Нехай цей рік принесе тобі круті проєкти й менше багів 🧠",
    "🔥 Час апгрейду — себе, навичок і мрій",
    "⚡ Хай продуктивність буде стабільною, як 60 FPS",
    "🧩 Крок за кроком до великих результатів",
    "🌟 Світ чекає на твої ідеї — не зупиняйся",
    "🎉 Нехай цей рік буде релізом твоєї найкращої версії",
    "🧠 Менше хаосу — більше фокусу",
    "❄️ Тепла в серці й холодного розуму в розробці",
] as const;

export const PUBLIC_ROUTES = ["/login", "/auth/callback", "/deactivated", "/offer-agreement"] as const;

export const ALWAYS_ALLOWED_ROUTES = ["dashboard", "my", ""] as const;

export const getRandomGreeting = (): string => {
    return AUTH_GREETINGS[Math.floor(Math.random() * AUTH_GREETINGS.length)];
};
