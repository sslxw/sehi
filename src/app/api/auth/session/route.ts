import { NextResponse } from "next/server";
import { saveSession } from "@/lib/auth/session-store";

export async function POST(req: Request) {
  try {
    const { userId, email, name, onboardingComplete } = (await req.json()) as {
      userId?: string;
      email?: string;
      name?: string;
      onboardingComplete?: boolean;
    };

    if (!userId || !email || !name) {
      return NextResponse.json({ error: "Missing user fields" }, { status: 400 });
    }

    await saveSession({
      userId,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      onboardingComplete: Boolean(onboardingComplete),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
