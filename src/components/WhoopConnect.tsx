"use client";

import { Loader2, Link2, Unlink } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useWhoop } from "@/components/providers/WhoopProvider";
import { cn } from "@/lib/utils";

export function WhoopConnect({ className }: { className?: string }) {
  const { t } = useLocale();
  const { connected, configured, loading, profile, usingMock, error, connect, disconnect, refresh } =
    useWhoop();

  if (!configured) {
    return (
      <div className={cn("glass rounded-xl p-3", className)}>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{t("whoop.title")}</p>
        <p className="text-xs text-amber-400/90 mt-1">{t("whoop.notConfigured")}</p>
      </div>
    );
  }

  return (
    <div className={cn("glass rounded-xl p-3", className)}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{t("whoop.title")}</p>
        {loading && <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />}
      </div>

      {connected ? (
        <>
          <p className="text-xs font-medium text-emerald-400">
            {usingMock ? t("whoop.connectedPending") : t("whoop.connectedLive")}
          </p>
          {profile && (
            <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
              {profile.first_name} {profile.last_name}
            </p>
          )}
          {error && (
            <p className="text-[10px] text-amber-400/80 mt-1 leading-relaxed">{error}</p>
          )}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => refresh()}
              className="text-[10px] text-zinc-400 hover:text-zinc-200"
            >
              {t("whoop.sync")}
            </button>
            <button
              type="button"
              onClick={() => disconnect()}
              className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1"
            >
              <Unlink className="w-3 h-3" />
              {t("whoop.disconnect")}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-zinc-500">{t("whoop.demoData")}</p>
          <button
            type="button"
            onClick={connect}
            className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/25 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            {t("whoop.connect")}
          </button>
        </>
      )}
    </div>
  );
}
