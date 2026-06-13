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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  {
    label: "Low stock products?",
    icon: <Package size={12} />,
    prompt: "Which products are low in stock?",
  },
  {
    label: "Top revenue products",
    icon: <BarChart2 size={12} />,
    prompt: "Show me the top 5 products by revenue this month.",
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

const SAMPLE_RESPONSES: Record<string, string> = {
  "which products are low in stock?":
    "📦 **Low Stock Products**\n\n1. **Pro T-Shirt (S)** — 14 units (threshold: 20)\n2. **Pro T-Shirt (M)** — **Out of Stock** ⚠️\n\n_Recommendation: Reorder T-Shirt (M) immediately. Consider enabling backorders for T-Shirt (S) to prevent lost sales._",
  "show me the top 5 products by revenue this month.":
    "📊 **Top 5 Products by Revenue**\n\n1. Business Plan - Monthly — $79 × 1,248 = **$98,592**\n2. Premium SaaS Dashboard Template — $49 × 342 = **$16,758**\n3. SEO Audit Checklist PDF — $19 × 567 = **$10,773**\n4. 1-on-1 Consulting Session — $199 × 78 = **$15,522**\n5. UI Component Bundle — $129 × 89 = **$11,481**",
};

function getResponse(prompt: string): string {
  const key = prompt.toLowerCase().trim();
  return (
    SAMPLE_RESPONSES[key] ??
    `I understand you want to: *"${prompt}"*\n\nThis AI Store Assistant is connected to your store data. In a production environment, I would:\n- Query your database in real-time\n- Run the requested action or analysis\n- Show you results with actionable next steps\n\n_Connect your AI provider (Anthropic/OpenAI) in Store Settings → AI Assistant to enable live responses._`
  );
}

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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
    const response = getResponse(text.trim());
    setIsTyping(false);
    setMessages((p) => [
      ...p,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      },
    ]);
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
            description="Powered by AI — ask anything about your store."
            breadcrumbs={[
              { label: "Store", href: "/store" },
              { label: "AI Assistant" },
            ]}
          >
            <div className="flex items-center gap-1.5 rounded-sm bg-success/10 border border-success/20 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-success">
                Connected
              </span>
            </div>
          </PageHeader>

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
                      ? "bg-primary"
                      : "bg-gradient-brand",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Bot size={13} />
                  ) : (
                    <User size={13} />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-4 py-3 text-[13px] leading-relaxed",
                    msg.role === "assistant"
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  <pre className="font-sans whitespace-pre-wrap">
                    {msg.content}
                  </pre>
                  <p className="text-[10px] opacity-50 mt-1.5">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
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
              className="flex items-center gap-2 rounded-sm bg-primary px-45 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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
