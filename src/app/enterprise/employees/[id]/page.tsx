import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { EmployeeDetailView } from "@/components/enterprise/EmployeeDetailView";
import { getEmployeeById, getEmployeeCapacity } from "@/lib/enterprise";
import { ArrowLeft } from "lucide-react";

export default async function EmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = getEmployeeById(id);

  if (!employee) notFound();

  const { capacity } = getEmployeeCapacity(employee);

  return (
    <main className="pb-28 lg:pb-0">
      <Header title="Employee" subtitle={employee.name} />
      <div className="px-5 lg:px-8 max-w-3xl">
        <Link
          href="/enterprise"
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Enterprise
        </Link>
        <EmployeeDetailView employee={employee} capacity={capacity} />
      </div>
    </main>
  );
}
