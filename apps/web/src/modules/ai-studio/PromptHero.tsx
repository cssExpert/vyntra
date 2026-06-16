"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parsePrompt, EXAMPLE_PROMPTS } from "@/lib/ai-studio/promptParser";
import { cn } from "@/lib/utils";
import type { ParsedPrompt } from "@/types/ai-studio";

interface PromptHeroProps {
  onGenerate: (parsed: ParsedPrompt, prompt: string) => void;
  onAdvancedSetup: () => void;
}

export function PromptHero({ onGenerate, onAdvancedSetup }: PromptHeroProps) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const parsed = parsePrompt(trimmed);
    onGenerate(parsed, trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }

  function handleChipClick(exPrompt: string) {
    setPrompt(exPrompt);
    inputRef.current?.focus();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/3 p-6 sm:p-8"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative space-y-5">
        {/* Headline */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">
              What would you like to build today?
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Describe your business and AI will generate a complete website
              instantly
            </p>
          </div>
        </div>

        {/* Input + Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Create a website for a Dental Clinic in Texas…"
              className={cn(
                "w-full resize-none min-h-full rounded-xl border border-border bg-background px-4 py-3 text-sm",
                "text-foreground placeholder:text-muted-foreground",
                "outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15",
                "transition-all duration-200 leading-relaxed",
              )}
            />
          </div>
          <div className="flex sm:flex-col gap-2 shrink-0">
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="flex-1 sm:flex-initial gap-2 font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              Generate
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={onAdvancedSetup}
              className="flex-1 sm:flex-initial gap-2"
            >
              <Settings2 className="w-4 h-4" />
              Advanced Setup
            </Button>
          </div>
        </div>

        {/* Example chips */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">
            Try:
          </span>
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => handleChipClick(ex.prompt)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150",
                "border-border bg-muted/50 text-muted-foreground",
                "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                prompt === ex.prompt &&
                  "border-primary/50 bg-primary/10 text-primary",
              )}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
