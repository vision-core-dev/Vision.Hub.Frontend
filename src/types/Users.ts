export interface SmallUserRole {
    id: string;
    key: string;
    name: string;
}

export interface SmallUser {
    id: string;
    email: string;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    role?: SmallUserRole;
    created_at: string
}

export interface UserRoleType {
    id: string;
    key: string;
    name: string;
    menu: string[];
    order: number;
}

export interface UserType {
    id: string;
    email: string;
    balance: number;
    withdrawn_amount: number;
    first_name: string;
    last_name?: string;
    avatar_url?: string;
    birthday?: string;
    role: UserRoleType;
    is_active: boolean;
    last_login?: string;
    created_at: string;
}