import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens } from "@/lib/whoop/client";
import { getWhoopConfig, resolveAppOrigin, resolveRedirectUri } from "@/lib/whoop/config";

const REDIRECT_COOKIE = "whoop_oauth_redirect";

export async function handleWhoopOAuthCallback(req: Request) {
  const config = getWhoopConfig();
  const appUrl = resolveAppOrigin(req);

  if (!config) {
    return NextResponse.redirect(`${appUrl}/?whoop=error&reason=config`);
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${appUrl}/?whoop=error&reason=${error}`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("whoop_oauth_state")?.value;
  const savedRedirect = cookieStore.get(REDIRECT_COOKIE)?.value;
  cookieStore.delete("whoop_oauth_state");
  cookieStore.delete(REDIRECT_COOKIE);

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${appUrl}/?whoop=error&reason=state`);
  }

  const redirectUri = savedRedirect ?? resolveRedirectUri(req);

  try {
    await exchangeCodeForTokens(code, redirectUri);
    return NextResponse.redirect(`${appUrl}/?whoop=connected`);
  } catch {
    return NextResponse.redirect(`${appUrl}/?whoop=error&reason=token`);
  }
}

export const WHOOP_REDIRECT_COOKIE = REDIRECT_COOKIE;
