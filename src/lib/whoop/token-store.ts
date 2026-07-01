import { cookies } from "next/headers";
import type { WhoopTokens } from "./types";
import {
  getAuthUserIdServer,
  loadUserDataServer,
  saveUserDataServer,
} from "@/lib/supabase/db-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const COOKIE_NAME = "sehi_whoop_tokens";

function encodeTokens(tokens: WhoopTokens): string {
  return Buffer.from(JSON.stringify(tokens)).toString("base64url");
}

function decodeTokens(raw: string): WhoopTokens | null {
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as WhoopTokens;
  } catch {
    return null;
  }
}

export async function loadWhoopTokens(): Promise<WhoopTokens | null> {
  if (isSupabaseConfigured()) {
    const userId = await getAuthUserIdServer();
    if (userId) {
      const dbTokens = await loadUserDataServer<WhoopTokens>(userId, "whoop_tokens");
      if (dbTokens?.refresh_token) return dbTokens;
    }
  }

  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decodeTokens(raw);
}

export async function saveWhoopTokens(tokens: WhoopTokens): Promise<void> {
  if (isSupabaseConfigured()) {
    const userId = await getAuthUserIdServer();
    if (userId) {
      await saveUserDataServer(userId, "whoop_tokens", tokens);
    }
  }

  const store = await cookies();
  store.set(COOKIE_NAME, encodeTokens(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function clearWhoopTokens(): Promise<void> {
  if (isSupabaseConfigured()) {
    const userId = await getAuthUserIdServer();
    if (userId) {
      await saveUserDataServer(userId, "whoop_tokens", {} as WhoopTokens);
    }
  }

  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export function isWhoopConnected(tokens: WhoopTokens | null): tokens is WhoopTokens {
  return Boolean(tokens?.refresh_token);
}
