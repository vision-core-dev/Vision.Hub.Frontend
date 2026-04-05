export interface MyRole {
    id: string;
    key: string;
    name: string;
    menu: string[];
    order: number;
}

export interface MeUser {
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    birthday: string | null;
    temp_token: string | null;
    is_balance_visible: boolean;
    balance: number;
    is_need_accept_terms: boolean;
    is_terms_accepted: boolean;
    terms_accepted_at: string | null;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    notify_discord: boolean;
    notify_telegram: boolean;
    google_id: string | null;
    google_email: string | null;
    discord_id: string | null;
    discord_username: string | null;
    telegram_id: string | null;
    telegram_username: string | null;
    roblox_id: string | null;
    roblox_username: string | null;
}

export interface CheckMeResponse {
    user: MeUser;
    role: MyRole;
    detail?: string;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    user: MeUser | null;
    role: MyRole | null;
    setRole: (role: MyRole) => void;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}







