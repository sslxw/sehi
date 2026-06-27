"use client";

import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";
import type { BloodTestEntry } from "@/lib/blood-test";
import { statusColors } from "@/lib/blood-test";
import { useLocale } from "@/components/providers/LocaleProvider";

interface BloodTestListProps {
  entries: BloodTestEntry[];
  onDelete: (id: string) => void;
}

export function BloodTestList({ entries, onDelete }: BloodTestListProps) {
  const { t } = useLocale();

  if (entries.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-sm text-zinc-500">{t("health.emptyLog")}</p>
        <p className="text-xs text-zinc-600 mt-1">{t("health.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <BloodTestCard key={entry.id} entry={entry} index={i} onDelete={onDelete} />
      ))}
    </div>
  );
}

function BloodTestCard({
  entry,
  index,
  onDelete,
}: {
  entry: BloodTestEntry;
  index: number;
  onDelete: (id: string) => void;
}) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(index === 0);
  const { analysis } = entry;
  const abnormal = analysis.markers.filter((m) => m.status !== "normal" && m.status !== "unknown");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex gap-3">
          {entry.imageUrl && (
            <img
              src={entry.imageUrl}
              alt={t("health.reportPreview")}
              className="w-12 h-12 rounded-lg object-cover shrink-0 opacity-80"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-zinc-100 truncate">
                  {analysis.labName || t("health.bloodPanel")}
                </p>
                <p className="text-xs text-zinc-500">
                  {analysis.testDate ?? new Date(entry.uploadedAt).toLocaleDateString()}
                  {" · "}
                  {analysis.markers.length} {t("health.markers")}
                  {abnormal.length > 0 && (
                    <span className="text-amber-400">
                      {" · "}
                      {abnormal.length} {t("health.outOfRange")}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500"
                  aria-label={expanded ? "Collapse" : "Expand"}
                >
                  {expanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-600 hover:text-red-400 transition-colors"
                  aria-label={t("common.delete")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{analysis.summary}</p>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/[0.04]">
          <div className="grid grid-cols-2 gap-1.5 mt-3 max-h-64 overflow-y-auto">
            {analysis.markers.map((marker) => (
              <div
                key={`${entry.id}-${marker.name}`}
                className="bg-white/[0.03] rounded-lg px-2.5 py-2"
              >
                <p className="text-[10px] text-zinc-500 truncate">{marker.name}</p>
                <p className="text-sm font-semibold" style={{ color: statusColors[marker.status] }}>
                  {marker.value} <span className="text-[10px] font-normal">{marker.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
