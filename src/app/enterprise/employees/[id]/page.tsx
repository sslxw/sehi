import { notFound } from "next/navigation";
import { EmployeePageClient } from "@/components/enterprise/EmployeePageClient";
import { getEmployeeById, getEmployeeCapacity } from "@/lib/enterprise";

export default async function EmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = getEmployeeById(id);

  if (!employee) notFound();

  const { capacity } = getEmployeeCapacity(employee);

  return <EmployeePageClient employee={employee} capacity={capacity} />;
}
