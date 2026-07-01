"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createTranslator,
  defaultLocale,
  getDir,
  type Locale,
  type TranslateParams,
} from "@/lib/i18n";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchProfile, upsertProfile } from "@/lib/supabase/db";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslateParams) => string;
  dir: "rtl" | "ltr";
  isRtl: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.userId) {
      setMounted(true);
      return;
    }

    fetchProfile(user.userId).then((row) => {
      const stored = row?.locale;
      if (stored === "en" || stored === "ar-SA") {
        setLocaleState(stored);
      }
      setMounted(true);
    });
  }, [user?.userId]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      document.documentElement.lang = next === "ar-SA" ? "ar" : "en";
      document.documentElement.dir = getDir(next);
      if (user?.userId && isSupabaseConfigured()) {
        void upsertProfile(user.userId, { locale: next });
      }
    },
    [user?.userId]
  );

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale === "ar-SA" ? "ar" : "en";
    document.documentElement.dir = getDir(locale);
  }, [locale, mounted]);

  const t = useMemo(() => createTranslator(locale), [locale]);
  const dir = getDir(locale);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dir,
      isRtl: dir === "rtl",
    }),
    [locale, setLocale, t, dir]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
