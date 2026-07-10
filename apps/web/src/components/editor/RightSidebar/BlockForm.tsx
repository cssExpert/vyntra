"use client";

// Schema-driven form rendered by BlockDataEditor when a typed-block is selected.
// Sections + fields are defined in BLOCK_SCHEMAS[blockType].

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Database,
  ImageIcon,
  Link2,
  Code2,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { storeCategories, type ApiProductCategory, cmsBlogCategories, type CmsBlogCategory } from "@/lib/api";
import { BLOCK_SCHEMAS } from "@/lib/themes/blockFieldSchemas";
import type {
  ScalarFieldDef,
  ArrayFieldDef,
  DbSourceDef,
  AnyFieldDef,
} from "@/lib/themes/blockFieldSchemas";
import { useAuth } from "@/providers/AuthProvider";
import { LibraryModal } from "@/modules/cms/blog-editor/CoverImagePicker";

export const fieldCls = [
  "w-full rounded-lg px-3 py-2 text-xs transition-colors",
  "bg-muted/60 dark:bg-muted/40",
  "border border-border dark:border-border",
  "text-foreground dark:text-foreground",
  "placeholder:text-muted-foreground/40",
  "focus:outline-none focus:border-primary dark:focus:border-primary focus:bg-background",
].join(" ");

// ── Section ───────────────────────────────────────────────────────────────────

export function Section({
  title,
  defaultOpen = true,
  badge,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border dark:border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 group"
      >
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
          {badge !== undefined && (
            <span className="text-[9px] min-w-[18px] h-[18px] px-1 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-semibold">
              {badge}
            </span>
          )}
        </span>
        {open ? (
          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && <div className="px-4 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

// ── Label ─────────────────────────────────────────────────────────────────────

function Label({
  text,
  icon: Icon,
}: {
  text: string;
  icon?: React.ElementType;
}) {
  return (
    <label className="flex items-center gap-1.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {Icon && <Icon className="w-3 h-3 opacity-60 shrink-0" />}
      {text}
    </label>
  );
}

// ── Image field with Library picker ──────────────────────────────────────────

function ImageField({
  def,
  value,
  onChange,
  companyId,
}: {
  def: ScalarFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  companyId: string | undefined;
}) {
  const str = String(value ?? "");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 [&>label]:mb-0">
        <Label text={def.label} icon={ImageIcon} />
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
        >
          <ImageIcon className="w-3 h-3" />
          Library
        </button>
      </div>
      <button
        type="button"
        onClick={() => setLibraryOpen(true)}
        className="w-full aspect-video rounded-lg border border-border bg-muted/40 hover:bg-muted/70 transition-colors overflow-hidden flex items-center justify-center"
      >
        {str ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={str} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Choose from Library</span>
          </div>
        )}
      </button>
      <div className="mt-2">
        <p className="text-[9px] text-muted-foreground mb-1">Or paste a URL:</p>
        <input
          type="url"
          value={str}
          placeholder="https://…"
          onChange={(e) => onChange(e.target.value)}
          className={fieldCls}
        />
      </div>
      {mounted &&
        libraryOpen &&
        createPortal(
          <LibraryModal
            currentValue={str}
            uploadCompanyId={companyId ?? "superadmin"}
            currentSubtype="pages"
            onSelect={(url) => {
              onChange(url);
              setLibraryOpen(false);
            }}
            onClose={() => setLibraryOpen(false)}
          />,
          document.body,
        )}
    </div>
  );
}

// ── Product source field (category / type / limit) ─────────────────────────────

const PRODUCT_TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "simple", label: "Simple" },
  { value: "variable", label: "Variable" },
  { value: "digital", label: "Digital" },
  { value: "downloadable", label: "Downloadable" },
  { value: "service", label: "Service" },
  { value: "subscription", label: "Subscription" },
  { value: "bundle", label: "Bundle" },
  { value: "gift_card", label: "Gift Card" },
];

interface ProductSource {
  categoryId?: string;
  productType?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  limit?: number;
}

const SORT_OPTIONS: { value: NonNullable<ProductSource["sort"]>; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function ProductSourceField({
  def,
  value,
  onChange,
}: {
  def: Extract<ScalarFieldDef, { type: "product-source" }>;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const source = (value ?? {}) as ProductSource;
  const [categories, setCategories] = useState<ApiProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    storeCategories
      .list({ take: 200 })
      .then((res) => { if (!cancelled) setCategories(res.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function set(patch: Partial<ProductSource>) {
    onChange({ ...source, ...patch });
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground">{def.label}</span>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wide">
          live
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Latest products first. Combine category and type to narrow the results — leave either on
        &ldquo;All&rdquo; to skip that filter.
      </p>

      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
          Category
        </span>
        <select
          value={source.categoryId ?? ""}
          onChange={(e) => set({ categoryId: e.target.value || undefined })}
          disabled={loading}
          className={fieldCls}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
          Product Type
        </span>
        <select
          value={source.productType ?? ""}
          onChange={(e) => set({ productType: e.target.value || undefined })}
          className={fieldCls}
        >
          {PRODUCT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
          Sort By
        </span>
        <select
          value={source.sort ?? "newest"}
          onChange={(e) => set({ sort: e.target.value as ProductSource["sort"] })}
          className={fieldCls}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
          Limit
        </span>
        <input
          type="number"
          value={source.limit ?? def.defaultLimit ?? 8}
          min={1}
          max={50}
          onChange={(e) => set({ limit: Number(e.target.value) })}
          className={cn(fieldCls, "w-16 text-center")}
        />
        <span className="text-[10px] text-muted-foreground">items</span>
      </div>
    </div>
  );
}

// ── Blog source field (category / sort / limit) ─────────────────────────────────

interface BlogSource {
  category?: string;
  sort?: "newest" | "oldest";
  limit?: number;
}

const BLOG_SORT_OPTIONS: { value: NonNullable<BlogSource["sort"]>; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

function BlogSourceField({
  def,
  value,
  onChange,
}: {
  def: Extract<ScalarFieldDef, { type: "blog-source" }>;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const source = (value ?? {}) as BlogSource;
  const [categories, setCategories] = useState<CmsBlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    cmsBlogCategories
      .list()
      .then((cats) => { if (!cancelled) setCategories(cats); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function set(patch: Partial<BlogSource>) {
    onChange({ ...source, ...patch });
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground">{def.label}</span>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wide">
          live
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Posts are fetched live from your blog. Leave category on &ldquo;All&rdquo; to skip that
        filter.
      </p>

      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
          Category
        </span>
        <select
          value={source.category ?? ""}
          onChange={(e) => set({ category: e.target.value || undefined })}
          disabled={loading}
          className={fieldCls}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
          Sort By
        </span>
        <select
          value={source.sort ?? "newest"}
          onChange={(e) => set({ sort: e.target.value as BlogSource["sort"] })}
          className={fieldCls}
        >
          {BLOG_SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
          Limit
        </span>
        <input
          type="number"
          value={source.limit ?? def.defaultLimit ?? 12}
          min={1}
          max={50}
          onChange={(e) => set({ limit: Number(e.target.value) })}
          className={cn(fieldCls, "w-16 text-center")}
        />
        <span className="text-[10px] text-muted-foreground">posts</span>
      </div>
    </div>
  );
}

// ── Scalar field ──────────────────────────────────────────────────────────────

export function ScalarField({
  def,
  value,
  onChange,
}: {
  def: ScalarFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const str = String(value ?? "");
  const { user } = useAuth();
  const companyId = user?.organizationId ?? undefined;

  if (def.type === "image") {
    return (
      <ImageField
        def={def}
        value={value}
        onChange={onChange}
        companyId={companyId}
      />
    );
  }

  if (def.type === "product-source") {
    return <ProductSourceField def={def} value={value} onChange={onChange} />;
  }

  if (def.type === "blog-source") {
    return <BlogSourceField def={def} value={value} onChange={onChange} />;
  }

  if (def.type === "url") {
    return (
      <div>
        <Label text={def.label} icon={Link2} />
        <input
          type="url"
          value={str}
          placeholder={def.placeholder ?? "/"}
          onChange={(e) => onChange(e.target.value)}
          className={fieldCls}
        />
      </div>
    );
  }

  if (def.type === "html") {
    return (
      <div>
        <Label text={def.label} icon={Code2} />
        <textarea
          value={str}
          rows={def.rows ?? 10}
          placeholder="<!-- HTML here -->"
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className={cn(
            fieldCls,
            "font-mono text-[11px] leading-5 resize-y min-h-[100px]",
          )}
        />
      </div>
    );
  }

  if (def.type === "textarea") {
    return (
      <div>
        <Label text={def.label} />
        <textarea
          value={str}
          rows={def.rows ?? 3}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(fieldCls, "resize-y min-h-[60px]")}
        />
      </div>
    );
  }

  if (def.type === "select") {
    return (
      <div>
        <Label text={def.label} />
        <select
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className={fieldCls}
        >
          {def.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (def.type === "toggle") {
    const isOn = Boolean(value);
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {def.label}
            </span>
            {def.description && (
              <p className="text-[9px] text-muted-foreground/60 mt-0.5 leading-relaxed">
                {def.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange(!isOn)}
            className={cn(
              "shrink-0 w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none",
              isOn ? "bg-primary" : "bg-muted-foreground/25",
            )}
          >
            <span
              className={cn(
                "block w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                isOn ? "translate-x-4" : "translate-x-0",
              )}
            />
          </button>
        </div>
      </div>
    );
  }

  if (def.type === "number") {
    return (
      <div>
        <Label text={def.label} />
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={str}
            min={def.min}
            max={def.max}
            onChange={(e) => onChange(Number(e.target.value))}
            className={cn(fieldCls, "w-24")}
          />
          {def.suffix && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {def.suffix}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (def.type === "string-list") {
    const items = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div>
        <Label text={def.label} icon={List} />
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                value={item}
                placeholder={def.placeholder}
                onChange={(e) => {
                  const next = items.map((v, i) =>
                    i === idx ? e.target.value : v,
                  );
                  onChange(next);
                }}
                className={cn(fieldCls, "flex-1")}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange([...items, ""])}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-border dark:border-border text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
          >
            <Plus className="stroke-[3] w-3.5 h-3.5" />
            {def.addLabel ?? "Add Item"}
          </button>
        </div>
      </div>
    );
  }

  // text (default)
  return (
    <div>
      <Label text={def.label} />
      <input
        type="text"
        value={str}
        placeholder={def.placeholder ?? def.label}
        onChange={(e) => onChange(e.target.value)}
        className={fieldCls}
      />
    </div>
  );
}

// ── Array field ───────────────────────────────────────────────────────────────

export function ArrayField({
  def,
  value,
  onChange,
}: {
  def: ArrayFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const items = Array.isArray(value)
    ? (value as Record<string, unknown>[])
    : [];
  const [openIdx, setOpenIdx] = useState<number | null>(
    items.length > 0 ? 0 : null,
  );
  const itemLabel = def.itemLabel ?? "Item";

  function update(idx: number, key: string, val: unknown) {
    onChange(
      items.map((item, i) => (i === idx ? { ...item, [key]: val } : item)),
    );
  }

  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
    setOpenIdx(
      openIdx === idx
        ? null
        : openIdx !== null && openIdx > idx
          ? openIdx - 1
          : openIdx,
    );
  }

  function add() {
    const next = [...items, { ...def.defaultItem }];
    onChange(next);
    setOpenIdx(next.length - 1);
  }

  return (
    <div className="space-y-1.5">
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        const firstText = def.fields.find(
          (f) => f.type === "text" || f.type === "textarea",
        );
        const preview =
          firstText && item[firstText.key]
            ? String(item[firstText.key])
            : `${itemLabel} ${idx + 1}`;

        return (
          <div
            key={idx}
            className={cn(
              "rounded-xl border overflow-hidden",
              isOpen
                ? "border-primary/40 shadow-sm"
                : "border-border dark:border-border",
            )}
          >
            <div
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 cursor-pointer select-none transition-colors",
                isOpen
                  ? "bg-primary/5"
                  : "bg-card hover:bg-muted/40 dark:hover:bg-muted/20",
              )}
            >
              {isOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-primary shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              )}
              <span
                className={cn(
                  "text-xs font-medium flex-1 truncate",
                  isOpen ? "text-primary" : "text-foreground",
                )}
              >
                {preview}
              </span>
              <span className="text-[9px] text-muted-foreground bg-muted dark:bg-muted/50 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                {idx + 1}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(idx);
                }}
                className="p-1 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {isOpen && (
              <div className="px-3.5 pt-3 pb-4 space-y-3 border-t border-border dark:border-border bg-muted/20 dark:bg-muted/10">
                {def.fields.map((fieldDef) => (
                  <ScalarField
                    key={fieldDef.key}
                    def={fieldDef}
                    value={item[fieldDef.key]}
                    onChange={(v) => update(idx, fieldDef.key, v)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border dark:border-border text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
      >
        <Plus className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 w-3.5 h-3.5" />
        {def.addLabel ?? `Add ${itemLabel}`}
      </button>
    </div>
  );
}

// ── DB source field ───────────────────────────────────────────────────────────

export function DbSourceField({
  def,
  data,
  setField,
}: {
  def: DbSourceDef;
  data: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  const limit =
    typeof data[def.limitKey] === "number"
      ? (data[def.limitKey] as number)
      : (def.defaultLimit ?? 6);

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground">
            {def.label}
          </span>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wide">
          live
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {def.description}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
          Limit
        </span>
        <input
          type="number"
          value={limit}
          min={1}
          max={100}
          onChange={(e) => setField(def.limitKey, Number(e.target.value))}
          className={cn(fieldCls, "w-16 text-center")}
        />
        <span className="text-[10px] text-muted-foreground">items</span>
      </div>
    </div>
  );
}

// ── Render any field def ──────────────────────────────────────────────────────

function RenderField({
  def,
  data,
  setField,
}: {
  def: AnyFieldDef;
  data: Record<string, unknown>;
  setField: (k: string, v: unknown) => void;
}) {
  if (def.type === "array") {
    return (
      <ArrayField
        def={def}
        value={data[def.key]}
        onChange={(v) => setField(def.key, v)}
      />
    );
  }
  if (def.type === "db-source") {
    return <DbSourceField def={def} data={data} setField={setField} />;
  }
  return (
    <ScalarField
      def={def}
      value={data[def.key]}
      onChange={(v) => setField(def.key, v)}
    />
  );
}

// ── Main exported form ────────────────────────────────────────────────────────

export function BlockForm({
  blockType,
  data,
  onSetField,
}: {
  blockType: string;
  data: Record<string, unknown>;
  onSetField: (key: string, value: unknown) => void;
}) {
  const schema = BLOCK_SCHEMAS[blockType];

  if (!schema) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
        <p className="text-xs text-muted-foreground italic">
          No editable fields for this block.
        </p>
      </div>
    );
  }

  return (
    <>
      {schema.map((section) => {
        const arrField = section.fields.find((f) => f.type === "array") as
          | ArrayFieldDef
          | undefined;
        const badge =
          arrField && Array.isArray(data[arrField.key])
            ? (data[arrField.key] as unknown[]).length
            : undefined;

        return (
          <Section
            key={section.title}
            title={section.title}
            defaultOpen={section.defaultOpen ?? true}
            badge={badge}
          >
            {section.fields.map((def, i) => (
              <RenderField
                key={i}
                def={def}
                data={data}
                setField={onSetField}
              />
            ))}
          </Section>
        );
      })}
    </>
  );
}
