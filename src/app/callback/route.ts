import { handleWhoopOAuthCallback } from "@/lib/whoop/oauth-callback";

export async function GET(req: Request) {
  return handleWhoopOAuthCallback(req);
}
