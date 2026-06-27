import { handleWhoopOAuthCallback } from "@/lib/whoop/oauth-callback";

/** Legacy path — prefer /callback (matches typical WHOOP dashboard setup). */
export async function GET(req: Request) {
  return handleWhoopOAuthCallback(req);
}
