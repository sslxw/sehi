import { NextResponse } from "next/server";
import { buildCoachSystemPrompt } from "@/lib/coach-context";
import { getServerWhoopMetrics } from "@/lib/whoop/client";
import { pickTodayMetrics } from "@/lib/whoop-data";
import { createDefaultJournalEntry, type JournalEntry } from "@/lib/journal";
import { getAuthUserIdServer, loadUserDataServer } from "@/lib/supabase/db-server";
import type { Locale } from "@/lib/i18n";

async function loadServerJournal(): Promise<JournalEntry> {
  const userId = await getAuthUserIdServer();
  if (!userId) return createDefaultJournalEntry();

  const history = await loadUserDataServer<JournalEntry[]>(userId, "journal");
  if (!history?.length) return createDefaultJournalEntry();

  const today = new Date().toISOString().split("T")[0];
  return history.find((e) => e.date === today) ?? createDefaultJournalEntry(today);
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY is not configured" },
      { status: 503 }
    );
  }

  try {
    const { messages, locale, bloodTestContext, profileContext } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      locale?: Locale;
      bloodTestContext?: string | null;
      profileContext?: string | null;
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const whoop = await getServerWhoopMetrics();
    const journal = await loadServerJournal();

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: buildCoachSystemPrompt(locale ?? "en", {
              bloodTestContext,
              profileContext,
              metrics: pickTodayMetrics(whoop.metrics),
              dailyMetrics: whoop.metrics,
              whoopConnected: whoop.connected,
              journal,
            }),
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("DeepSeek error:", err);
      return NextResponse.json(
        { error: "Failed to get response from DeepSeek" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "Empty response from DeepSeek" }, { status: 502 });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
