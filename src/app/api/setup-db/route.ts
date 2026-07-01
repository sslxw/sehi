import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";
import { getSupabaseSecretKey } from "@/lib/supabase/env";

function getDatabaseUrl(): string | null {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();

  if (!password || !url) return null;

  const ref = url.replace(/^https?:\/\//, "").replace(/\.supabase\.co.*/, "");
  const region = process.env.SUPABASE_DB_REGION?.trim() || "aws-1-ap-southeast-1";
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:5432/postgres`;
}

export async function GET() {
  const hasSecret = Boolean(getSupabaseSecretKey());
  const hasDbCreds = Boolean(getDatabaseUrl());

  let tables: string[] = [];
  if (hasDbCreds) {
    try {
      const client = new pg.Client({
        connectionString: getDatabaseUrl()!,
        ssl: { rejectUnauthorized: false },
      });
      await client.connect();
      const { rows } = await client.query(
        "select tablename from pg_tables where schemaname = 'public' and tablename in ('profiles', 'user_data')"
      );
      tables = rows.map((r: { tablename: string }) => r.tablename);
      await client.end();
    } catch {
      // ignore — status will show missing tables
    }
  }

  return NextResponse.json({
    configured: hasSecret,
    hasDbCredentials: hasDbCreds,
    tablesReady: tables.includes("profiles") && tables.includes("user_data"),
    tables,
  });
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    const auth = req.headers.get("authorization");
    const secret = getSupabaseSecretKey();
    if (!secret || auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    return NextResponse.json(
      {
        error:
          "Add SUPABASE_DB_PASSWORD or DATABASE_URL to .env (Supabase Dashboard → Settings → Database)",
      },
      { status: 400 }
    );
  }

  const schemaPath = resolve(process.cwd(), "supabase/schema.sql");
  const sql = readFileSync(schemaPath, "utf8");

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(sql);
    const { rows } = await client.query(
      "select tablename from pg_tables where schemaname = 'public' and tablename in ('profiles', 'user_data') order by tablename"
    );
    return NextResponse.json({
      ok: true,
      tables: rows.map((r: { tablename: string }) => r.tablename),
    });
  } catch (err) {
    console.error("setup-db:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Setup failed" },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
