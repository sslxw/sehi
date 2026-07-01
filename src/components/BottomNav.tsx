"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { primaryMobileNav, moreNavTrigger, isMoreNavActive } from "@/lib/nav";
import { MobileMenu } from "@/components/MobileMenu";
import { useLocale } from "@/components/providers/LocaleProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const moreActive = isMoreNavActive(pathname);

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom pointer-events-none">
        <div className="mx-3 mb-2 glass rounded-2xl px-2 py-2 pointer-events-auto">
          <div className="grid grid-cols-4 gap-1">
            {primaryMobileNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center gap-1 py-2 rounded-xl transition-colors",
                    isActive ? "text-white" : "text-zinc-500"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-white/10 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium relative z-10">{t(item.labelKey)}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2 rounded-xl transition-colors",
                menuOpen || moreActive ? "text-white" : "text-zinc-500"
              )}
            >
              {(menuOpen || moreActive) && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <moreNavTrigger.icon
                className="w-5 h-5 relative z-10"
                strokeWidth={menuOpen || moreActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium relative z-10">{t(moreNavTrigger.labelKey)}</span>
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
