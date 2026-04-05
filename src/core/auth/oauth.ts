const REDIRECT_URI = `${window.location.origin}/auth/callback`;

export type OAuthProvider = "google" | "discord" | "telegram" | "roblox";

export const oauthConfig = {
    google: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        scope: "openid email profile",
    },
    discord: {
        clientId: import.meta.env.VITE_DISCORD_CLIENT_ID ?? "",
        authUrl: "https://discord.com/api/oauth2/authorize",
        scope: "identify email",
    },
    roblox: {
        clientId: import.meta.env.VITE_ROBLOX_CLIENT_ID ?? "",
        authUrl: "https://authorize.roblox.com/v1/authorize",
        scope: "openid profile",
    },
};

function buildOAuthUrl(provider: Exclude<OAuthProvider, "telegram">, mode: "login" | "link"): string {
    const config = oauthConfig[provider];
    const state = JSON.stringify({ provider, mode });

    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: config.scope,
        state,
    });

    return `${config.authUrl}?${params.toString()}`;
}

export function startOAuth(provider: Exclude<OAuthProvider, "telegram">, mode: "login" | "link"): void {
    const url = buildOAuthUrl(provider, mode);
    window.location.href = url;
}

export function getRedirectUri(): string {
    return REDIRECT_URI;
}
