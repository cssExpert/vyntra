"use client";

import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Search,
  Share2,
  Image as ImageIcon,
  Code2,
  Paintbrush,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cmsPages } from "@/lib/api";
import { useEditorSave } from "./EditorSaveContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = "seo" | "og" | "favicon" | "scripts" | "styles";
type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Form {
  // SEO
  title: string;
  metaDesc: string;
  metaKeywords: string;
  noIndex: boolean;
  // OG (UI-only until backend supports)
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  ogUrl: string;
  // Scripts (UI-only)
  headScript: string;
  bodyScript: string;
  // Styles (UI-only)
  customCss: string;
}

const EMPTY_FORM: Form = {
  title: "",
  metaDesc: "",
  metaKeywords: "",
  noIndex: false,
  ogTitle: "",
  ogDescription: "",
  ogType: "website",
  ogUrl: "",
  headScript: "",
  bodyScript: "",
  customCss: "",
};

// ── Shared input styles ────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

const textareaCls = inputCls + " resize-none";

// ── Field helpers ──────────────────────────────────────────────────────────────

function FieldRow({
  label,
  hint,
  children,
  counter,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  counter?: { current: number; max: number };
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-semibold text-foreground">{label}</label>
        {counter && (
          <span
            className={cn(
              "text-[10px] font-mono tabular-nums",
              counter.current > counter.max
                ? "text-rose-500"
                : "text-muted-foreground/60",
            )}
          >
            {counter.current}/{counter.max}
          </span>
        )}
      </div>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/60">{hint}</p>}
    </div>
  );
}

// ── Tab panels ────────────────────────────────────────────────────────────────

function SeoTab({
  form,
  slug,
  onChange,
}: {
  form: Form;
  slug: string | null;
  onChange: (patch: Partial<Form>) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <FieldRow label="Page Title" counter={{ current: form.title.length, max: 60 }}>
        <input
          type="text"
          value={form.title}
          maxLength={80}
          placeholder="My Awesome Page"
          onChange={(e) => onChange({ title: e.target.value })}
          className={inputCls}
        />
      </FieldRow>

      <FieldRow label="URL Slug">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={slug ?? ""}
            readOnly
            className={cn(inputCls, "bg-muted text-muted-foreground cursor-default")}
          />
          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Open page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground/60">
          Slug is set on the Pages list — edit it there to change the URL.
        </p>
      </FieldRow>

      <FieldRow
        label="Meta Description"
        hint="Shown in search engine results. Aim for 120–160 characters."
        counter={{ current: form.metaDesc.length, max: 160 }}
      >
        <textarea
          rows={3}
          value={form.metaDesc}
          maxLength={250}
          placeholder="A short description of this page for search engines…"
          onChange={(e) => onChange({ metaDesc: e.target.value })}
          className={textareaCls}
        />
        {/* Live SERP preview */}
        <div className="mt-1 rounded-lg border border-border bg-muted p-3">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-1.5 font-semibold">
            Search Preview
          </p>
          <p className="text-[13px] font-medium text-blue-600 dark:text-blue-400 truncate">
            {form.title || "Page Title"}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-500 truncate">
            yoursite.com/{slug ?? "page-slug"}
          </p>
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
            {form.metaDesc || "Meta description will appear here…"}
          </p>
        </div>
      </FieldRow>

      <FieldRow
        label="Keywords"
        hint="Comma-separated keywords. Less important for modern SEO but still used."
      >
        <textarea
          rows={2}
          value={form.metaKeywords}
          placeholder="keyword1, keyword2, keyword3"
          onChange={(e) => onChange({ metaKeywords: e.target.value })}
          className={textareaCls}
        />
      </FieldRow>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3">
        <Switch
          id="noIndex"
          checked={form.noIndex}
          onCheckedChange={(v) => onChange({ noIndex: v })}
          className="data-checked:bg-primary shrink-0"
        />
        <div className="min-w-0">
          <Label htmlFor="noIndex" className="text-xs font-semibold cursor-pointer block">
            Hide from search engines
          </Label>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            Adds <code className="font-mono bg-border px-1 rounded">noindex, nofollow</code> to the page.
          </p>
        </div>
      </div>
    </div>
  );
}

function OgTab({ form, onChange }: { form: Form; onChange: (patch: Partial<Form>) => void }) {
  const OG_TYPES = ["website", "article", "book", "profile", "video.movie"];
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/30 px-3 py-2.5">
        <p className="text-[11px] text-amber-700 dark:text-amber-400">
          Open Graph fields are saved locally and will be persisted once backend support is added.
        </p>
      </div>

      <FieldRow label="OG Title" hint="Defaults to page title if empty.">
        <input
          type="text"
          value={form.ogTitle}
          placeholder="Override title for social sharing…"
          onChange={(e) => onChange({ ogTitle: e.target.value })}
          className={inputCls}
        />
      </FieldRow>

      <FieldRow
        label="OG Description"
        counter={{ current: form.ogDescription.length, max: 200 }}
      >
        <textarea
          rows={3}
          value={form.ogDescription}
          placeholder="Description shown when shared on social media…"
          onChange={(e) => onChange({ ogDescription: e.target.value })}
          className={textareaCls}
        />
      </FieldRow>

      <FieldRow label="OG Type">
        <select
          value={form.ogType}
          onChange={(e) => onChange({ ogType: e.target.value })}
          className={inputCls}
        >
          {OG_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </FieldRow>

      <FieldRow label="OG URL" hint="Canonical URL used in the og:url tag.">
        <input
          type="url"
          value={form.ogUrl}
          placeholder="https://yoursite.com/page"
          onChange={(e) => onChange({ ogUrl: e.target.value })}
          className={inputCls}
        />
      </FieldRow>

      <FieldRow
        label="OG Image"
        hint="Recommended size: 1200 × 630 px. Max 5 MB."
      >
        <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-2 text-center cursor-pointer hover:border-primary/50 hover:bg-muted transition-colors">
          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-xs font-medium text-muted-foreground">Click to upload OG image</p>
          <p className="text-[10px] text-muted-foreground/50">JPG, PNG, WEBP · 1200×630 recommended</p>
        </div>
      </FieldRow>
    </div>
  );
}

function FaviconTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/30 px-3 py-2.5">
        <p className="text-[11px] text-amber-700 dark:text-amber-400">
          Favicon upload will persist once backend storage support is configured.
        </p>
      </div>

      <FieldRow label="Site Favicon" hint="ICO, PNG, or SVG · max 128 KB · recommended 32×32 px.">
        <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-2 text-center cursor-pointer hover:border-primary/50 hover:bg-muted transition-colors">
          <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center">
            <span className="text-2xl select-none">🌐</span>
          </div>
          <p className="text-xs font-medium text-muted-foreground">Click to upload favicon</p>
          <p className="text-[10px] text-muted-foreground/50">ICO · PNG · SVG</p>
        </div>
      </FieldRow>
    </div>
  );
}

function ScriptsTab({
  form,
  onChange,
}: {
  form: Form;
  onChange: (patch: Partial<Form>) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/30 px-3 py-2.5">
        <p className="text-[11px] text-amber-700 dark:text-amber-400">
          Script fields are saved locally and will be persisted once backend support is added.
        </p>
      </div>

      <FieldRow
        label="Head scripts"
        hint="Injected inside <head>. Do not wrap in <script> tags."
      >
        <textarea
          rows={6}
          value={form.headScript}
          placeholder={"// e.g. analytics init\nconsole.log('head');"}
          onChange={(e) => onChange({ headScript: e.target.value })}
          className={cn(textareaCls, "font-mono text-xs")}
        />
      </FieldRow>

      <FieldRow
        label="Body scripts"
        hint="Injected before </body>. Do not wrap in <script> tags."
      >
        <textarea
          rows={6}
          value={form.bodyScript}
          placeholder={"// e.g. chat widget\nconsole.log('body');"}
          onChange={(e) => onChange({ bodyScript: e.target.value })}
          className={cn(textareaCls, "font-mono text-xs")}
        />
      </FieldRow>
    </div>
  );
}

function StylesTab({
  form,
  onChange,
}: {
  form: Form;
  onChange: (patch: Partial<Form>) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/30 px-3 py-2.5">
        <p className="text-[11px] text-amber-700 dark:text-amber-400">
          Custom CSS is saved locally and will be persisted once backend support is added.
        </p>
      </div>

      <FieldRow
        label="Custom CSS"
        hint="Injected inside a <style> tag on this page only. Do not wrap in <style> tags."
      >
        <textarea
          rows={12}
          value={form.customCss}
          placeholder={"/* Page-specific styles */\nbody { font-family: 'Inter'; }"}
          onChange={(e) => onChange({ customCss: e.target.value })}
          className={cn(textareaCls, "font-mono text-xs")}
        />
      </FieldRow>
    </div>
  );
}

// ── Panel ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "seo", label: "SEO", icon: Search },
  { id: "og", label: "Open Graph", icon: Share2 },
  { id: "favicon", label: "Favicon", icon: ImageIcon },
  { id: "scripts", label: "Scripts", icon: Code2 },
  { id: "styles", label: "Styles", icon: Paintbrush },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PageSettingsPanel({ open, onClose }: Props) {
  const { pageSlug } = useEditorSave();
  const [tab, setTab] = useState<Tab>("seo");
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Load current page meta when panel opens
  useEffect(() => {
    if (!open || !pageSlug) return;
    setLoading(true);
    cmsPages
      .load(pageSlug)
      .then((page) => {
        setForm((prev) => ({
          ...prev,
          title: page.title ?? "",
          metaDesc: page.metaDesc ?? "",
          metaKeywords: page.metaKeywords ?? "",
        }));
      })
      .catch(() => {/* leave defaults */})
      .finally(() => setLoading(false));
  }, [open, pageSlug]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function patch(p: Partial<Form>) {
    setForm((prev) => ({ ...prev, ...p }));
  }

  async function handleSave() {
    if (!pageSlug || saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      // Save the API-backed fields only; others are UI-only until backend extends
      await (cmsPages.save as (
        slug: string,
        body: {
          content: string;
          title?: string;
          metaDesc?: string;
          metaKeywords?: string;
        },
      ) => Promise<unknown>)(pageSlug, {
        content: "", // content managed by canvas save, not here
        title: form.title,
        metaDesc: form.metaDesc,
        metaKeywords: form.metaKeywords,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[140] bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="settings-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-[150] w-[420px] max-w-[95vw] flex flex-col bg-card border-l border-border shadow-2xl"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Page Settings</h2>
                  {pageSlug && (
                    <p className="text-[10px] text-muted-foreground/60 font-mono">
                      /{pageSlug}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="shrink-0 flex border-b border-border overflow-x-auto">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px",
                    tab === id
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground",
                  )}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              ) : (
                <div className="p-5">
                  {tab === "seo" && (
                    <SeoTab form={form} slug={pageSlug} onChange={patch} />
                  )}
                  {tab === "og" && <OgTab form={form} onChange={patch} />}
                  {tab === "favicon" && <FaviconTab />}
                  {tab === "scripts" && (
                    <ScriptsTab form={form} onChange={patch} />
                  )}
                  {tab === "styles" && (
                    <StylesTab form={form} onChange={patch} />
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-t border-border bg-muted/40">
              <button
                onClick={onClose}
                className="flex-1 h-8 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveStatus === "saving" || !pageSlug || tab !== "seo"}
                className={cn(
                  "flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-50",
                  saveStatus === "saved"
                    ? "bg-emerald-600 text-white"
                    : saveStatus === "error"
                      ? "bg-rose-600 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground",
                )}
                title={tab !== "seo" ? "Only SEO settings can be saved (switch to SEO tab)" : undefined}
              >
                {saveStatus === "saving" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saveStatus === "saved" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : saveStatus === "error" ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : null}
                {saveStatus === "saving"
                  ? "Saving…"
                  : saveStatus === "saved"
                    ? "Saved!"
                    : saveStatus === "error"
                      ? "Error — retry"
                      : tab === "seo"
                        ? "Save SEO Settings"
                        : "Save (SEO only)"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
