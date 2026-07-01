import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { loadSession, clearSession } from "@/lib/auth/session-store";

export async function GET() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ user: null });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, onboarding_complete")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      user: {
        userId: user.id,
        email: user.email ?? "",
        name: profile?.display_name ?? user.user_metadata?.display_name ?? "",
        onboardingComplete: profile?.onboarding_complete ?? false,
      },
    });
  }

  const session = await loadSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: session });
}

export async function DELETE() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    return NextResponse.json({ ok: true });
  }

  await clearSession();
  return NextResponse.json({ ok: true });
}
