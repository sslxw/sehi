"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { getCoachResponse, getTodayMetrics } from "@/lib/whoop-data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "What's my Sehi Score?",
  "Best time to train today?",
  "How's my sleep debt?",
  "Plan my week",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey — I'm Sehi Coach. I've analyzed your WHOOP data, journal, and energy curve. Ask about your Sehi Score, strain budget, training window, or weekly plan.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const metrics = getTodayMetrics();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const response = getCoachResponse(text, metrics);
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      return (
        <span key={i}>
          {i > 0 && <br />}
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-[calc(100vh-180px)] lg:h-auto lg:min-h-[calc(100vh-12rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 lg:px-8 space-y-4 pb-4 max-w-3xl">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
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

      <div className="px-5 lg:px-8 pb-2 max-w-3xl">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full glass glass-hover text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask your coach..."
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center disabled:opacity-30 transition-opacity hover:bg-emerald-500/30"
          >
            <Send className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
