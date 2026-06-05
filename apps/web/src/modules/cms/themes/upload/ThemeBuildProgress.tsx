"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProcessingStep } from "../upload-types";

interface ThemeBuildProgressProps {
  steps: ProcessingStep[];
  progress: number;
  currentStepLabel: string;
}

export function ThemeBuildProgress({ steps, progress, currentStepLabel }: ThemeBuildProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] py-12 px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-lg space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-2">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Theme build in progress…</h2>
          <p className="text-sm text-muted-foreground">{currentStepLabel}</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs font-semibold text-right text-muted-foreground">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Step checklist */}
        <ul className="space-y-2.5">
          {steps.map((step) => (
            <AnimatePresence key={step.id} mode="wait">
              <motion.li
                key={`${step.id}-${step.status}`}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <span className="shrink-0">
                  {step.status === "done" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : step.status === "active" ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    step.status === "done"
                      ? "text-emerald-500"
                      : step.status === "active"
                        ? "text-primary"
                        : "text-muted-foreground/50",
                  )}
                >
                  {step.label}
                </span>
              </motion.li>
            </AnimatePresence>
          ))}
        </ul>
      </div>
    </div>
  );
}
