// Auth module exports
export { AuthProvider, useAuth } from "./auth/AuthContext";
export { default as ProtectedRoute } from "./auth/ProtectedRoute";
export { authApi, tokenStorage, greetingStorage } from "./auth/api";
export { AUTH_GREETINGS, PUBLIC_ROUTES, ALWAYS_ALLOWED_ROUTES, getRandomGreeting } from "./auth/constants";
export type { AuthContextType, AuthState, MeUser, MyRole, CheckMeResponse } from "./auth/types";

// Errors module exports
export { default as ErrorBoundary } from "./errors/ErrorBoundary";
