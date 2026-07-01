import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/setup",
  "/callback",
  "/api/",
  "/_next/",
  "/favicon",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function legacySession(req: NextRequest): { onboardingComplete: boolean } | null {
  const sessionRaw = req.cookies.get("sehi_session")?.value;
  if (!sessionRaw) return null;
  try {
    return JSON.parse(
      Buffer.from(sessionRaw, "base64url").toString("utf8")
    ) as { onboardingComplete: boolean };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  if (isSupabaseConfigured()) {
    const { response, user, onboardingComplete } = await updateSession(req);

    if (!user) {
      const login = new URL("/login", req.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }

    if (pathname !== "/onboarding" && !onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    if ((pathname === "/login" || pathname === "/signup") && user) {
      const dest = onboardingComplete ? "/" : "/onboarding";
      return NextResponse.redirect(new URL(dest, req.url));
    }

    if (pathname === "/onboarding" && onboardingComplete) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return response;
  }

  // Legacy cookie auth when Supabase is not configured
  const session = legacySession(req);

  if (!session) {
    const login = new URL("/login", req.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname !== "/onboarding" && !session.onboardingComplete) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && session) {
    const dest = session.onboardingComplete ? "/" : "/onboarding";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (pathname === "/onboarding" && session.onboardingComplete) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
