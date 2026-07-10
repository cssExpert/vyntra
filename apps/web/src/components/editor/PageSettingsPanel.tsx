"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Megaphone,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cmsPages, type CmsPageSettingsDto } from "@/lib/api";
import { useEditorSave } from "./EditorSaveContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TruncatedText } from "@/components/ui/truncated-text";
import { StoreImagePicker } from "@/modules/store/products/components/StoreImagePicker";

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = "seo" | "og" | "social" | "favicon" | "scripts" | "styles";
type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Form {
  // SEO
  title: string;
  metaDesc: string;
  metaKeywords: string;
  noIndex: boolean;
  // OG
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  ogUrl: string;
  ogImage: string | null;
  // Social / X
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string | null;
  twitterCardSize: "large" | "small";
  // Favicon
  faviconUrl: string | null;
  // Scripts
  headScript: string;
  bodyScript: string;
  // Styles
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
  ogImage: null,
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: null,
  twitterCardSize: "large",
  faviconUrl: null,
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
      <FieldRow
        label="Page Title"
        counter={{ current: form.title.length, max: 60 }}
      >
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
            className={cn(
              inputCls,
              "bg-muted text-muted-foreground cursor-default",
            )}
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
        <div className="mt-2">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            Preview on Google
            <Lightbulb className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="rounded-lg border border-border bg-white dark:bg-background px-4 py-3">
            <TruncatedText className="text-lg font-bold leading-snug text-[#1a0dab] dark:text-blue-400">
              {form.title || "Page Title"}
            </TruncatedText>
            <p className="mt-0.5 truncate text-[13px] text-[#006621] dark:text-emerald-500">
              https://yoursite.com/{slug ?? "page-slug"}
            </p>
            <p className="mt-1 line-clamp-2 text-[13px] text-[#4d5156] dark:text-muted-foreground">
              {form.metaDesc || "Meta description will appear here…"}
            </p>
          </div>
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
          <Label
            htmlFor="noIndex"
            className="text-xs font-semibold cursor-pointer block"
          >
            Hide from search engines
          </Label>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            Adds{" "}
            <code className="font-mono bg-border px-1 rounded">
              noindex, nofollow
            </code>{" "}
            to the page.
          </p>
        </div>
      </div>
    </div>
  );
}

function OgTab({
  form,
  onChange,
}: {
  form: Form;
  onChange: (patch: Partial<Form>) => void;
}) {
  const OG_TYPES = ["website", "article", "book", "profile", "video.movie"];
  return (
    <div className="flex flex-col gap-5">
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
        hint="Recommended size: 1200 × 630 px."
      >
        <StoreImagePicker
          value={form.ogImage}
          onChange={(url) => onChange({ ogImage: url })}
          module="cms"
          subtype="seo"
          filterOptions={["all", "seo"]}
          libraryOnly
          modalZIndexClassName="z-[200]"
          hint="Recommended 1200 × 630 px."
        />
      </FieldRow>
    </div>
  );
}

/** X (formerly Twitter) brand logo — lucide has no brand icons. */
function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_FILTERS = ["all", "seo"] as const;

/**
 * "Social Share" tab — friendlier editor for the Open Graph tags social
 * networks read, plus X/Twitter card overrides. UI-only until the backend
 * persists these fields (mirrors the OG tab).
 */
function SocialShareTab({
  form,
  slug,
  onChange,
}: {
  form: Form;
  slug: string | null;
  onChange: (patch: Partial<Form>) => void;
}) {
  const [xOpen, setXOpen] = useState(false);
  const ogTitle = form.ogTitle;
  const ogDescription = form.ogDescription;
  const host = `www.yoursite.com/${slug ?? "page-slug"}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h3 className="text-sm font-bold text-foreground">
          Social share settings
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Open graph (og) tags are used by social networks like Facebook &amp;
          Pinterest to display text and an image when this page is shared.
        </p>
      </div>

      <div className="border-t border-border" />

      {/* Preview */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">
          Preview on social{" "}
          <span className="cursor-pointer text-blue-500 hover:underline">
            When will changes show live?
          </span>
        </p>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="aspect-[1.91/1] bg-muted">
            {form.ogImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.ogImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No image selected
              </div>
            )}
          </div>
          <div className="border-t border-border bg-muted/40 px-3.5 py-3">
            <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
              {host}
            </p>
            <p className="mt-0.5 truncate text-[13px] font-bold text-foreground">
              {ogTitle || "Title shown on social media"}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">
              {ogDescription || "Description shown on social media…"}
            </p>
          </div>
        </div>

        {/* Image picker */}
        <div className="mt-3">
          <StoreImagePicker
            value={form.ogImage}
            onChange={(url) => onChange({ ogImage: url })}
            module="cms"
            subtype="seo"
            filterOptions={SOCIAL_FILTERS}
            libraryOnly
            modalZIndexClassName="z-[200]"
            hint="Recommended 1200 × 630 px."
          />
        </div>
      </div>

      {/* og:title */}
      <FieldRow label="og:title (title on social media)">
        <input
          type="text"
          value={ogTitle}
          placeholder="Title on social media"
          onChange={(e) => onChange({ ogTitle: e.target.value })}
          className={inputCls}
        />
      </FieldRow>

      {/* og:description */}
      <FieldRow label="og:description (description on social media)">
        <textarea
          rows={4}
          value={ogDescription}
          placeholder="Description on social media"
          onChange={(e) => onChange({ ogDescription: e.target.value })}
          className={textareaCls}
        />
      </FieldRow>

      {/* X (Twitter) settings — collapsible */}
      <div className="border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setXOpen((v) => !v)}
          className="flex w-full items-center gap-1.5 text-sm font-semibold text-foreground outline-none focus:outline-none"
          aria-expanded={xOpen}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              xOpen && "rotate-90",
            )}
          />
          <XLogo className="h-3.5 w-3.5" />X Settings
        </button>

        {xOpen && (
          <div className="mt-3 flex flex-col gap-5">
            {/* Preview on X */}
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                Preview on X{" "}
                <span className="cursor-pointer text-blue-500 hover:underline">
                  When will changes show live?
                </span>
              </p>

              {(() => {
                const img = form.twitterImage ?? form.ogImage ?? null;
                const title =
                  form.twitterTitle || ogTitle || "Title shown on X";
                const desc =
                  form.twitterDescription ||
                  ogDescription ||
                  "Description shown on X…";
                const domain = host.split("/")[0];

                if (form.twitterCardSize === "small") {
                  return (
                    <div className="flex overflow-hidden rounded-2xl border border-border">
                      <div className="aspect-square w-24 shrink-0 bg-sky-50 dark:bg-muted">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 px-3 py-2">
                        <p className="truncate text-[13px] font-bold text-foreground">
                          {title}
                        </p>
                        <p className="line-clamp-2 text-[12px] text-muted-foreground">
                          {desc}
                        </p>
                        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                          <Link2 className="h-3 w-3 shrink-0" />
                          {domain}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="overflow-hidden rounded-2xl border border-border">
                    <div className="flex aspect-[1.91/1] items-center justify-center bg-sky-50 dark:bg-muted">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No image selected
                        </span>
                      )}
                    </div>
                    <div className="border-t border-border px-3.5 py-2.5">
                      <p className="truncate text-[13px] font-bold text-foreground">
                        {title}
                      </p>
                      <p className="line-clamp-2 text-[12px] text-muted-foreground">
                        {desc}
                      </p>
                      <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <Link2 className="h-3 w-3 shrink-0" />
                        {domain}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Image picker */}
              <div className="mt-3">
                <StoreImagePicker
                  value={form.twitterImage}
                  onChange={(url) => onChange({ twitterImage: url })}
                  module="cms"
                  subtype="seo"
                  filterOptions={SOCIAL_FILTERS}
                  libraryOnly
                  modalZIndexClassName="z-[200]"
                  hint="Defaults to the social image above if left empty."
                />
              </div>
            </div>

            {/* Card size */}
            <div>
              <p className="mb-2 text-xs font-semibold text-foreground">
                Card size to display on X
              </p>
              <div className="flex flex-col gap-2.5">
                {(
                  [
                    { value: "large", label: "Large" },
                    { value: "small", label: "Small" },
                  ] as const
                ).map((opt) => {
                  const selected = form.twitterCardSize === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChange({ twitterCardSize: opt.value })}
                      className="flex items-center gap-2.5 text-sm text-foreground outline-none focus:outline-none"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          selected
                            ? "border-primary"
                            : "border-muted-foreground/40",
                        )}
                      >
                        {selected && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* x:title */}
            <FieldRow label="x:title (title on X)">
              <input
                type="text"
                value={form.twitterTitle}
                placeholder="Title on X"
                onChange={(e) => onChange({ twitterTitle: e.target.value })}
                className={inputCls}
              />
            </FieldRow>

            {/* x:description */}
            <FieldRow label="x:description (description on X)">
              <textarea
                rows={4}
                value={form.twitterDescription}
                placeholder="Description on X"
                onChange={(e) =>
                  onChange({ twitterDescription: e.target.value })
                }
                className={textareaCls}
              />
            </FieldRow>
          </div>
        )}
      </div>
    </div>
  );
}

function FaviconTab({
  form,
  onChange,
}: {
  form: Form;
  onChange: (patch: Partial<Form>) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <FieldRow
        label="Site Favicon"
        hint="ICO, PNG, or SVG · recommended 32×32 px. Overrides the site-wide favicon for this page only."
      >
        <StoreImagePicker
          value={form.faviconUrl}
          onChange={(url) => onChange({ faviconUrl: url })}
          module="cms"
          subtype="favicon"
          filterOptions={["all", "seo"]}
          libraryOnly
          modalZIndexClassName="z-[200]"
          hint="Recommended 32 × 32 px."
        />
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
      <FieldRow
        label="Custom CSS"
        hint="Injected inside a <style> tag on this page only. Do not wrap in <style> tags."
      >
        <textarea
          rows={12}
          value={form.customCss}
          placeholder={
            "/* Page-specific styles */\nbody { font-family: 'Inter'; }"
          }
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
  { id: "social", label: "Social Share", icon: Megaphone },
  { id: "favicon", label: "Favicon", icon: ImageIcon },
  { id: "scripts", label: "Scripts", icon: Code2 },
  { id: "styles", label: "Styles", icon: Paintbrush },
];

/**
 * Horizontally-scrollable tab strip. Arrows appear only when the tabs overflow
 * the available width; each arrow is disabled once that end is reached.
 */
function ScrollableTabStrip({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (id: Tab) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setOverflowing(maxScroll > 1);
      setCanLeft(el.scrollLeft > 1);
      setCanRight(el.scrollLeft < maxScroll - 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scrollByDir = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({
      left: dir * scrollRef.current.clientWidth * 0.6,
      behavior: "smooth",
    });
  };

  const arrowCls =
    "shrink-0 flex items-center justify-center w-8 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none";

  return (
    <div className="shrink-0 flex items-stretch border-b border-border">
      {overflowing && (
        <button
          type="button"
          aria-label="Scroll tabs left"
          disabled={!canLeft}
          onClick={() => scrollByDir(-1)}
          className={cn(arrowCls, "border-r border-border")}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto overflow-y-hidden no-scrollbar"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px outline-none focus:outline-none focus-visible:outline-none",
              active === id
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground",
            )}
          >
            <Icon className="w-3 h-3 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {overflowing && (
        <button
          type="button"
          aria-label="Scroll tabs right"
          disabled={!canRight}
          onClick={() => scrollByDir(1)}
          className={cn(arrowCls, "border-l border-border")}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

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
          noIndex: page.noIndex ?? false,
          ogTitle: page.ogTitle ?? "",
          ogDescription: page.ogDescription ?? "",
          ogType: page.ogType ?? "website",
          ogUrl: page.ogUrl ?? "",
          ogImage: page.ogImage ?? null,
          twitterTitle: page.twitterTitle ?? "",
          twitterDescription: page.twitterDescription ?? "",
          twitterImage: page.twitterImage ?? null,
          twitterCardSize: (page.twitterCardSize as "large" | "small") ?? "large",
          faviconUrl: page.faviconUrl ?? null,
          headScript: page.headScript ?? "",
          bodyScript: page.bodyScript ?? "",
          customCss: page.customCss ?? "",
        }));
      })
      .catch(() => {
        /* leave defaults */
      })
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
      const dto: CmsPageSettingsDto = {
        title: form.title,
        metaDesc: form.metaDesc,
        metaKeywords: form.metaKeywords,
        noIndex: form.noIndex,
        ogTitle: form.ogTitle,
        ogDescription: form.ogDescription,
        ogType: form.ogType,
        ogUrl: form.ogUrl,
        ogImage: form.ogImage,
        twitterTitle: form.twitterTitle,
        twitterDescription: form.twitterDescription,
        twitterImage: form.twitterImage,
        twitterCardSize: form.twitterCardSize,
        faviconUrl: form.faviconUrl,
        headScript: form.headScript,
        bodyScript: form.bodyScript,
        customCss: form.customCss,
      };
      await cmsPages.saveSettings(pageSlug, dto);
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
                  <h2 className="text-sm font-bold text-foreground">
                    Page Settings
                  </h2>
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
            <ScrollableTabStrip active={tab} onChange={setTab} />

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
                  {tab === "social" && (
                    <SocialShareTab
                      form={form}
                      slug={pageSlug}
                      onChange={patch}
                    />
                  )}
                  {tab === "favicon" && (
                    <FaviconTab form={form} onChange={patch} />
                  )}
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
                disabled={saveStatus === "saving" || !pageSlug}
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
                      : "Save Page Settings"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
