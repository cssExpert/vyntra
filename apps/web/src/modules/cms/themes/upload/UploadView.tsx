"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Wand2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  extractZipHtml,
  generatePreviewHtml,
  generateMockPages,
  generateMockAssets,
} from "@/lib/theme-parser";
import { saveCustomTheme } from "../theme-store";
import type {
  UploadStep,
  ProcessingStep,
  ThemeFormData,
  ProcessedResult,
} from "../upload-types";
import { ThemeUploadCard } from "./ThemeUploadCard";
import { ThemeDetailsForm } from "./ThemeDetailsForm";
import { ThemeBuildProgress } from "./ThemeBuildProgress";
import { ThemePreviewPanel } from "./ThemePreviewPanel";

// ---------------------------------------------------------------------------
// Processing steps config
// ---------------------------------------------------------------------------
interface StepConfig {
  id: string;
  label: string;
  ms: number;
}

const PROCESSING_STEPS_CONFIG: StepConfig[] = [
  { id: "upload", label: "Uploading ZIP", ms: 700 },
  { id: "extract", label: "Extracting Theme Files", ms: 900 },
  { id: "validate", label: "Validating Structure", ms: 500 },
  { id: "read", label: "Reading HTML Files", ms: 750 },
  { id: "convert", label: "Converting HTML into Editor Nodes", ms: 1100 },
  { id: "preview", label: "Building Theme Preview", ms: 900 },
  { id: "finalize", label: "Finalizing Theme", ms: 500 },
];

const TOTAL_MS = PROCESSING_STEPS_CONFIG.reduce((s, c) => s + c.ms, 0); // 5350

function makeInitialSteps(): ProcessingStep[] {
  return PROCESSING_STEPS_CONFIG.map((s) => ({
    id: s.id,
    label: s.label,
    status: "waiting",
  }));
}

// ---------------------------------------------------------------------------
// Default form data
// ---------------------------------------------------------------------------
const DEFAULT_FORM: ThemeFormData = {
  name: "",
  description: "",
  category: "Portfolio",
  tags: [],
  author: "",
  version: "1.0.0",
  thumbnailUrl: "",
};

// ---------------------------------------------------------------------------
// Fallback cover URLs per category
// ---------------------------------------------------------------------------
const FALLBACK_COVERS: Record<string, string> = {
  Cosmetics:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
  Portfolio:
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
  Business:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
  Agency:
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
  Resume:
    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
};

// ---------------------------------------------------------------------------
// Step indicator labels
// ---------------------------------------------------------------------------
const STEP_LABELS = ["Upload & Details", "Processing", "Preview & Publish"];

function stepIndex(step: UploadStep): number {
  return { form: 0, processing: 1, preview: 2, success: 2 }[step];
}

// ---------------------------------------------------------------------------
// sleep helper
// ---------------------------------------------------------------------------
function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function UploadView() {
  const router = useRouter();

  const [step, setStep] = useState<UploadStep>("form");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ThemeFormData>(DEFAULT_FORM);
  const [formError, setFormError] = useState("");
  const [steps, setSteps] = useState<ProcessingStep[]>(makeInitialSteps());
  const [progress, setProgress] = useState(0);
  const [currentStepLabel, setCurrentStepLabel] = useState("");
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // -----------------------------------------------------------------------
  // Processing
  // -----------------------------------------------------------------------
  const startProcessing = async () => {
    setStep("processing");
    setSteps(makeInitialSteps());
    setProgress(0);

    // Kick off the real ZIP extraction immediately, in parallel with the
    // animated progress steps so the user sees progress while we work.
    const extractionPromise = zipFile
      ? extractZipHtml(zipFile).catch(() => null)
      : Promise.resolve(null);

    let elapsed = 0;
    for (let i = 0; i < PROCESSING_STEPS_CONFIG.length; i++) {
      const cfg = PROCESSING_STEPS_CONFIG[i];

      setCurrentStepLabel(cfg.label);
      setSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: idx === i ? "active" : idx < i ? "done" : "waiting",
        })),
      );

      await sleep(cfg.ms);
      elapsed += cfg.ms;

      setSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: idx <= i ? "done" : "waiting",
        })),
      );
      setProgress((elapsed / TOTAL_MS) * 100);
    }

    // Wait for actual extraction (already running; usually done by now)
    const extracted = await extractionPromise;

    // Use real content when available, fall back to generated mock
    const previewHtml =
      extracted?.html ??
      generatePreviewHtml(formData.name, formData.description, formData.category);
    const pages =
      extracted?.pages.length ? extracted.pages : generateMockPages(formData.category);
    const assets = extracted?.assets ?? generateMockAssets();

    // Thumbnail priority: auto-detected from ZIP > manually entered URL > category fallback
    const coverUrl =
      extracted?.thumbnailDataUrl ||
      formData.thumbnailUrl ||
      FALLBACK_COVERS[formData.category] ||
      FALLBACK_COVERS.Portfolio;

    setResult({ pages, assets, previewHtml, coverUrl });
    setStep("preview");
  };

  // -----------------------------------------------------------------------
  // Submit (form step)
  // -----------------------------------------------------------------------
  const handleSubmit = async () => {
    if (!zipFile) {
      setFormError("Please upload a .zip file.");
      return;
    }
    if (!formData.name.trim()) {
      setFormError("Theme name is required.");
      return;
    }
    if (!formData.author.trim()) {
      setFormError("Author name is required.");
      return;
    }
    setFormError("");
    await startProcessing();
  };

  // -----------------------------------------------------------------------
  // Publish
  // -----------------------------------------------------------------------
  const handlePublish = async () => {
    if (!result) return;
    setIsPublishing(true);
    await sleep(1000);

    const today = new Date().toISOString().split("T")[0];
    const gallery = {
      id: `theme-${Date.now()}`,
      title: formData.name,
      description: formData.description || "No description provided.",
      category: formData.category,
      itemCount: result.pages.length,
      createdAt: today,
      status: "published" as const,
      coverUrl: result.coverUrl,
      tags: formData.tags.length > 0 ? formData.tags : ["Custom"],
      views: 0,
    };

    saveCustomTheme(gallery);
    setIsPublishing(false);
    setStep("success");
  };

  // -----------------------------------------------------------------------
  // Animations
  // -----------------------------------------------------------------------
  const pageVariants = {
    initial: { opacity: 0, y: 18 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="font-sans text-foreground pb-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={() => router.push("/cms/themes")}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
        <div className="w-px h-5 bg-border" />
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Upload New Theme
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload a ZIP package and publish it to the Themes Hub.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      {step !== "success" && (
        <div className="flex items-center gap-0 mb-10 max-w-md">
          {STEP_LABELS.map((label, idx) => {
            const current = stepIndex(step);
            const isDone = idx < current;
            const isActive = idx === current;
            return (
              <div key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                      isDone
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-muted border-border text-muted-foreground",
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold hidden sm:block whitespace-nowrap",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div
                    className={cn(
                      "h-px w-8 sm:w-12 mx-2 transition-colors",
                      isDone ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* LEFT — Upload */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Upload ZIP Package
                </h2>
                <ThemeUploadCard file={zipFile} onChange={setZipFile} />
              </div>

              {/* RIGHT — Details */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Theme Details
                </h2>
                <ThemeDetailsForm data={formData} onChange={setFormData} />
              </div>
            </div>

            {/* Sticky process bar — matches Settings page */}
            <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
              <p className="text-xs text-muted-foreground">
                {formError ? (
                  <span className="flex items-center gap-1.5 text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {formError}
                  </span>
                ) : (
                  "Upload a .zip file and fill in the details, then click Process Theme."
                )}
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition cursor-pointer shadow-md shadow-primary/20"
              >
                <Wand2 className="w-4 h-4" />
                Process Theme
              </button>
            </div>
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div
            key="processing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ThemeBuildProgress
              steps={steps}
              progress={progress}
              currentStepLabel={currentStepLabel}
            />
          </motion.div>
        )}

        {step === "preview" && result && (
          <motion.div
            key="preview"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ThemePreviewPanel
              result={result}
              formData={formData}
              onPublish={handlePublish}
              isPublishing={isPublishing}
            />
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center min-h-[420px] py-16 px-4"
          >
            <div className="text-center max-w-sm space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 mx-auto"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black text-foreground">
                  Theme Published!
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  <span className="font-semibold text-foreground">
                    {formData.name}
                  </span>{" "}
                  has been published to the Themes Hub and is now available for
                  use.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/cms/themes")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm text-sm font-bold transition-all duration-200 shadow-sm active:scale-[0.98] cursor-pointer"
              >
                View in Themes Hub
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
