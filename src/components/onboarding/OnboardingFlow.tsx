"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ClipboardCheck, Loader2 } from "lucide-react";
import { formatBloodTestForCoach, getLatestBloodTestAsync } from "@/lib/blood-test";
import type { OnboardingProfileDraft } from "@/lib/user-profile";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProfileReview } from "./ProfileReview";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type Step = "chat" | "review" | "complete";

export function OnboardingFlow() {
  const { t, locale } = useLocale();
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState<Step>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [readyForReview, setReadyForReview] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfileDraft | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: t("onboarding.welcome", { name: user?.name ?? "" }),
      },
    ]);
    setReadyForReview(false);
  }, [locale, t, user?.name]);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = updated
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const bloodTestContext = formatBloodTestForCoach(
        await getLatestBloodTestAsync(user?.userId)
      );

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          locale,
          bloodTestContext,
          userName: user?.name,
        }),
      });

      const data = await res.json();
      const content = data.content ?? t("onboarding.fallbackReply");

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content },
      ]);

      if (data.readyForReview) setReadyForReview(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: t("onboarding.fallbackReply") },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const goToReview = async () => {
    setExtracting(true);
    try {
      const apiMessages = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          locale,
          userName: user?.name,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.profile) throw new Error("extract failed");

      setProfile(data.profile);
      setStep("review");
    } catch {
      setProfile({
        displayName: user?.name ?? "User",
        activityLevel: "moderate",
        primaryGoals: ["General health"],
        medications: [],
        sleepGoalHours: 8,
        trainingDaysPerWeek: 3,
        weeklyFocus: "Build consistent sleep and training habits",
      });
      setStep("review");
    } finally {
      setExtracting(false);
    }
  };

  const handleConfirm = async (draft: OnboardingProfileDraft) => {
    setCompleting(true);
    try {
      await completeOnboarding(draft);
      setStep("complete");
    } finally {
      setCompleting(false);
    }
  };

  if (step === "review" && profile) {
    return (
      <div className="w-full flex justify-center">
        <ProfileReview
          profile={profile}
          loading={completing}
          onConfirm={handleConfirm}
          onBack={() => setStep("chat")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-2xl h-[calc(100dvh-8rem)]">
      <div className="mb-4 text-center">
        <h1 className="text-xl font-semibold text-white">{t("onboarding.title")}</h1>
        <p className="text-sm text-zinc-500 mt-1">{t("onboarding.subtitle")}</p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto space-y-4 px-1"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center me-2 mt-1 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-cyan-500/15 text-cyan-100 border border-cyan-500/20"
                    : "glass text-zinc-300"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="glass rounded-2xl px-4 py-3 flex gap-1">
              <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
              <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
              <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 pt-3 space-y-3">
        {(readyForReview || messages.length > 3) && (
          <button
            type="button"
            onClick={goToReview}
            disabled={extracting || isTyping}
            className="w-full py-2.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 text-sm font-medium flex items-center justify-center gap-2 hover:bg-violet-500/25 disabled:opacity-50"
          >
            {extracting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ClipboardCheck className="w-4 h-4" />
            )}
            {t("onboarding.reviewProfile")}
          </button>
        )}

        <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={t("onboarding.placeholder")}
            dir="auto"
            className="flex-1 min-w-0 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center disabled:opacity-30 hover:bg-cyan-500/30 shrink-0"
          >
            <Send className="w-4 h-4 text-cyan-400 rtl-flip" />
          </button>
        </div>
      </div>
    </div>
  );
}
