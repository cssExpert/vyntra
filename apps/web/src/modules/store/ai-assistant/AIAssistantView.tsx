"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShoppingCart,
  Package,
  Tag,
  Zap,
  BarChart2,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { storeAI, type AIChatMessage } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  error?: boolean;
}

const QUICK_PROMPTS = [
  {
    label: "Low stock products?",
    icon: <Package size={12} />,
    prompt: "Which products are running low on stock? Give me a brief summary.",
  },
  {
    label: "Top revenue products",
    icon: <BarChart2 size={12} />,
    prompt: "What are the top 5 products by revenue this month?",
  },
  {
    label: "Create 20% weekend discount",
    icon: <Tag size={12} />,
    prompt: "Create a 20% discount coupon for digital products this weekend.",
  },
  {
    label: "Abandoned carts > $100",
    icon: <ShoppingCart size={12} />,
    prompt: "Show abandoned carts above $100 in the last 7 days.",
  },
  {
    label: "Generate product description",
    icon: <Sparkles size={12} />,
    prompt:
      "Generate an SEO-optimised product description for a premium SaaS dashboard template.",
  },
  {
    label: "Customer win-back automation",
    icon: <Zap size={12} />,
    prompt: "Create an automation to win back customers inactive for 60 days.",
  },
];

export function AIAssistantView() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("store.ai-assistant");
  const isLoaded = usePageLoad(500);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your ERVFlow Store AI Assistant. I can help you manage your store, generate content, analyse data, and build automations.\n\nWhat would you like to do today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);

    // Build message history for the API (exclude error messages)
    const history: AIChatMessage[] = messages
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: text.trim() });

    try {
      const { content } = await storeAI.chat(history);
      setMessages((p) => [
        ...p,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      const errMsg = err?.message ?? "Failed to get a response.";
      const isUnconfigured = errMsg.includes("not configured") || errMsg.includes("ANTHROPIC_API_KEY");
      if (isUnconfigured) setIsConfigured(false);
      setMessages((p) => [
        ...p,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: isUnconfigured
            ? "AI assistant is not configured. Add your **ANTHROPIC_API_KEY** to the API environment variables, then restart the server."
            : `Sorry, something went wrong: ${errMsg}`,
          timestamp: new Date(),
          error: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-4">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="h-96 w-full rounded-xl bg-muted animate-pulse" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex flex-col gap-4"
          style={{ height: "calc(100vh - 160px)" }}
        >
          <PageHeader
            title="AI Store Assistant"
            description="Powered by Claude — ask anything about your store."
            breadcrumbs={[
              { label: "Store", href: "/store" },
              { label: "AI Assistant" },
            ]}
          >
            <div className={cn(
              "flex items-center gap-1.5 rounded-sm border px-3 py-1.5",
              isConfigured
                ? "bg-success/10 border-success/20"
                : "bg-warning/10 border-warning/20",
            )}>
              <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isConfigured ? "bg-success" : "bg-warning")} />
              <span className={cn("text-xs font-medium", isConfigured ? "text-success" : "text-warning")}>
                {isConfigured ? "Ready" : "Not configured"}
              </span>
            </div>
          </PageHeader>

          {!isConfigured && (
            <div className="flex items-start gap-2 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-warning">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <p>Set <code className="font-mono text-xs bg-warning/10 px-1 py-0.5 rounded">ANTHROPIC_API_KEY</code> in <code className="font-mono text-xs">apps/api/.env</code> to enable live AI responses.</p>
            </div>
          )}

          {/* Chat area */}
          <div
            className="flex-1 overflow-y-auto bg-card rounded-xl border border-border p-4 space-y-4"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white",
                    msg.role === "assistant"
                      ? msg.error ? "bg-warning" : "bg-primary"
                      : "bg-gradient-brand",
                  )}
                >
                  {msg.role === "assistant" ? (
                    msg.error ? <AlertCircle size={13} /> : <Bot size={13} />
                  ) : (
                    <User size={13} />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-4 py-3 text-[13px] leading-relaxed",
                    msg.role === "assistant"
                      ? msg.error
                        ? "bg-warning/10 text-warning border border-warning/20"
                        : "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  <pre className="font-sans whitespace-pre-wrap">{msg.content}</pre>
                  <p className="text-[10px] opacity-50 mt-1.5">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="h-7 w-7 shrink-0 rounded-full bg-primary flex items-center justify-center">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      className="h-1.5 w-1.5 rounded-full bg-muted-foreground block"
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q.label}
                onClick={() => send(q.prompt)}
                disabled={isTyping}
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted hover:border-primary/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="text-primary">{q.icon}</span>
                {q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Lightbulb
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={14}
              />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your store, generate content, create automations…"
                disabled={isTyping}
                size="xl"
                className="w-full pl-9 pr-4 bg-background border border-border rounded-sm text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all shadow-sm disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={14} />
              Send
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
