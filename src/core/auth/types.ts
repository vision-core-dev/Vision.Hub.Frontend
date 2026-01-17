// Auth types - re-export from shared for backward compatibility
// Main definitions are in shared/types/AuthUser.ts

export type {
    MeUser,
    MyRole,
    CheckMeResponse,
    AuthContextType,
} from "@/shared/types/AuthUser";

// Additional auth-specific types
export interface AuthState {
    user: import("@/shared/types/AuthUser").MeUser | null;
    role: import("@/shared/types/AuthUser").MyRole | null;
    isAuthenticated: boolean;
    loading: boolean;
}
