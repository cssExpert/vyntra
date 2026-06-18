"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Activity, FileText, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditResults } from "./lighthouse.types";
import { OPPORTUNITIES, getScoreColorClass, getMetricIndicator } from "./lighthouse.utils";
import { LighthouseOpportunityCard } from "./LighthouseOpportunityCard";

interface LighthouseDashboardProps {
  auditResults: AuditResults;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  handleCopy: (text: string, message?: string) => void;
  onSolveWithAI: (prompt: string) => void;
}

export function LighthouseDashboard({
  auditResults, selectedCategory, setSelectedCategory, handleCopy, onSolveWithAI,
}: LighthouseDashboardProps) {
  const t = useTranslations("lighthouse.dashboard");

  const categories = [
    { id: "perf", label: t("catPerformance"), score: auditResults.scores.perf },
    { id: "a11y", label: t("catAccessibility"), score: auditResults.scores.a11y },
    { id: "best", label: t("catBestPractices"), score: auditResults.scores.best },
    { id: "seo", label: t("catSeo"), score: auditResults.scores.seo },
  ];

  const metrics = [
    { id: "fcp", label: t("fcpLabel"), value: auditResults.metrics.fcp, weight: "10%", desc: t("fcpDesc") },
    { id: "si", label: t("siLabel"), value: auditResults.metrics.si, weight: "10%", desc: t("siDesc") },
    { id: "lcp", label: t("lcpLabel"), value: auditResults.metrics.lcp, weight: "25%", desc: t("lcpDesc") },
    { id: "tbt", label: t("tbtLabel"), value: auditResults.metrics.tbt, weight: "30%", desc: t("tbtDesc") },
    { id: "cls", label: t("clsLabel"), value: auditResults.metrics.cls, weight: "25%", desc: t("clsDesc") },
  ];

  return (
    <div className="space-y-8">
      {/* Meta context bar */}
      <div className="p-4 rounded-xl border border-border bg-card/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-mono">
          <div><span className="text-muted-foreground/60">{t("auditTime")}</span>{" "}<span className="text-foreground">{auditResults.info.timestamp}</span></div>
          <div><span className="text-muted-foreground/60">{t("environment")}</span>{" "}<span className="text-foreground">{auditResults.info.device.toUpperCase()} EMULATION</span></div>
          <div><span className="text-muted-foreground/60">{t("throttling")}</span>{" "}<span className="text-foreground">{auditResults.info.throttling}</span></div>
        </div>
        <button
          onClick={() => handleCopy(JSON.stringify(auditResults, null, 2), t("auditDataCopied"))}
          className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition"
        >
          <FileText size={13} /> {t("exportJson")}
        </button>
      </div>

      {/* Score gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const scoreColors = getScoreColorClass(category.score);
          const radius = 40;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (category.score / 100) * circumference;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? "all" : category.id)}
              className={cn(
                "p-6 rounded-2xl border text-center flex flex-col items-center justify-center transition-all duration-300 relative group overflow-hidden",
                isSelected
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card/30 hover:bg-card/60",
              )}
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r={radius} className="stroke-border" strokeWidth="8" fill="none" />
                  <motion.circle
                    cx="56" cy="56" r={radius}
                    className={scoreColors.stroke}
                    strokeWidth="8" strokeLinecap="round" fill="none"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <span className={cn("absolute text-2xl font-black font-mono tracking-tighter", scoreColors.text)}>
                  {category.score}
                </span>
              </div>
              <h3 className="font-extrabold text-sm mb-1 text-foreground">{category.label}</h3>
              <span className={cn("text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border", scoreColors.text, scoreColors.bg, scoreColors.border)}>
                {category.score >= 90 ? t("scoreExcellent") : category.score >= 50 ? t("scoreFair") : t("scorePoor")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card/30">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <div>
              <h3 className="text-base font-extrabold text-foreground">{t("perfMetricsTitle")}</h3>
              <p className="text-xs text-muted-foreground">{t("perfMetricsSubtitle")}</p>
            </div>
            <HelpCircle size={16} className="text-muted-foreground/60 cursor-pointer" aria-label="Lighthouse performance calculations are based on weighting" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.map((m) => {
              const status = getMetricIndicator(m.value, m.id);
              return (
                <div key={m.id} className="p-4 rounded-xl border border-border bg-background/50 overflow-hidden">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground/60 font-mono tracking-wider uppercase">{t("metricWeight", { weight: m.weight })}</span>
                      <h4 className="text-sm font-extrabold text-foreground mt-0.5">{m.label}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-base font-black font-mono", status.color)}>{m.value}</span>
                      <span className={cn("w-2.5 h-2.5 rounded-full", status.bg)} />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">{m.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-end gap-4 text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {t("legendGood")}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> {t("legendNeedsImprovement")}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> {t("legendPoor")}</span>
          </div>
        </div>

        {/* Health timeline */}
        <div className="p-6 rounded-2xl border border-border bg-card/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-primary" size={18} />
              <h3 className="text-base font-extrabold text-foreground">{t("healthTitle")}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-6">{t("healthDesc")}</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Average Performance Trend</span>
                <span className="text-emerald-400 font-bold">+8.4% improvement</span>
              </div>
              <div className="h-28 w-full border border-border rounded-xl bg-background p-2 overflow-hidden">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                  <path d="M 0,35 Q 20,28 40,32 T 80,18 T 100,8" fill="none" className="stroke-primary" strokeWidth="2" />
                  <path d="M 0,35 Q 20,28 40,32 T 80,18 T 100,8 L 100,40 L 0,40 Z" className="fill-primary/10" />
                  <circle cx="100" cy="8" r="3" className="fill-primary animate-ping" />
                  <circle cx="100" cy="8" r="1.5" className="fill-primary" />
                </svg>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>{t("perfTarget")}</span>
              <span className="font-mono text-emerald-400 font-bold">{t("perfTargetValue")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities */}
      <div className="p-6 rounded-2xl border border-border bg-card/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border mb-6 gap-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground">{t("opportunitiesTitle")}</h3>
            <p className="text-xs text-muted-foreground">{t("opportunitiesDesc")}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 w-fit">
            {t("highPriorityFixes")}
          </span>
        </div>

        <div className="space-y-3">
          {OPPORTUNITIES
            .filter((opt) => selectedCategory === "all" || opt.category === selectedCategory)
            .map((opt) => (
              <LighthouseOpportunityCard
                key={opt.id}
                opt={opt}
                onSolveClick={() =>
                  onSolveWithAI(
                    `Provide optimizations for Lighthouse audit error: "${opt.title}". Focus on: ${opt.description}`,
                  )
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
}
