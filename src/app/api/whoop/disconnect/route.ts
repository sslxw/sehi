import { NextResponse } from "next/server";
import { getValidAccessToken, revokeWhoopAccess } from "@/lib/whoop/client";

export async function POST() {
  const accessToken = await getValidAccessToken();
  if (accessToken) {
    await revokeWhoopAccess(accessToken);
  }
  return NextResponse.json({ ok: true });
}
