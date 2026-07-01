"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";

export function LoginForm() {
  const { t } = useLocale();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error && err.message === "INVALID_CREDENTIALS"
        ? t("auth.invalidCredentials")
        : t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 space-y-4 w-full max-w-md"
    >
      <div>
        <h1 className="text-xl font-semibold text-white">{t("auth.loginTitle")}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t("auth.loginSubtitle")}</p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("auth.email")}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/40"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.password")}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-500/40"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/80 to-emerald-500/80 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {t("auth.login")}
      </button>

      <p className="text-center text-sm text-zinc-500">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="text-cyan-400 hover:text-cyan-300">
          {t("auth.signup")}
        </Link>
      </p>
    </motion.form>
  );
}
