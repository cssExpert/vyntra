"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Loader2, AlertCircle, Sparkles, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIStudioStore } from "@/store/aiStudioStore";
import { cn } from "@/lib/utils";

const TASK_ICONS: Record<string, string> = {
  sitemap: "🗺️",
  content: "✍️",
  "brand-kit": "🎨",
  sections: "📐",
  seo: "🔍",
  layouts: "📱",
  "editor-structure": "⚙️",
};

export function Step4Generation({ onComplete }: { onComplete: () => void }) {
  const { wizard, startGeneration } = useAIStudioStore();
  const { generationTasks, isGenerating, generationComplete } = wizard;

  useEffect(() => {
    if (!isGenerating && !generationComplete) {
      startGeneration();
    }
  }, []);

  // Auto-advance to preview 800ms after generation finishes
  useEffect(() => {
    if (!generationComplete) return;
    const t = setTimeout(onComplete, 800);
    return () => clearTimeout(t);
  }, [generationComplete]);

  const completedCount = generationTasks.filter((t) => t.status === "completed").length;
  const progress = Math.round((completedCount / generationTasks.length) * 100);

  return (
    <div className="flex flex-col h-full items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <AnimatePresence mode="wait">
          {!generationComplete ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground">AI is building your website</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Generating content, brand kit, and editor structure…
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center mb-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-7 h-7 text-success" />
                </motion.div>
              </div>
              <h2 className="text-xl font-bold text-foreground">Your website is ready!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {wizard.generatedWebsite?.pages.length ?? 0} pages generated with content, brand kit, and SEO.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
            <span className="text-xs font-bold text-foreground">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-2">
          {generationTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors",
                task.status === "completed" ? "border-success/30 bg-success/5" :
                task.status === "running" ? "border-primary/30 bg-primary/5" :
                task.status === "error" ? "border-destructive/30 bg-destructive/5" :
                "border-border bg-muted/30",
              )}
            >
              <span className="text-base shrink-0">{TASK_ICONS[task.id] ?? "📄"}</span>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-semibold",
                  task.status === "completed" ? "text-success" :
                  task.status === "running" ? "text-primary" :
                  task.status === "error" ? "text-destructive" :
                  "text-muted-foreground",
                )}>
                  {task.label}
                </p>
                <p className="text-xs text-muted-foreground">{task.description}</p>
              </div>

              <div className="shrink-0">
                {task.status === "completed" && <CheckCircle2 className="w-4 h-4 text-success" />}
                {task.status === "running" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                {task.status === "pending" && <Circle className="w-4 h-4 text-border" />}
                {task.status === "error" && <AlertCircle className="w-4 h-4 text-destructive" />}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA when complete */}
        <AnimatePresence>
          {generationComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex justify-center"
            >
              <Button onClick={onComplete} size="lg" className="gap-2 px-8">
                <Sparkles className="w-4 h-4" />
                Preview Your Website
                <MoveRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
