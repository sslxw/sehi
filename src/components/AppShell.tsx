"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";

const AUTH_PATHS = ["/login", "/signup", "/onboarding", "/setup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="h-dvh min-h-dvh flex overflow-hidden ambient-bg ltr:flex-row rtl:flex-row-reverse">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-y-auto overscroll-contain">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
