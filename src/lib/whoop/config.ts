export const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
export const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
export const WHOOP_API_BASE = "https://api.prod.whoop.com";
export const WHOOP_CALLBACK_PATH = "/callback";

export const WHOOP_SCOPES = [
  "read:recovery",
  "read:cycles",
  "read:sleep",
  "read:profile",
  "offline",
].join(" ");

/** Public app origin (no trailing slash). */
export function resolveAppOrigin(req?: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (req) {
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto");
    if (forwardedHost) {
      return `${forwardedProto ?? "https"}://${forwardedHost}`;
    }
    return new URL(req.url).origin;
  }

  return "http://localhost:3000";
}

/** Must match a redirect URI registered in the WHOOP Developer Dashboard exactly. */
export function resolveRedirectUri(req?: Request): string {
  const fromEnv = process.env.WHOOP_REDIRECT_URI?.trim();
  if (fromEnv) return fromEnv;
  return `${resolveAppOrigin(req)}${WHOOP_CALLBACK_PATH}`;
}

export function getWhoopConfig(redirectUriOverride?: string) {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  const redirectUri = redirectUriOverride ?? resolveRedirectUri();

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret, redirectUri };
}
