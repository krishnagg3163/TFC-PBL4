"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Shirt, Sparkles, User } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ClothingItem } from "@/types";

// ── Types ────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  outfit?: ClothingItem[];
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  outfit: ClothingItem[];
}

// ── Quick-reply chips ────────────────────────────────────

const QUICK_REPLIES = [
  { label: "Casual day out", emoji: "☀️" },
  { label: "Job interview", emoji: "💼" },
  { label: "Date night", emoji: "🌹" },
  { label: "Wedding", emoji: "💍" },
] as const;

// ── Outfit card (inline) ────────────────────────────────

function OutfitItemCard({ item }: { item: ClothingItem }) {
  return (
    <div className="flex items-center gap-3 bg-dark/50 rounded-xl p-2.5 border border-border/50">
      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/50 bg-card">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm font-medium truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-muted text-xs capitalize">{item.category}</span>
          {item.brand && (
            <>
              <span className="text-border text-xs">·</span>
              <span className="text-muted text-xs">{item.brand}</span>
            </>
          )}
        </div>
      </div>
      <span
        className="w-4 h-4 rounded-full flex-shrink-0 border border-border/50"
        style={{ backgroundColor: item.color }}
      />
    </div>
  );
}

// ── Message bubble ───────────────────────────────────────

const bubbleVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      className={`flex gap-2.5 max-w-[88%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      layout
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
          isUser ? "bg-primary/20" : "bg-card border border-border"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Shirt className="w-4 h-4 text-primary" />
        )}
      </div>

      {/* Bubble */}
      <div className="space-y-2">
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-white rounded-tr-sm"
              : "bg-card border border-border text-foreground rounded-tl-sm"
          }`}
        >
          {msg.text}
        </div>

        {/* Outfit suggestion cards */}
        {msg.outfit && msg.outfit.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-3 space-y-2">
            <p className="text-xs text-muted font-medium uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Sparkles className="w-3 h-3 text-primary" />
              Suggested Outfit
            </p>
            {msg.outfit.map((item) => (
              <OutfitItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] text-muted px-1 ${isUser ? "text-right" : ""}`}>
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

// ── Typing indicator ─────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      className="flex gap-2.5 max-w-[88%]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-card border border-border">
        <Shirt className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-muted"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Chat Component ──────────────────────────────────

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hey! 👋 I'm your AI stylist. Tell me an occasion or pick a quick option below, and I'll put together an outfit for you!",
  timestamp: new Date(),
};

export function StylistChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history = messages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role, content: m.text }));

        const data = await apiFetch<ChatResponse>("/stylist/chat", {
          method: "POST",
          body: JSON.stringify({ message: text.trim(), history }),
        });

        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: data.message,
          outfit: data.outfit?.length ? data.outfit : undefined,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            text: "Sorry, I had a moment! Try again? 😅",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [loading, messages],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-2xl mx-auto bg-dark rounded-2xl border border-border overflow-hidden shadow-2xl">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/50 backdrop-blur">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
            <Shirt className="w-5 h-5 text-primary" />
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-card" />
        </div>
        <div>
          <h2 className="text-foreground font-semibold text-sm">TFC Stylist</h2>
          <p className="text-muted text-xs">AI-powered · Always online</p>
        </div>
        <Sparkles className="w-4 h-4 text-primary ml-auto" />
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>

        <AnimatePresence>{loading && <TypingIndicator />}</AnimatePresence>
      </div>

      {/* ── Quick replies ── */}
      {messages.length <= 1 && !loading && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
          {QUICK_REPLIES.map((qr) => (
            <button
              key={qr.label}
              onClick={() => sendMessage(qr.label)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-card border border-border text-foreground text-xs font-medium whitespace-nowrap hover:border-primary/40 hover:bg-card-hover transition-colors flex-shrink-0"
            >
              <span>{qr.emoji}</span>
              {qr.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card/30"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your stylist…"
          disabled={loading}
          className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
