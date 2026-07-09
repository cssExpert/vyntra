"use client";

import { useEffect, useRef, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Megaphone,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { systemPageSettings, type SystemPageSettingsData } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TruncatedText } from "@/components/ui/truncated-text";
import { StoreImagePicker } from "@/modules/store/products/components/StoreImagePicker";

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab =
  | "seo"
  | "listing"
  | "og"
  | "social"
  | "favicon"
  | "scripts"
  | "styles";
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
  pagePath,
  onChange,
}: {
  form: SystemPageSettingsData;
  pagePath: string;
  onChange: (patch: Partial<SystemPageSettingsData>) => void;
}) {
  const metaTitle = form.metaTitle ?? "";
  const metaDesc = form.metaDesc ?? "";
  const previewTitle =
    metaTitle ||
    "ERVFlow is a modern all-in-one business operating platform — CRM, CMS, SEO, Payments, Store, Email, and more.";
  return (
    <div className="flex flex-col gap-5">
      <FieldRow
        label="SEO Title"
        counter={{ current: metaTitle.length, max: 60 }}
      >
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
        <div className="mt-2">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            Preview on Google
            <Lightbulb className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <div className="rounded-lg border border-border bg-white dark:bg-background px-4 py-3">
            <TruncatedText className="text-lg font-bold leading-snug text-[#1a0dab] dark:text-blue-400">
              {previewTitle}
            </TruncatedText>
            <p className="mt-0.5 truncate text-[13px] text-[#006621] dark:text-emerald-500">
              https://yoursite.com{pagePath}
            </p>
            <p className="mt-1 line-clamp-2 text-[13px] text-[#4d5156] dark:text-muted-foreground">
              {metaDesc || "Meta description will appear here..."}
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

/**
 * "Listing" tab — reads/writes into the generic `customSettings` JSON blob so
 * more listing-page settings can be added here later without a schema
 * change. Content branches on `pageType`; other system pages (e.g.
 * product-details) would get their own branch writing their own keys into
 * the same field.
 */
function ListingTab({
  form,
  pageType,
  onChange,
}: {
  form: SystemPageSettingsData;
  pageType: string;
  onChange: (patch: Partial<SystemPageSettingsData>) => void;
}) {
  const custom = form.customSettings ?? {};

  function patchCustom(patch: Record<string, unknown>) {
    onChange({ customSettings: { ...custom, ...patch } });
  }

  if (pageType === "blog-listing") {
    const postsPerPage =
      typeof custom.postsPerPage === "number" ? custom.postsPerPage : 6;
    const showSidebar = custom.showSidebar !== false;
    const showSearch = custom.showSearch !== false;
    const showCategories = custom.showCategories !== false;
    const showTags = custom.showTags !== false;

    return (
      <div className="flex flex-col gap-5">
        <FieldRow
          label="Posts per page"
          hint="Number of blog posts shown per page on the storefront listing (1–100)."
        >
          <input
            type="number"
            min={1}
            max={100}
            value={postsPerPage}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!Number.isNaN(n))
                patchCustom({ postsPerPage: Math.min(100, Math.max(1, n)) });
            }}
            className={inputCls}
          />
        </FieldRow>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3">
          <Switch
            id="showSidebar"
            checked={showSidebar}
            onCheckedChange={(v) => patchCustom({ showSidebar: v })}
            className="data-checked:bg-primary shrink-0"
          />
          <div className="min-w-0">
            <Label
              htmlFor="showSidebar"
              className="text-xs font-semibold cursor-pointer block"
            >
              Show sidebar
            </Label>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Search, categories, recent posts, and tags next to the post list.
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col gap-2.5 pl-4 border-l-2 border-border ml-1 transition-opacity",
            !showSidebar && "opacity-40 pointer-events-none",
          )}
        >
          {[
            { id: "showSearch", label: "Show search bar", checked: showSearch },
            {
              id: "showCategories",
              label: "Show categories",
              checked: showCategories,
            },
            { id: "showTags", label: "Show tags", checked: showTags },
          ].map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/60 px-3.5 py-2.5"
            >
              <Switch
                id={row.id}
                checked={row.checked}
                disabled={!showSidebar}
                onCheckedChange={(v) => patchCustom({ [row.id]: v })}
                className="data-checked:bg-primary shrink-0"
              />
              <Label
                htmlFor={row.id}
                className="text-xs font-semibold cursor-pointer"
              >
                {row.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const productsPerPage =
    typeof custom.productsPerPage === "number" ? custom.productsPerPage : 12;

  return (
    <div className="flex flex-col gap-5">
      <FieldRow
        label="Products per page"
        hint="Number of products shown per page on the storefront listing (1–100)."
      >
        <input
          type="number"
          min={1}
          max={100}
          value={productsPerPage}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (!Number.isNaN(n))
              patchCustom({ productsPerPage: Math.min(100, Math.max(1, n)) });
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

      <FieldRow
        label="OG Description"
        counter={{ current: ogDescription.length, max: 200 }}
      >
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
            <option key={t} value={t}>
              {t}
            </option>
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

/**
 * "Social Share" tab — a friendlier editor for the Open Graph tags that social
 * networks (Facebook, Pinterest, LinkedIn…) read. Shares the same underlying
 * `ogTitle` / `ogDescription` / `ogImage` fields as the Open Graph tab, plus
 * X/Twitter overrides persisted in the `customSettings` blob.
 */
function SocialShareTab({
  form,
  companyId,
  module,
  pagePath,
  onChange,
}: {
  form: SystemPageSettingsData;
  companyId: string;
  module: string;
  pagePath: string;
  onChange: (patch: Partial<SystemPageSettingsData>) => void;
}) {
  const custom = form.customSettings ?? {};
  const twitterTitle =
    typeof custom.twitterTitle === "string" ? custom.twitterTitle : "";
  const twitterDescription =
    typeof custom.twitterDescription === "string"
      ? custom.twitterDescription
      : "";
  const twitterImage =
    typeof custom.twitterImage === "string" ? custom.twitterImage : null;
  const twitterCardSize =
    custom.twitterCardSize === "small" ? "small" : "large";
  const [xOpen, setXOpen] = useState(false);

  const ogTitle = form.ogTitle ?? "";
  const ogDescription = form.ogDescription ?? "";
  const host = `www.yoursite.com${pagePath}`;

  function patchCustom(patch: Record<string, unknown>) {
    onChange({ customSettings: { ...custom, ...patch } });
  }

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
          {/* Image */}
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

          {/* Card footer */}
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
            value={form.ogImage ?? null}
            onChange={(url) => onChange({ ogImage: url })}
            companyId={companyId}
            module={module}
            subtype="seo"
            filterOptions={PAGE_SETTINGS_FILTERS}
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
          className="flex w-full items-center gap-1.5 text-sm font-semibold text-foreground"
          aria-expanded={xOpen}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              xOpen && "rotate-90",
            )}
          />
          <XLogo className="h-3.5 w-3.5" />
          Settings
        </button>

        {xOpen && (
          <div className="mt-3 flex flex-col gap-5">
            {/* Preview on X */}
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                Preview on{" "}
                <XLogo className="inline-flex h-3 w-3 -top-[0.5px] relative" />{" "}
                <span className="cursor-pointer text-blue-500 hover:underline">
                  When will changes show live?
                </span>
              </p>

              {(() => {
                const img = twitterImage ?? form.ogImage ?? null;
                const title = twitterTitle || ogTitle || "Title shown on X";
                const desc =
                  twitterDescription ||
                  ogDescription ||
                  "Description shown on X…";
                const domain = host.split("/")[0];

                if (twitterCardSize === "small") {
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
                  value={twitterImage}
                  onChange={(url) => patchCustom({ twitterImage: url })}
                  companyId={companyId}
                  module={module}
                  subtype="seo"
                  filterOptions={PAGE_SETTINGS_FILTERS}
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
                  const selected = twitterCardSize === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        patchCustom({ twitterCardSize: opt.value })
                      }
                      className="flex items-center gap-2.5 text-sm text-foreground"
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
                value={twitterTitle}
                placeholder="Title on X"
                onChange={(e) => patchCustom({ twitterTitle: e.target.value })}
                className={inputCls}
              />
            </FieldRow>

            {/* x:description */}
            <FieldRow label="x:description (description on X)">
              <textarea
                rows={4}
                value={twitterDescription}
                placeholder="Description on X"
                onChange={(e) =>
                  patchCustom({ twitterDescription: e.target.value })
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
      <FieldRow
        label="Page Favicon"
        hint="ICO, PNG, or SVG · recommended 32×32 px."
      >
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
      <FieldRow
        label="Head scripts"
        hint="Injected inside <head>. Do not wrap in <script> tags."
      >
        <textarea
          rows={6}
          value={form.headScript ?? ""}
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
      <FieldRow
        label="Custom CSS"
        hint="Injected inside a <style> tag on this page only. Do not wrap in <style> tags."
      >
        <textarea
          rows={12}
          value={form.customCss ?? ""}
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

const BASE_TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "seo", label: "SEO", icon: Search },
  { id: "og", label: "Open Graph", icon: Share2 },
  { id: "social", label: "Social Share", icon: Megaphone },
  { id: "favicon", label: "Favicon", icon: ImageIcon },
  { id: "scripts", label: "Scripts", icon: Code2 },
  { id: "styles", label: "Styles", icon: Paintbrush },
];

const LISTING_TAB = {
  id: "listing" as const,
  label: "Listing",
  icon: LayoutGrid,
};

/**
 * Horizontally-scrollable tab strip. Arrows appear only when the tabs overflow
 * the available width; each arrow is disabled once that end is reached.
 */
function ScrollableTabStrip({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: Tab; label: string; icon: React.ElementType }[];
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
  }, [tabs.length]);

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
        {tabs.map(({ id, label: tabLabel, icon: Icon }) => (
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
            {tabLabel}
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
export function PageSettingsPanel({
  open,
  onClose,
  pageType,
  label,
  pagePath,
  companyId,
  module = "cms",
}: PageSettingsPanelProps) {
  const hasListingTab =
    pageType === "product-listing" || pageType === "blog-listing";
  const tabs = hasListingTab
    ? [BASE_TABS[0], LISTING_TAB, ...BASE_TABS.slice(1)]
    : BASE_TABS;
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
      .catch(() => {
        /* leave defaults */
      })
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
                  <h2 className="text-sm font-bold text-foreground">
                    Page Settings
                  </h2>
                  <p className="text-[10px] text-muted-foreground/60 font-mono">
                    {label} · {pagePath}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ScrollableTabStrip tabs={tabs} active={tab} onChange={setTab} />

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              ) : (
                <div className="p-5">
                  {tab === "seo" && (
                    <SeoTab form={form} pagePath={pagePath} onChange={patch} />
                  )}
                  {tab === "listing" && (
                    <ListingTab
                      form={form}
                      pageType={pageType}
                      onChange={patch}
                    />
                  )}
                  {tab === "og" && (
                    <OgTab
                      form={form}
                      companyId={companyId}
                      module={module}
                      onChange={patch}
                    />
                  )}
                  {tab === "social" && (
                    <SocialShareTab
                      form={form}
                      companyId={companyId}
                      module={module}
                      pagePath={pagePath}
                      onChange={patch}
                    />
                  )}
                  {tab === "favicon" && (
                    <FaviconTab
                      form={form}
                      companyId={companyId}
                      module={module}
                      onChange={patch}
                    />
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
