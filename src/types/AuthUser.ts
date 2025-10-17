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
    created_at: string;
    updated_at: string;
}

export interface CheckMeResponse {
    ok: boolean;
    user: MeUser;
    role: MyRole;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    user: MeUser | null;
    role: MyRole | null;
    setRole: (role: MyRole) => void;
    login: (token: string) => void;
    logout: () => void;
}