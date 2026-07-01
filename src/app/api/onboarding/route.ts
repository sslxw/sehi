import { NextResponse } from "next/server";
import {
  buildExtractSystemPrompt,
  buildOnboardingSystemPrompt,
  stripReadyMarker,
} from "@/lib/onboarding-context";
import { loadSession } from "@/lib/auth/session-store";
import type { Locale } from "@/lib/i18n/types";
import type { OnboardingProfileDraft } from "@/lib/user-profile";

async function callDeepSeek(
  apiKey: string,
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  maxTokens = 1024
): Promise<string> {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "system", content: system }, ...messages],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error("DeepSeek request failed");
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty DeepSeek response");
  return content;
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  try {
    const { messages, locale, bloodTestContext, userName } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      locale?: Locale;
      bloodTestContext?: string | null;
      userName?: string;
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const session = await loadSession();
    const name = userName ?? session?.name ?? "there";
    const loc = locale ?? "en";

    if (!apiKey) {
      return NextResponse.json({
        content:
          loc === "ar-SA"
            ? "مرحباً! احكيلي عن أهدافك الصحية، أدويتك، وتحاليلك — وبعدين نراجع ملفك سوا."
            : "Welcome! Tell me about your health goals, medications, and any recent blood tests — then we'll review your profile together.",
        readyForReview: false,
        offline: true,
      });
    }

    const raw = await callDeepSeek(
      apiKey,
      buildOnboardingSystemPrompt(loc, name, bloodTestContext),
      messages
    );

    const { content, readyForReview } = stripReadyMarker(raw);
    return NextResponse.json({ content, readyForReview });
  } catch (error) {
    console.error("Onboarding chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DEEPSEEK_API_KEY is not configured" }, { status: 503 });
  }

  try {
    const { messages, locale, userName } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[];
      locale?: Locale;
      userName?: string;
    };

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const session = await loadSession();
    const loc = locale ?? "en";
    const name = userName ?? session?.name ?? "User";

    const raw = await callDeepSeek(
      apiKey,
      buildExtractSystemPrompt(loc),
      [
        ...messages,
        {
          role: "user",
          content: `Extract the profile for ${name}. Return JSON only.`,
        },
      ],
      1500
    );

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse profile" }, { status: 502 });
    }

    const draft = JSON.parse(jsonMatch[0]) as OnboardingProfileDraft;
    if (!draft.displayName) draft.displayName = name;
    if (!draft.primaryGoals?.length) draft.primaryGoals = ["General health"];
    if (!draft.activityLevel) draft.activityLevel = "moderate";
    if (!draft.sleepGoalHours) draft.sleepGoalHours = 8;
    if (!draft.trainingDaysPerWeek) draft.trainingDaysPerWeek = 3;
    if (!draft.medications) draft.medications = [];
    if (!draft.weeklyFocus) draft.weeklyFocus = draft.primaryGoals[0] ?? "Build healthy habits";

    return NextResponse.json({ profile: draft });
  } catch (error) {
    console.error("Onboarding extract error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
