export interface MyRole {
    id: string;
    key: string;
    name: string;
    menu: string[];
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