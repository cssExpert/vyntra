"use client";

import { useEffect, useState } from "react";
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
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { systemPageSettings, type SystemPageSettingsData } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { StoreImagePicker } from "@/modules/store/products/components/StoreImagePicker";

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = "seo" | "listing" | "og" | "favicon" | "scripts" | "styles";
type SaveStatus = "idle" | "saving" | "saved" | "error";

const PAGE_SETTINGS_FILTERS = ["all", "seo", "settings"] as const;

const EMPTY_FORM: SystemPageSettingsData = {
  metaTitle: "",
  metaDesc: "",
  metaKeywords: "",
  noIndex: false,
  ogTitle: "",
  ogDescription: "",
  ogType: "website",
  ogUrl: "",
  ogImage: null,
  faviconUrl: null,
  customSettings: {},
  headScript: "",
  bodyScript: "",
  customCss: "",
};

const inputCls =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50";

const textareaCls = inputCls + " resize-none";

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
              counter.current > counter.max ? "text-rose-500" : "text-muted-foreground/60",
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
  pagePath,
  onChange,
}: {
  form: SystemPageSettingsData;
  pagePath: string;
  onChange: (patch: Partial<SystemPageSettingsData>) => void;
}) {
  const metaTitle = form.metaTitle ?? "";
  const metaDesc = form.metaDesc ?? "";
  return (
    <div className="flex flex-col gap-5">
      <FieldRow label="SEO Title" counter={{ current: metaTitle.length, max: 60 }}>
        <input
          type="text"
          value={metaTitle}
          maxLength={80}
          placeholder="Shop — Acme Corp"
          onChange={(e) => onChange({ metaTitle: e.target.value })}
          className={inputCls}
        />
      </FieldRow>

      <FieldRow
        label="Meta Description"
        hint="Shown in search engine results. Aim for 120–160 characters."
        counter={{ current: metaDesc.length, max: 160 }}
      >
        <textarea
          rows={3}
          value={metaDesc}
          maxLength={250}
          placeholder="A short description of this page for search engines…"
          onChange={(e) => onChange({ metaDesc: e.target.value })}
          className={textareaCls}
        />
        <div className="mt-1 rounded-lg border border-border bg-muted p-3">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-1.5 font-semibold">
            Search Preview
          </p>
          <p className="text-[13px] font-medium text-blue-600 dark:text-blue-400 truncate">
            {metaTitle || "Page Title"}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-500 truncate">
            yoursite.com{pagePath}
          </p>
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
            {metaDesc || "Meta description will appear here…"}
          </p>
        </div>
      </FieldRow>

      <FieldRow label="Keywords" hint="Comma-separated keywords. Less important for modern SEO but still used.">
        <textarea
          rows={2}
          value={form.metaKeywords ?? ""}
          placeholder="keyword1, keyword2, keyword3"
          onChange={(e) => onChange({ metaKeywords: e.target.value })}
          className={textareaCls}
        />
      </FieldRow>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3">
        <Switch
          id="noIndex"
          checked={!!form.noIndex}
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

/**
 * "Listing" tab for the product-listing page — reads/writes into the generic
 * `customSettings` JSON blob so more listing-page settings can be added here
 * later without a schema change. Other system pages (e.g. product-details)
 * would get their own tab writing their own keys into the same field.
 */
function ListingTab({
  form,
  onChange,
}: {
  form: SystemPageSettingsData;
  onChange: (patch: Partial<SystemPageSettingsData>) => void;
}) {
  const custom = form.customSettings ?? {};
  const productsPerPage = typeof custom.productsPerPage === "number" ? custom.productsPerPage : 12;

  function patchCustom(patch: Record<string, unknown>) {
    onChange({ customSettings: { ...custom, ...patch } });
  }

  return (
    <div className="flex flex-col gap-5">
      <FieldRow label="Products per page" hint="Number of products shown per page on the storefront listing (1–100).">
        <input
          type="number"
          min={1}
          max={100}
          value={productsPerPage}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (!Number.isNaN(n)) patchCustom({ productsPerPage: Math.min(100, Math.max(1, n)) });
          }}
          className={inputCls}
        />
      </FieldRow>
    </div>
  );
}

function OgTab({
  form,
  companyId,
  module,
  onChange,
}: {
  form: SystemPageSettingsData;
  companyId: string;
  module: string;
  onChange: (patch: Partial<SystemPageSettingsData>) => void;
}) {
  const OG_TYPES = ["website", "article", "book", "profile", "video.movie"];
  const ogDescription = form.ogDescription ?? "";
  return (
    <div className="flex flex-col gap-5">
      <FieldRow label="OG Title" hint="Defaults to SEO title if empty.">
        <input
          type="text"
          value={form.ogTitle ?? ""}
          placeholder="Override title for social sharing…"
          onChange={(e) => onChange({ ogTitle: e.target.value })}
          className={inputCls}
        />
      </FieldRow>

      <FieldRow label="OG Description" counter={{ current: ogDescription.length, max: 200 }}>
        <textarea
          rows={3}
          value={ogDescription}
          placeholder="Description shown when shared on social media…"
          onChange={(e) => onChange({ ogDescription: e.target.value })}
          className={textareaCls}
        />
      </FieldRow>

      <FieldRow label="OG Type">
        <select
          value={form.ogType ?? "website"}
          onChange={(e) => onChange({ ogType: e.target.value })}
          className={inputCls}
        >
          {OG_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FieldRow>

      <FieldRow label="OG URL" hint="Canonical URL used in the og:url tag.">
        <input
          type="url"
          value={form.ogUrl ?? ""}
          placeholder="https://yoursite.com/products"
          onChange={(e) => onChange({ ogUrl: e.target.value })}
          className={inputCls}
        />
      </FieldRow>

      <FieldRow label="OG Image" hint="Recommended size: 1200 × 630 px.">
        <StoreImagePicker
          value={form.ogImage ?? null}
          onChange={(url) => onChange({ ogImage: url })}
          companyId={companyId}
          module={module}
          subtype="seo"
          filterOptions={PAGE_SETTINGS_FILTERS}
          libraryOnly
          modalZIndexClassName="z-[200]"
        />
      </FieldRow>
    </div>
  );
}

function FaviconTab({
  form,
  companyId,
  module,
  onChange,
}: {
  form: SystemPageSettingsData;
  companyId: string;
  module: string;
  onChange: (patch: Partial<SystemPageSettingsData>) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <FieldRow label="Page Favicon" hint="ICO, PNG, or SVG · recommended 32×32 px.">
        <StoreImagePicker
          value={form.faviconUrl ?? null}
          onChange={(url) => onChange({ faviconUrl: url })}
          companyId={companyId}
          module={module}
          subtype="settings"
          accept="image/png,image/x-icon,image/svg+xml"
          filterOptions={PAGE_SETTINGS_FILTERS}
          libraryOnly
          modalZIndexClassName="z-[200]"
        />
      </FieldRow>
    </div>
  );
}

function ScriptsTab({
  form,
  onChange,
}: {
  form: SystemPageSettingsData;
  onChange: (patch: Partial<SystemPageSettingsData>) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <FieldRow label="Head scripts" hint="Injected inside <head>. Do not wrap in <script> tags.">
        <textarea
          rows={6}
          value={form.headScript ?? ""}
          placeholder={"// e.g. analytics init\nconsole.log('head');"}
          onChange={(e) => onChange({ headScript: e.target.value })}
          className={cn(textareaCls, "font-mono text-xs")}
        />
      </FieldRow>

      <FieldRow label="Body scripts" hint="Injected before </body>. Do not wrap in <script> tags.">
        <textarea
          rows={6}
          value={form.bodyScript ?? ""}
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
  form: SystemPageSettingsData;
  onChange: (patch: Partial<SystemPageSettingsData>) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <FieldRow label="Custom CSS" hint="Injected inside a <style> tag on this page only. Do not wrap in <style> tags.">
        <textarea
          rows={12}
          value={form.customCss ?? ""}
          placeholder={"/* Page-specific styles */\nbody { font-family: 'Inter'; }"}
          onChange={(e) => onChange({ customCss: e.target.value })}
          className={cn(textareaCls, "font-mono text-xs")}
        />
      </FieldRow>
    </div>
  );
}

// ── Panel ──────────────────────────────────────────────────────────────────────

const BASE_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "seo", label: "SEO", icon: Search },
  { id: "og", label: "Open Graph", icon: Share2 },
  { id: "favicon", label: "Favicon", icon: ImageIcon },
  { id: "scripts", label: "Scripts", icon: Code2 },
  { id: "styles", label: "Styles", icon: Paintbrush },
];

const LISTING_TAB = { id: "listing" as const, label: "Listing", icon: LayoutGrid };

export interface PageSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  /** System page key, e.g. "product-listing" — see SYSTEM_PAGE_ROUTES on the web app. */
  pageType: string;
  /** Human label shown in the panel header, e.g. "Product Listing". */
  label: string;
  /** Live storefront path shown in the search preview, e.g. "/products". */
  pagePath: string;
  /** Organization id — required for image uploads. */
  companyId: string;
  /** Storage module for image uploads (OG image, favicon), e.g. "cms", "store" — see STORAGE_INTEGRATION.md. Defaults to "cms". */
  module?: string;
}

/**
 * Page Settings (SEO / Open Graph / Favicon / Scripts / Styles) for a system
 * page — an app-driven storefront route (product listing, …) rather than a
 * CMS-authored page. Generic over `pageType` so new system pages (cart,
 * checkout, …) can reuse this without a new component.
 */
export function PageSettingsPanel({ open, onClose, pageType, label, pagePath, companyId, module = "cms" }: PageSettingsPanelProps) {
  const isProductListing = pageType === "product-listing";
  const tabs = isProductListing ? [BASE_TABS[0], LISTING_TAB, ...BASE_TABS.slice(1)] : BASE_TABS;
  const [tab, setTab] = useState<Tab>("seo");
  const [form, setForm] = useState<SystemPageSettingsData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    systemPageSettings
      .get(pageType)
      .then((data) => setForm({ ...EMPTY_FORM, ...data }))
      .catch(() => {/* leave defaults */})
      .finally(() => setLoading(false));
  }, [open, pageType]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function patch(p: Partial<SystemPageSettingsData>) {
    setForm((prev) => ({ ...prev, ...p }));
  }

  async function handleSave() {
    if (saveStatus === "saving") return;
    setSaveStatus("saving");
    try {
      await systemPageSettings.update(pageType, form);
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
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[140] bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            key="settings-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-[150] w-[420px] max-w-[95vw] flex flex-col bg-card border-l border-border shadow-2xl"
          >
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Page Settings</h2>
                  <p className="text-[10px] text-muted-foreground/60 font-mono">{label} · {pagePath}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="shrink-0 flex border-b border-border overflow-x-auto">
              {tabs.map(({ id, label: tabLabel, icon: Icon }) => (
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
                  {tabLabel}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              ) : (
                <div className="p-5">
                  {tab === "seo" && <SeoTab form={form} pagePath={pagePath} onChange={patch} />}
                  {tab === "listing" && <ListingTab form={form} onChange={patch} />}
                  {tab === "og" && <OgTab form={form} companyId={companyId} module={module} onChange={patch} />}
                  {tab === "favicon" && <FaviconTab form={form} companyId={companyId} module={module} onChange={patch} />}
                  {tab === "scripts" && <ScriptsTab form={form} onChange={patch} />}
                  {tab === "styles" && <StylesTab form={form} onChange={patch} />}
                </div>
              )}
            </div>

            <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-t border-border bg-muted/40">
              <button
                onClick={onClose}
                className="flex-1 h-8 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className={cn(
                  "flex-1 h-8 flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-50",
                  saveStatus === "saved"
                    ? "bg-emerald-600 text-white"
                    : saveStatus === "error"
                      ? "bg-rose-600 text-white"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground",
                )}
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
                      : "Save Settings"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
