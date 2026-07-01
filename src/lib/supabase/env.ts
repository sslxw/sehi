/**
 * Next.js only inlines `process.env.NEXT_PUBLIC_*` when accessed statically
 * (e.g. process.env.NEXT_PUBLIC_FOO). Dynamic access like process.env[key] is
 * undefined in the browser bundle — which broke client-side Supabase detection.
 */

function firstNonEmpty(...values: (string | undefined)[]): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

function getSupabaseUrlOptional(): string | undefined {
  return firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL
  );
}

function getSupabasePublishableKeyOptional(): string | undefined {
  return firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrlOptional() && getSupabasePublishableKeyOptional());
}

export function getSupabaseUrl(): string {
  const url = getSupabaseUrlOptional();
  if (!url) {
    throw new Error(
      "Supabase URL missing — set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL"
    );
  }
  return url;
}

/** Client publishable key (sb_publishable_...) — safe for browser + SSR */
export function getSupabasePublishableKey(): string {
  const key = getSupabasePublishableKeyOptional();
  if (!key) {
    throw new Error(
      "Supabase publishable key missing — set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or SUPABASE_PUBLISHABLE_KEY"
    );
  }
  return key;
}

/** Server-only secret key — never expose to the browser */
export function getSupabaseSecretKey(): string | undefined {
  return firstNonEmpty(
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET
  );
}

export function getSupabaseJwksUrl(): string | undefined {
  return process.env.SUPABASE_JWKS_URL?.trim() || undefined;
}
