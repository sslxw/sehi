"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { mobileNavItems } from "@/lib/nav";
import { useLocale } from "@/components/providers/LocaleProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-2 mb-2 glass rounded-2xl px-1 py-1.5">
        <div className="flex items-center justify-around">
          {mobileNavItems.map((item) => {
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
                  "relative flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-xl transition-colors min-w-0",
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
                <Icon className="w-4 h-4 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-medium relative z-10 truncate max-w-[3rem]">
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
