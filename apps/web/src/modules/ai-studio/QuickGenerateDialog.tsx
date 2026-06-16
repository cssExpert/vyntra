"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Building2,
  MapPin,
  Target,
  Palette,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  Edit3,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { GenerationPreview } from "./generator/GenerationPreview";
import {
  useAIStudioStore,
  convertPageToEditorNodes,
} from "@/store/aiStudioStore";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import type { ParsedPrompt } from "@/types/ai-studio";

type Phase = "understanding" | "generating" | "preview";

// ── Understanding card ────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
          color,
        )}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

function UnderstandingPhase({
  parsed,
  onEdit,
  onGenerate,
}: {
  parsed: ParsedPrompt;
  onEdit: () => void;
  onGenerate: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            AI Understanding
          </span>
        </div>
        <h2 className="text-xl font-bold text-foreground mt-1">
          Here&rsquo;s what AI understood
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review and confirm before generating your website
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Business Details */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                Business Details
              </p>
            </div>
            <div className="px-4">
              <InfoRow
                icon={Building2}
                label="Business Type"
                value={parsed.businessType}
                color="bg-primary/10 text-primary"
              />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={parsed.location || "Not specified"}
                color="bg-info/10 text-info"
              />
              <InfoRow
                icon={Target}
                label="Website Goal"
                value={parsed.goal}
                color="bg-success/10 text-success"
              />
            </div>
          </div>

          {/* Website Structure */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                Suggested Pages
              </p>
            </div>
            <div className="px-4 py-3 space-y-2">
              {parsed.suggestedPages.map((page) => (
                <div
                  key={page}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span className="capitalize font-medium">
                    {page.replace(/-/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                Suggested Style
              </p>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                <span className="text-sm font-semibold text-foreground capitalize">
                  {parsed.suggestedStyle} ·{" "}
                  {parsed.suggestedLayout.replace(/-/g, " ")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {parsed.description}
              </p>
            </div>
          </div>

          {/* Brand Kit */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                Suggested Brand Kit
              </p>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Auto Generated
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  AI
                </Badge>
              </div>
              <div className="flex gap-2">
                <div
                  className="flex-1 h-8 rounded-lg border border-border"
                  style={{ backgroundColor: parsed.primaryColor }}
                  title="Primary"
                />
                <div
                  className="flex-1 h-8 rounded-lg border border-border"
                  style={{ backgroundColor: parsed.secondaryColor }}
                  title="Secondary"
                />
                <div
                  className="flex-1 h-8 rounded-lg border border-border"
                  style={{ backgroundColor: parsed.accentColor }}
                  title="Accent"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Editable after generation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex-shrink-0 border-t border-border px-6 py-4 bg-muted/20 flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onEdit} className="gap-2">
          <Edit3 className="w-3.5 h-3.5" />
          Edit Details
        </Button>
        <Button onClick={onGenerate} className="gap-2 font-semibold px-6">
          <Sparkles className="w-4 h-4" />
          Generate Website
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Generation progress phase ─────────────────────────────────────────────────

const TASK_LABELS: Record<string, string> = {
  sitemap: "🗺️",
  content: "✍️",
  "brand-kit": "🎨",
  sections: "📐",
  seo: "🔍",
  layouts: "📱",
  "editor-structure": "⚙️",
};

function GeneratingPhase({ onComplete }: { onComplete: () => void }) {
  const { wizard } = useAIStudioStore();
  const { generationTasks, generationComplete } = wizard;

  const completedCount = generationTasks.filter(
    (t) => t.status === "completed",
  ).length;
  const total = generationTasks.length || 1;
  const progress = Math.round((completedCount / total) * 100);

  useEffect(() => {
    if (generationComplete) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
  }, [generationComplete, onComplete]);

  return (
    <div className="flex flex-col h-full items-center justify-center px-8 py-10">
      <div className="w-full max-w-md space-y-6">
        <AnimatePresence mode="wait">
          {!generationComplete ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-primary animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                AI is building your website
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Generating content, brand kit, and editor structure…
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-7 h-7 text-success" />
              </motion.div>
              <h2 className="text-xl font-bold text-foreground">
                Your website is ready!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {wizard.generatedWebsite?.pages.length ?? 0} pages generated ·
                Opening preview…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Generating…</span>
            <span className="font-bold text-foreground">{progress}%</span>
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
        <div className="space-y-2">
          {generationTasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors text-sm",
                task.status === "completed"
                  ? "border-success/30 bg-success/5 text-success"
                  : task.status === "running"
                    ? "border-primary/30 bg-primary/5 text-primary"
                    : task.status === "error"
                      ? "border-destructive/30 bg-destructive/5 text-destructive"
                      : "border-border bg-muted/20 text-muted-foreground",
              )}
            >
              <span className="text-base shrink-0">
                {TASK_LABELS[task.id] ?? "📄"}
              </span>
              <span className="flex-1 font-medium truncate">{task.label}</span>
              {task.status === "completed" && (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              {task.status === "running" && (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              )}
              {task.status === "pending" && (
                <Circle className="w-4 h-4 shrink-0 opacity-40" />
              )}
              {task.status === "error" && (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main dialog ───────────────────────────────────────────────────────────────

export function QuickGenerateDialog() {
  const {
    quickFlow,
    closeQuickFlow,
    prefillWizardFromPrompt,
    openWizardKeepData,
    startGeneration,
    wizard,
    updateProjectStatus,
  } = useAIStudioStore();
  const { setPendingNodes } = useEditorStore();
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("understanding");

  // Reset phase when dialog opens
  useEffect(() => {
    if (quickFlow.isOpen) setPhase("understanding");
  }, [quickFlow.isOpen]);

  function handleClose() {
    closeQuickFlow();
  }

  function handleEditDetails() {
    if (!quickFlow.parsed) return;
    prefillWizardFromPrompt(quickFlow.parsed);
    closeQuickFlow();
    // Small delay so close animation finishes before wizard opens
    setTimeout(() => openWizardKeepData(), 100);
  }

  async function handleGenerate() {
    setPhase("generating");
    await startGeneration();
  }

  function handleGenerationComplete() {
    setPhase("preview");
  }

  function handleOpenEditor() {
    const website = wizard.generatedWebsite;
    if (!website) return;
    const firstPage = website.pages[0];
    if (!firstPage) {
      handleClose();
      router.push("/cms/editor");
      return;
    }

    const nodes = convertPageToEditorNodes(firstPage);
    setPendingNodes(nodes);

    const projectId = wizard.currentProjectId;
    if (projectId) updateProjectStatus(projectId, "in-editor");

    const pageSlug = firstPage.slug.replace(/^\//, "") || "home";
    handleClose();
    router.push(`/cms/editor?page=${pageSlug}&project=${projectId ?? ""}`);
  }

  if (!quickFlow.parsed) return null;

  return (
    <Dialog
      open={quickFlow.isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-3xl h-[88vh] p-0 flex flex-col overflow-hidden gap-0"
      >
        <DialogTitle className="sr-only">
          Quick AI Website Generation
        </DialogTitle>

        {/* Dialog header bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {phase === "understanding"
                ? "AI Understanding"
                : phase === "generating"
                  ? "Generating Website…"
                  : "Website Preview"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Phase indicator */}
            <div className="flex items-center gap-1.5">
              {(["understanding", "generating", "preview"] as Phase[]).map(
                (p, i) => (
                  <div
                    key={p}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      phase === p
                        ? "w-5 bg-primary"
                        : ["understanding", "generating", "preview"].indexOf(
                              phase,
                            ) > i
                          ? "w-2 bg-primary/50"
                          : "w-2 bg-border",
                    )}
                  />
                ),
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Phase content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === "understanding" && (
              <motion.div
                key="understanding"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <UnderstandingPhase
                  parsed={quickFlow.parsed}
                  onEdit={handleEditDetails}
                  onGenerate={handleGenerate}
                />
              </motion.div>
            )}

            {phase === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <GeneratingPhase onComplete={handleGenerationComplete} />
              </motion.div>
            )}

            {phase === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <GenerationPreview
                  projectId={wizard.currentProjectId ?? undefined}
                  onOpenEditor={handleOpenEditor}
                  onClose={handleClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
