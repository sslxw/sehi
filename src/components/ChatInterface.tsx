"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { getLocalizedCoachResponse } from "@/lib/coach-fallback";
import { formatBloodTestForCoach, getLatestBloodTest } from "@/lib/blood-test";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useWhoop } from "@/components/providers/WhoopProvider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const MOBILE_NAV_PADDING = "calc(5.25rem + env(safe-area-inset-bottom, 0px))";

export function ChatInterface() {
  const { t, locale } = useLocale();
  const { today: metrics, dailyMetrics } = useWhoop();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickPrompts = useMemo(
    () => [
      t("coach.promptSehi"),
      t("coach.promptTrain"),
      t("coach.promptSleepDebt"),
      t("coach.promptWeek"),
    ],
    [t]
  );

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: t("coach.welcome"),
      },
    ]);
  }, [locale, t]);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => scrollToBottom(false));
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const apiMessages = updatedMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const bloodTestContext = formatBloodTestForCoach(getLatestBloodTest());

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, locale, bloodTestContext }),
      });

      const data = await res.json();

      let content: string;
      if (res.ok && data.content) {
        content = data.content;
      } else if (data.error?.includes("DEEPSEEK")) {
        content = getLocalizedCoachResponse(text, metrics, t, dailyMetrics);
      } else {
        content = data.error ?? t("coachFallback.error");
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: getLocalizedCoachResponse(text, metrics, t, dailyMetrics),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      const formatted = line.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="text-white font-semibold">$1</strong>'
      );
      return (
        <span key={i}>
          {i > 0 && <br />}
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-5 lg:px-8"
      >
        <div className="space-y-4 py-2 max-w-3xl lg:max-w-none">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center me-2 mt-1 flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-500/15 text-emerald-100 border border-emerald-500/20"
                      : "glass text-zinc-300"
                  }`}
                >
                  {formatContent(msg.content)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="glass rounded-2xl px-4 py-3 flex gap-1">
                <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <div className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-500" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="shrink-0 px-5 lg:px-8 pt-2 pb-2 bg-[#07070a]/95 backdrop-blur-xl border-t border-white/[0.06] lg:bg-[#07070a]">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none -mx-1 px-1 max-w-3xl lg:max-w-none">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full glass glass-hover text-zinc-400 hover:text-zinc-200 transition-colors whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2.5 max-w-3xl lg:max-w-none">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={t("coach.placeholder")}
            dir="auto"
            className="flex-1 min-w-0 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center disabled:opacity-30 transition-opacity hover:bg-emerald-500/30 shrink-0"
          >
            <Send className="w-4 h-4 text-emerald-400 rtl-flip" />
          </button>
        </div>
      </div>
    </div>
  );
}
