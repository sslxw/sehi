"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav";
import { useLocale } from "@/components/providers/LocaleProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WhoopConnect } from "@/components/WhoopConnect";

export function Sidebar() {
  const pathname = usePathname();
  const { t, isRtl } = useLocale();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 shrink-0 bg-[#0a0a0e]/80 backdrop-blur-xl h-screen sticky top-0",
        isRtl ? "border-s border-white/[0.06]" : "border-e border-white/[0.06]"
      )}
    >
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/25 to-violet-500/25 border border-white/10 flex items-center justify-center">
              <span className="text-sm font-bold gradient-text">S</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">{t("brand.name")}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{t("brand.tagline")}</p>
            </div>
          </div>
        </div>
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
            <span className="text-xs font-semibold text-cyan-300">S</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-300 truncate">Sal</p>
            <p className="text-[10px] text-zinc-500">{t("brand.member")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
