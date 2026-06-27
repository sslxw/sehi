"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { Employee, WorkCapacity } from "@/lib/enterprise";
import { scheduleTypeColors } from "@/lib/enterprise";
import { translateCapacity } from "@/lib/enterprise-i18n";
import { WorkCapacityBadge, WorkHoursBar } from "./WorkCapacityBadge";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/LocaleProvider";

interface EmployeeRowProps {
  employee: Employee;
  capacity: WorkCapacity;
  index: number;
}

export function EmployeeRow({ employee, capacity, index }: EmployeeRowProps) {
  const { t } = useLocale();
  const localized = useMemo(() => translateCapacity(capacity, t), [capacity, t]);
  const color = scheduleTypeColors[localized.scheduleType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        href={`/enterprise/employees/${employee.id}`}
        className="glass glass-hover rounded-2xl p-4 block transition-all"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
            style={{
              backgroundColor: `${employee.avatarColor}20`,
              color: employee.avatarColor,
            }}
          >
            {employee.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-zinc-100 truncate">{employee.name}</p>
              {employee.status === "at_risk" && (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-zinc-500 truncate">
              {employee.role} · {employee.team}
            </p>
            <WorkHoursBar
              recommended={localized.recommendedHours}
              baseline={localized.baselineHours}
              color={color}
            />
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <WorkCapacityBadge capacity={localized} size="sm" />
            <span className="text-[10px] text-zinc-500">
              {t("metrics.sehiScore")} {localized.sehiScore}
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-600 rtl-flip" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function EmployeeTable({
  items,
  filterTeam,
}: {
  items: { employee: Employee; capacity: WorkCapacity }[];
  filterTeam?: string;
}) {
  const filtered = filterTeam
    ? items.filter((i) => i.employee.team === filterTeam)
    : items;

  return (
    <div className="space-y-2">
      {filtered.map((item, i) => (
        <EmployeeRow
          key={item.employee.id}
          employee={item.employee}
          capacity={item.capacity}
          index={i}
        />
      ))}
    </div>
  );
}

export function TeamFilter({
  teams,
  active,
  onChange,
}: {
  teams: string[];
  active: string | null;
  onChange: (team: string | null) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "text-xs px-3 py-1.5 rounded-full border transition-colors",
          active === null
            ? "bg-white/10 border-white/20 text-white"
            : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
        )}
      >
        {t("common.allTeams")}
      </button>
      {teams.map((team) => (
        <button
          key={team}
          type="button"
          onClick={() => onChange(team)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border transition-colors",
            active === team
              ? "bg-white/10 border-white/20 text-white"
              : "border-white/[0.06] text-zinc-500 hover:text-zinc-300"
          )}
        >
          {team}
        </button>
      ))}
    </div>
  );
}
