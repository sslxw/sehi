import { cookies } from "next/headers";
import type { AuthSession } from "./types";

const COOKIE_NAME = "sehi_session";

function encodeSession(session: AuthSession): string {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

function decodeSession(raw: string): AuthSession | null {
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as AuthSession;
  } catch {
    return null;
  }
}

export async function loadSession(): Promise<AuthSession | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

export async function saveSession(session: AuthSession): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
