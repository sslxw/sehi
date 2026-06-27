"use client";

import { Header } from "@/components/Header";
import { EmployeeDetailView } from "@/components/enterprise/EmployeeDetailView";
import { BackToEnterpriseLink } from "@/components/enterprise/BackToEnterpriseLink";
import type { Employee, WorkCapacity } from "@/lib/enterprise";
import { useLocale } from "@/components/providers/LocaleProvider";

export function EmployeePageClient({
  employee,
  capacity,
}: {
  employee: Employee;
  capacity: WorkCapacity;
}) {
  const { t } = useLocale();

  return (
    <main className="pb-28 lg:pb-0">
      <Header title={t("common.employee")} subtitle={employee.name} />
      <div className="px-5 lg:px-8 max-w-3xl">
        <BackToEnterpriseLink />
        <EmployeeDetailView employee={employee} capacity={capacity} />
      </div>
    </main>
  );
}
