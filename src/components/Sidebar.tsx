"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WhoopConnect } from "@/components/WhoopConnect";
import { SehiLogo } from "@/components/SehiLogo";

export function Sidebar() {
  const pathname = usePathname();
  const { t, isRtl } = useLocale();
  const { user, logout } = useAuth();
  const initial = (user?.name ?? "S").charAt(0).toUpperCase();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 shrink-0 bg-[#0a0a0e]/80 backdrop-blur-xl h-screen sticky top-0",
        isRtl ? "border-s border-white/[0.06]" : "border-e border-white/[0.06]"
      )}
    >
      <div className="p-6 pb-4">
        <Link href="/" className="block">
          <SehiLogo size="md" showWordmark tagline={t("brand.tagline")} />
        </Link>
        <div className="mt-4">
          <LanguageSwitcher className="w-full justify-center" />
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/enterprise"
              ? pathname.startsWith("/enterprise")
              : pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 bg-white/[0.08] rounded-xl border border-white/[0.06]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              <span className="relative z-10">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.06]">
        <WhoopConnect className="mb-3" />
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400/20 to-violet-400/20 border border-white/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-cyan-300">{initial}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-300 truncate">{user?.name ?? t("brand.member")}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.email ?? t("brand.member")}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            title={t("auth.logout")}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
