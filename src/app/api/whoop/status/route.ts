import { NextResponse } from "next/server";
import { getWhoopConfig } from "@/lib/whoop/config";
import { isWhoopConnected, loadWhoopTokens } from "@/lib/whoop/token-store";

export async function GET() {
  const config = getWhoopConfig();
  const tokens = await loadWhoopTokens();

  return NextResponse.json({
    configured: Boolean(config),
    connected: isWhoopConnected(tokens),
  });
}
