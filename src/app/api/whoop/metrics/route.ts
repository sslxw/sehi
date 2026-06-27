import { NextResponse } from "next/server";
import { getServerWhoopMetrics } from "@/lib/whoop/client";

export async function GET() {
  const data = await getServerWhoopMetrics();
  return NextResponse.json(data);
}
