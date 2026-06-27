"use client";

import { Header } from "@/components/Header";
import { EnterpriseNav } from "@/components/enterprise/EnterpriseNav";
import { EnterpriseStats, CapacityOverview } from "@/components/enterprise/EnterpriseStats";
import { EmployeeTable } from "@/components/enterprise/EmployeeTable";
import { getEnterpriseSummary, getAllEmployeeCapacities } from "@/lib/enterprise";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function EnterprisePage() {
  const { t } = useLocale();
  const summary = getEnterpriseSummary();
  const capacities = getAllEmployeeCapacities();
  const atRisk = capacities.filter(
    (c) =>
      c.capacity.scheduleType === "rest" ||
      c.capacity.scheduleType === "flexible" ||
      c.employee.status === "at_risk"
  );

  return (
    <main className="pb-28 lg:pb-0">
      <Header title={t("enterprise.title")} subtitle={t("enterprise.subtitle")} />
      <div className="px-5 lg:px-8">
        <EnterpriseNav />
        <div className="space-y-6">
          <EnterpriseStats summary={summary} />
          <CapacityOverview summary={summary} />
          {atRisk.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">
                {t("enterprise.needsAttention", { count: atRisk.length })}
              </h2>
              <EmployeeTable items={atRisk} />
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-zinc-300 mb-3">{t("enterprise.allActive")}</h2>
            <EmployeeTable items={capacities} />
          </div>
        </div>
      </div>
    </main>
  );
}
