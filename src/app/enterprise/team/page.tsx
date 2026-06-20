"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { EnterpriseNav } from "@/components/enterprise/EnterpriseNav";
import { EmployeeTable, TeamFilter } from "@/components/enterprise/EmployeeTable";
import { getAllEmployeeCapacities, employees } from "@/lib/enterprise";

export default function EnterpriseTeamPage() {
  const [teamFilter, setTeamFilter] = useState<string | null>(null);
  const capacities = getAllEmployeeCapacities();
  const teams = useMemo(
    () => [...new Set(employees.map((e) => e.team))].sort(),
    []
  );

  return (
    <main className="pb-28 lg:pb-0">
      <Header title="Team" subtitle="Filter by team and assign daily work hours" />
      <div className="px-5 lg:px-8">
        <EnterpriseNav />

        <div className="mb-4">
          <TeamFilter teams={teams} active={teamFilter} onChange={setTeamFilter} />
        </div>

        <EmployeeTable items={capacities} filterTeam={teamFilter ?? undefined} />
      </div>
    </main>
  );
}
