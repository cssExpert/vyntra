"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Globe, FileText, Zap, BookTemplate,
  Plus, AlignLeft,
  Clock, MoveRight, Trash2, ExternalLink, Eye,
  CreditCard, TrendingUp, Settings2, Sparkles,
} from "lucide-react";
import { useAIStudioStore, convertPageToEditorNodes } from "@/store/aiStudioStore";
import { useEditorStore } from "@/store/editorStore";
import { AIWebsiteGenerator } from "./generator/AIWebsiteGenerator";
import { GenerationPreview } from "./generator/GenerationPreview";
import { PromptHero } from "./PromptHero";
import { QuickGenerateDialog } from "./QuickGenerateDialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AIProject, ParsedPrompt } from "@/types/ai-studio";

// ── Animation variants ────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function AIStatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <motion.div variants={item} className="glass-card p-5 flex items-start gap-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ── Quick action card ─────────────────────────────────────────────────────────

function QuickActionCard({
  label,
  description,
  icon: Icon,
  color,
  onClick,
  primary,
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      variants={item}
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5",
        primary
          ? "bg-primary/5 border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:shadow-lg"
          : "glass-card hover:border-primary/30 hover:shadow-md",
      )}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-bold", primary ? "text-primary" : "text-foreground")}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <MoveRight className={cn("w-4 h-4 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", primary ? "text-primary" : "text-muted-foreground")} />
    </motion.button>
  );
}

// ── Project status badge mapping ──────────────────────────────────────────────

const STATUS_MAP: Record<AIProject["status"], "info" | "success" | "warning" | "muted" | "default"> = {
  generating: "warning",
  preview: "info",
  "in-editor": "default",
  published: "success",
  template: "muted",
};

// ── Recent project row ────────────────────────────────────────────────────────

function ProjectRow({
  project,
  onPreview,
  onEdit,
  onDelete,
}: {
  project: AIProject;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted/40 transition-colors">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
        style={{ backgroundColor: project.thumbnailColor }}
      >
        {project.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
        <p className="text-xs text-muted-foreground">
          {project.industry} · {project.website?.pages.length ?? 0} pages · {formatDate(project.createdAt, "relative")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge variant={STATUS_MAP[project.status]} label={project.status} size="sm" />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            type="button"
            onClick={onPreview}
            className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Preview"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            title="Open in editor"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preview overlay (Dialog-based) ───────────────────────────────────────────

function PreviewOverlay({ project, onClose, onEdit }: { project: AIProject | null; onClose: () => void; onEdit: (p: AIProject) => void }) {
  return (
    <Dialog open={!!project} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl h-[92vh] p-0 flex flex-col overflow-hidden gap-0"
      >
        <DialogTitle className="sr-only">Website Preview</DialogTitle>
        {project?.website && (
          <GenerationPreview
            website={project.website}
            projectId={project.id}
            onOpenEditor={() => onEdit(project)}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Credits bar ───────────────────────────────────────────────────────────────

function CreditsBar({ used, total }: { used: number; total: number }) {
  const remaining = total - used;
  const pct = Math.round((remaining / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{remaining} credits remaining</span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            pct > 50 ? "bg-success" : pct > 20 ? "bg-warning" : "bg-destructive",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">Each website costs ~5 credits</p>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function AIStudioView() {
  const { stats, projects, openWizard, openQuickFlow, deleteProject, updateProjectStatus } = useAIStudioStore();
  const { setPendingNodes } = useEditorStore();
  const router = useRouter();
  const creditsUsed = stats.creditsTotal - stats.creditsRemaining;
  const [previewProject, setPreviewProject] = useState<AIProject | null>(null);

  function handleEditProject(project: AIProject) {
    if (!project.website) return;
    const firstPage = project.website.pages[0];
    if (!firstPage) return;
    const nodes = convertPageToEditorNodes(firstPage);
    setPendingNodes(nodes);
    updateProjectStatus(project.id, "in-editor");
    const pageSlug = firstPage.slug.replace(/^\//, "") || "home";
    router.push(`/cms/editor?page=${pageSlug}&project=${project.id}`);
  }

  function handleQuickGenerate(parsed: ParsedPrompt) {
    openQuickFlow(parsed);
  }

  return (
    <>
      {/* Advanced Setup wizard (existing 4-step flow) */}
      <AIWebsiteGenerator />

      {/* Quick Generate dialog (new prompt-first flow) */}
      <QuickGenerateDialog />

      {/* Preview overlay */}
      <PreviewOverlay
        project={previewProject}
        onClose={() => setPreviewProject(null)}
        onEdit={(p) => { setPreviewProject(null); handleEditProject(p); }}
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Page header */}
        <motion.div variants={item} className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">ERV Studio</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Generate complete websites, landing pages, and brand kits with AI.</p>
          </div>
        </motion.div>

        {/* ── Prompt Hero (new) ── */}
        <motion.div variants={item}>
          <PromptHero
            onGenerate={handleQuickGenerate}
            onAdvancedSetup={openWizard}
          />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <AIStatCard label="Websites Generated" value={stats.websitesGenerated} icon={Globe} color="bg-primary/10 text-primary" />
          <AIStatCard label="Pages Generated" value={stats.pagesGenerated} icon={FileText} color="bg-info/10 text-info" />
          <AIStatCard label="AI Credits" value={stats.creditsRemaining} icon={CreditCard} color="bg-warning/10 text-warning" sub={`of ${stats.creditsTotal} total`} />
          <AIStatCard label="Content Generated" value={stats.contentGenerated} icon={AlignLeft} color="bg-success/10 text-success" sub="sections" />
          <AIStatCard label="Saved Templates" value={stats.savedTemplates} icon={BookTemplate} color="bg-purple-500/10 text-purple-500" />
          <AIStatCard label="Active Projects" value={projects.length} icon={TrendingUp} color="bg-cyan-500/10 text-cyan-500" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Actions — 2 cols */}
          <motion.div variants={item} className="lg:col-span-2 glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickActionCard
                label="AI Generate"
                description="Type your business name and AI builds a complete website instantly"
                icon={Sparkles}
                color="bg-primary/10 text-primary"
                onClick={() => {
                  const el = document.querySelector("textarea");
                  if (el) { el.focus(); el.scrollIntoView({ behavior: "smooth", block: "center" }); }
                }}
                primary
              />
              <QuickActionCard
                label="Advanced Setup"
                description="Step-by-step wizard for complete control over every detail"
                icon={Settings2}
                color="bg-info/10 text-info"
                onClick={openWizard}
              />
              <QuickActionCard
                label="Generate Section"
                description="Add a new AI-generated section to an existing page"
                icon={Plus}
                color="bg-success/10 text-success"
                onClick={openWizard}
              />
              <QuickActionCard
                label="Generate Brand Kit"
                description="Colors, fonts, and style guide from your business info"
                icon={Globe}
                color="bg-warning/10 text-warning"
                onClick={openWizard}
              />
            </div>
          </motion.div>

          {/* Credits + Recent */}
          <motion.div variants={item} className="glass-card p-5 flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-warning" />
                </div>
                <h3 className="text-sm font-bold text-foreground">AI Credits</h3>
              </div>
              <CreditsBar used={creditsUsed} total={stats.creditsTotal} />
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Coming Soon</h3>
              </div>
              <div className="space-y-2">
                {[
                  "AI Landing Page Generator",
                  "AI Section Generator",
                  "AI Content Writer",
                  "AI SEO Assistant",
                  "AI Image Generator",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Projects */}
        <motion.div variants={item} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Recent Projects</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Generated websites and saved templates</p>
            </div>
            <Button onClick={openWizard} size="sm" variant="outline" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              New
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">No projects yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Generate your first website to get started.
              </p>
              <Button onClick={openWizard} size="sm" className="gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Generate Website
              </Button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/50">
              {projects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  onPreview={() => setPreviewProject(project)}
                  onEdit={() => handleEditProject(project)}
                  onDelete={() => deleteProject(project.id)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Activity */}
        <motion.div variants={item} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
          </div>

          {projects.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      Generated <span className="text-primary">{project.name}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {project.industry} · {project.website?.pages.length ?? 0} pages
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                    {formatDate(project.createdAt, "relative")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
