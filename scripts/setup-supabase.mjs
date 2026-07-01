#!/usr/bin/env node
/**
 * Applies supabase/schema.sql to your Supabase Postgres database.
 *
 * Set one of:
 *   DATABASE_URL=postgresql://...
 *   SUPABASE_DB_PASSWORD=your-db-password
 *
 * Get the password: Supabase Dashboard → Database → Settings → Reset database password
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Load .env when not using node --env-file (e.g. older Node versions) */
function loadEnvFile() {
  const envPath = resolve(__dirname, "../.env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();

function getDatabaseUrl() {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();

  if (!password || !url) return null;

  const ref = url.replace(/^https?:\/\//, "").replace(/\.supabase\.co.*/, "");
  const region = process.env.SUPABASE_DB_REGION?.trim() || "aws-1-ap-southeast-1";
  // Session pooler (5432) — required for DDL/migrations; 6543 is transaction-only
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:5432/postgres`;
}

async function main() {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    console.error(`
Missing database credentials.

Option A — add to .env:
  SUPABASE_DB_PASSWORD=your-database-password

Option B — add full connection string:
  DATABASE_URL=postgresql://postgres.[ref]:[password]@[region].pooler.supabase.com:5432/postgres

Get the password from:
  Supabase Dashboard → Database → Settings → Reset database password

Or paste supabase/schema.sql into the Supabase SQL Editor manually.
`);
    process.exit(1);
  }

  const schemaPath = resolve(__dirname, "../supabase/schema.sql");
  const sql = readFileSync(schemaPath, "utf8");

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  console.log("Connecting to Supabase Postgres…");
  await client.connect();
  console.log("Running schema.sql…");

  try {
    await client.query(sql);
    console.log("✓ Schema applied successfully.");

    const { rows } = await client.query(
      "select tablename from pg_tables where schemaname = 'public' and tablename in ('profiles', 'user_data') order by tablename"
    );
    console.log("Tables:", rows.map((r) => r.tablename).join(", ") || "(none)");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
