"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Opportunity } from "./lighthouse.types";

interface OpportunityCardProps {
  opt: Opportunity;
  onSolveClick: () => void;
}

export function LighthouseOpportunityCard({ opt, onSolveClick }: OpportunityCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        isOpen ? "border-border/80 bg-card/60" : "border-border bg-background/50 hover:border-border/80",
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "p-1.5 rounded-lg flex-shrink-0",
              opt.impact === "high" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400",
            )}
          >
            <AlertTriangle size={15} />
          </span>
          <span className="text-sm font-extrabold text-foreground truncate">{opt.title}</span>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {opt.savings !== "0 ms" && (
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/5 px-2.5 py-1 rounded border border-rose-500/10">
              Est Savings: {opt.savings}
            </span>
          )}
          {isOpen ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/60 px-4 pb-4 pt-3 text-xs"
          >
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
                  Issue Context
                </span>
                <p className="text-foreground/80 leading-relaxed font-sans">{opt.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
                    Recommended Fix
                  </span>
                  <p className="text-muted-foreground leading-relaxed font-sans">{opt.nextSteps}</p>
                </div>
                <div className="flex items-end justify-end">
                  <button
                    onClick={onSolveClick}
                    className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition flex items-center gap-1.5 border border-primary/25"
                  >
                    <Sparkles size={13} />
                    Auto-Generate Optimized Code with AI
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
