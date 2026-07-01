"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { moreNavItems } from "@/lib/nav";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WhoopConnect } from "@/components/WhoopConnect";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const { t } = useLocale();
  const { user, logout } = useAuth();
  const initial = (user?.name ?? "S").charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    onClose();
  }, [pathname, onClose]);

  const handleLogout = useCallback(() => {
    logout();
    onClose();
  }, [logout, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={t("nav.closeMenu")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.more")}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="lg:hidden fixed inset-x-0 bottom-0 z-[110] max-h-[85dvh] flex flex-col rounded-t-3xl glass border-b-0 safe-bottom pb-24"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
              <h2 className="text-sm font-semibold text-zinc-200">{t("nav.more")}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]"
                aria-label={t("nav.closeMenu")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {moreNavItems.map((item) => {
                  const isActive =
                    item.href === "/enterprise"
                      ? pathname.startsWith("/enterprise")
                      : pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-colors",
                        isActive
                          ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-300"
                          : "bg-white/[0.03] border-white/[0.05] text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-[10px] font-medium text-center leading-tight">
                        {t(item.labelKey)}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <WhoopConnect className="mb-3" />

              <div className="mb-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xs font-medium text-zinc-500 mb-2">{t("lang.label")}</p>
                <LanguageSwitcher className="w-full justify-center" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400/20 to-violet-400/20 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-cyan-300">{initial}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {user?.name ?? t("brand.member")}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"
                  title={t("auth.logout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
