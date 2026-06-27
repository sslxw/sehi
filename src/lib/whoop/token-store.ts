import { promises as fs } from "fs";
import path from "path";
import type { WhoopTokens } from "./types";

const TOKEN_PATH = path.join(process.cwd(), ".data", "whoop-tokens.json");

async function ensureDir() {
  await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
}

export async function loadWhoopTokens(): Promise<WhoopTokens | null> {
  try {
    const raw = await fs.readFile(TOKEN_PATH, "utf8");
    return JSON.parse(raw) as WhoopTokens;
  } catch {
    return null;
  }
}

export async function saveWhoopTokens(tokens: WhoopTokens): Promise<void> {
  await ensureDir();
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2), "utf8");
}

export async function clearWhoopTokens(): Promise<void> {
  try {
    await fs.unlink(TOKEN_PATH);
  } catch {
    // ignore
  }
}

export function isWhoopConnected(tokens: WhoopTokens | null): tokens is WhoopTokens {
  return Boolean(tokens?.refresh_token);
}
