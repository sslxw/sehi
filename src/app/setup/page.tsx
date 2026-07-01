"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface SetupStatus {
  configured: boolean;
  hasDbCredentials: boolean;
  tablesReady: boolean;
  tables: string[];
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/setup-db");
      setStatus(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runSetup = async () => {
    setRunning(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/setup-db", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Setup failed");
      setMessage(`Created tables: ${data.tables?.join(", ") ?? "done"}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="min-h-dvh ambient-bg flex items-center justify-center px-5 py-10">
      <div className="glass rounded-2xl p-6 max-w-lg w-full space-y-4">
        <h1 className="text-xl font-semibold text-white">Supabase setup</h1>
        <p className="text-sm text-zinc-400">
          The database tables (<code className="text-cyan-400">profiles</code>,{" "}
          <code className="text-cyan-400">user_data</code>) must exist before auth and data
          sync work.
        </p>

        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        ) : status ? (
          <ul className="space-y-2 text-sm">
            <StatusRow ok={status.configured} label="Supabase secret key configured" />
            <StatusRow ok={status.hasDbCredentials} label="Database password in .env" />
            <StatusRow ok={status.tablesReady} label="Tables ready" />
          </ul>
        ) : null}

        {message && (
          <p className="text-sm text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        )}

        {!status?.hasDbCredentials && (
          <div className="text-xs text-zinc-500 bg-white/[0.03] rounded-xl p-3 space-y-2">
            <p>Add to <code className="text-zinc-300">.env</code>:</p>
            <pre className="text-zinc-300 overflow-x-auto">{`SUPABASE_DB_PASSWORD=your-db-password\n# optional if auto-detect fails:\n# SUPABASE_DB_REGION=aws-1-ap-southeast-1`}</pre>
            <p>
              Password: Supabase Dashboard → Project Settings → Database → Database password
            </p>
            <p className="pt-1">
              Or paste <code className="text-zinc-300">supabase/schema.sql</code> into the SQL
              Editor and run it manually.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={runSetup}
          disabled={running || !status?.hasDbCredentials}
          className="w-full py-3 rounded-xl bg-cyan-500/80 text-white text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {running && <Loader2 className="w-4 h-4 animate-spin" />}
          Run database setup
        </button>

        {status?.tablesReady && (
          <Link href="/signup" className="block text-center text-sm text-cyan-400 hover:text-cyan-300">
            Go to signup →
          </Link>
        )}
      </div>
    </main>
  );
}

function StatusRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-zinc-300">
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
      )}
      {label}
    </li>
  );
}
