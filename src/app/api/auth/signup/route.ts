import { NextResponse } from "next/server";
import { adminCreateUser } from "@/lib/supabase/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const { email, password, name } = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email?.trim() || !password || !name?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    const user = await adminCreateUser(email, password, name);

    const supabase = await createClient();
    if (supabase) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        display_name: name.trim(),
        onboarding_complete: false,
      });
      if (profileError) {
        console.warn("profiles upsert failed (run setup:db):", profileError.message);
      }
    }

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    if (message === "EMAIL_EXISTS") {
      return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
    }
    console.error("Signup error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
