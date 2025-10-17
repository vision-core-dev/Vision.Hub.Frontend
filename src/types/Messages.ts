const messagesList: Record<string, string> = {
    "password_too_short": "Пароль замалий (потрібно мінімум 8 символів)",
    "email_already_exists": "Цей email вже зареєстрований",
    "role_not_found": "Вибрана роль не знайдена",
    "user_not_found": "Користувач не знайдений",
};

export function getErrorText(code: string, fallback = "Сталася невідома помилка"): string {
    return messagesList[code] || fallback;
}
