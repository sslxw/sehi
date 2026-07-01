import { NextResponse } from "next/server";
import { loadSession, saveSession } from "@/lib/auth/session-store";

export async function POST() {
  const session = await loadSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await saveSession({ ...session, onboardingComplete: true });
  return NextResponse.json({ ok: true });
}
