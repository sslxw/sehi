"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthSession } from "@/lib/auth/types";
import { authenticateUser, registerUser } from "@/lib/auth/client-store";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { completeOnboarding as saveOnboardingToDb } from "@/lib/supabase/db";
import { migrateLocalToSupabase } from "@/lib/data/sync";
import {
  draftToProfile,
  generatePersonalizedCalendar,
  type OnboardingProfileDraft,
} from "@/lib/user-profile";
import { saveCalendarEventsAsync } from "@/lib/calendar-store";
import { saveMacroTargetsAsync } from "@/lib/food";
import { saveMedicationsAsync } from "@/lib/medications";

interface AuthContextValue {
  user: AuthSession | null;
  loading: boolean;
  signup: (email: string, name: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (draft: OnboardingProfileDraft) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function syncLegacySession(
  userId: string,
  email: string,
  name: string,
  onboardingComplete: boolean
) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, name, onboardingComplete }),
  });
}

function mapSupabaseUser(
  userId: string,
  email: string,
  name: string,
  onboardingComplete: boolean
): AuthSession {
  return { userId, email, name, onboardingComplete };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      refresh();
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        refresh();
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        migrateLocalToSupabase(session.user.id).then(() => refresh());
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  const signup = useCallback(
    async (email: string, name: string, password: string) => {
      if (isSupabaseConfigured()) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password }),
        });
        const data = await res.json();

        if (!res.ok) {
          if (data.error === "EMAIL_EXISTS") throw new Error("EMAIL_EXISTS");
          throw new Error(data.error ?? "SIGNUP_FAILED");
        }

        const supabase = createClient();
        const { data: signIn, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (signInError || !signIn.user) throw new Error("SIGNUP_FAILED");

        await migrateLocalToSupabase(signIn.user.id);
        setUser(
          mapSupabaseUser(signIn.user.id, signIn.user.email ?? email, name.trim(), false)
        );
        router.replace("/onboarding");
        router.refresh();
        return;
      }

      const authUser = await registerUser(email, name, password);
      await syncLegacySession(authUser.id, authUser.email, authUser.name, false);
      setUser(mapSupabaseUser(authUser.id, authUser.email, authUser.name, false));
      router.push("/onboarding");
    },
    [router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error || !data.user) throw new Error("INVALID_CREDENTIALS");

        await migrateLocalToSupabase(data.user.id);

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, onboarding_complete")
          .eq("id", data.user.id)
          .maybeSingle();

        const onboardingComplete = profile?.onboarding_complete ?? false;
        const displayName =
          profile?.display_name ?? data.user.user_metadata?.display_name ?? nameFromEmail(email);

        setUser(
          mapSupabaseUser(data.user.id, data.user.email ?? email, displayName, onboardingComplete)
        );
        const dest = safeRedirectPath(readRedirectFrom(), onboardingComplete);
        router.replace(dest);
        router.refresh();
        return;
      }

      const authUser = await authenticateUser(email, password);
      if (!authUser) throw new Error("INVALID_CREDENTIALS");

      const onboardingComplete = false;

      await syncLegacySession(authUser.id, authUser.email, authUser.name, onboardingComplete);
      setUser(mapSupabaseUser(authUser.id, authUser.email, authUser.name, onboardingComplete));
      router.push(safeRedirectPath(readRedirectFrom(), onboardingComplete));
    },
    [router]
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    } else {
      await fetch("/api/auth/me", { method: "DELETE" });
    }
    setUser(null);
    router.push("/login");
  }, [router]);

  const completeOnboarding = useCallback(
    async (draft: OnboardingProfileDraft) => {
      if (!user) return;

      const profile = draftToProfile(user.userId, draft);
      const calendar = generatePersonalizedCalendar(draft);

      if (isSupabaseConfigured()) {
        await saveOnboardingToDb(
          user.userId,
          profile,
          profile.macroTargets,
          profile.medications,
          calendar
        );
      } else {
        await fetch("/api/auth/onboarding-complete", { method: "POST" });
      }

      await Promise.all([
        saveMacroTargetsAsync(profile.macroTargets, user.userId),
        saveMedicationsAsync(profile.medications, user.userId),
        saveCalendarEventsAsync(calendar, user.userId),
      ]);

      setUser({ ...user, onboardingComplete: true, name: profile.displayName });
      router.push("/");
    },
    [router, user]
  );

  const value = useMemo(
    () => ({ user, loading, signup, login, logout, completeOnboarding, refresh }),
    [user, loading, signup, login, logout, completeOnboarding, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function nameFromEmail(email: string): string {
  return email.split("@")[0] ?? "User";
}

function safeRedirectPath(from: string | null, onboardingComplete: boolean): string {
  if (onboardingComplete) {
    return from?.startsWith("/") && !from.startsWith("//") && from !== "/onboarding"
      ? from
      : "/";
  }
  return "/onboarding";
}

function readRedirectFrom(): string | null {
  if (typeof window === "undefined") return null;
  const from = new URLSearchParams(window.location.search).get("from");
  if (from?.startsWith("/") && !from.startsWith("//")) return from;
  return null;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
