import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  WHOOP_AUTH_URL,
  WHOOP_SCOPES,
  getWhoopConfig,
  resolveRedirectUri,
} from "@/lib/whoop/config";
import { WHOOP_REDIRECT_COOKIE } from "@/lib/whoop/oauth-callback";

function randomState(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

export async function GET(req: Request) {
  const config = getWhoopConfig();
  if (!config) {
    return NextResponse.json({ error: "WHOOP credentials not configured" }, { status: 503 });
  }

  const redirectUri = resolveRedirectUri(req);
  const state = randomState();
  const cookieStore = await cookies();
  const secure = redirectUri.startsWith("https://");

  cookieStore.set("whoop_oauth_state", state, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  cookieStore.set(WHOOP_REDIRECT_COOKIE, redirectUri, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: WHOOP_SCOPES,
    state,
  });

  return NextResponse.redirect(`${WHOOP_AUTH_URL}?${params.toString()}`);
}
