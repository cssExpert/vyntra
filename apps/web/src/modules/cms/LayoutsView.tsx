"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Monitor,
  Rows,
  CheckCircle2,
  LayoutTemplate,
} from "lucide-react";
import SectionTitle from "@/components/common/SectionTitle";
import { Modal } from "@/components/common/Modal";
import { cmsLayouts, cmsMenus, type CmsLayout, type CmsMenu } from "@/lib/api";
import { MENU_TYPES } from "./MenusView";

const HEADER_VARIANTS = [
  { value: "minimal", label: "Minimal", description: "Logo left · nav right" },
  {
    value: "centered",
    label: "Centered",
    description: "Logo + nav stacked center",
  },
  {
    value: "split",
    label: "Split",
    description: "Logo · nav center · CTA right",
  },
  { value: "dark", label: "Dark", description: "Inverted dark background" },
  {
    value: "shopingo",
    label: "Shopingo",
    description: "Dark utility bar + white main nav",
  },
];

const FOOTER_VARIANTS = [
  {
    value: "columns",
    label: "Columns",
    description: "Multi-column with headings",
  },
  { value: "simple", label: "Simple", description: "Copyright line only" },
  {
    value: "centered",
    label: "Centered",
    description: "Centered logo + flat links",
  },
  { value: "dark", label: "Dark", description: "Dark background columns" },
  {
    value: "shopingo",
    label: "Shopingo",
    description: "Newsletter strip + columns + dark bar",
  },
];

// ── Wireframe SVG previews ────────────────────────────────────────────────────

function PreviewNavMinimal() {
  return (
    <svg viewBox="0 0 220 44" className="w-full" aria-hidden="true">
      <rect width="220" height="44" fill="#f8fafc" />
      <rect
        width="220"
        height="44"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="0.75"
      />
      <rect x="14" y="16" width="38" height="8" rx="2" fill="#3b82f6" />
      <rect x="130" y="18" width="18" height="5" rx="1.5" fill="#cbd5e1" />
      <rect x="154" y="18" width="18" height="5" rx="1.5" fill="#cbd5e1" />
      <rect x="178" y="18" width="18" height="5" rx="1.5" fill="#cbd5e1" />
    </svg>
  );
}

function PreviewNavCentered() {
  return (
    <svg viewBox="0 0 220 56" className="w-full" aria-hidden="true">
      <rect
        width="220"
        height="56"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="0.75"
      />
      <rect x="86" y="8" width="48" height="9" rx="2" fill="#3b82f6" />
      <rect x="36" y="30" width="20" height="5" rx="1.5" fill="#cbd5e1" />
      <rect x="62" y="30" width="20" height="5" rx="1.5" fill="#cbd5e1" />
      <rect x="88" y="30" width="20" height="5" rx="1.5" fill="#cbd5e1" />
      <rect x="114" y="30" width="20" height="5" rx="1.5" fill="#cbd5e1" />
      <rect x="140" y="30" width="20" height="5" rx="1.5" fill="#cbd5e1" />
      <line
        x1="0"
        y1="55.5"
        x2="220"
        y2="55.5"
        stroke="#e2e8f0"
        strokeWidth="0.5"
      />
    </svg>
  );
}

function PreviewNavSplit() {
  return (
    <svg viewBox="0 0 220 44" className="w-full" aria-hidden="true">
      <rect
        width="220"
        height="44"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="0.75"
      />
      <rect x="14" y="16" width="32" height="8" rx="2" fill="#3b82f6" />
      <rect x="72" y="18" width="18" height="5" rx="1.5" fill="#cbd5e1" />
      <rect x="96" y="18" width="18" height="5" rx="1.5" fill="#cbd5e1" />
      <rect x="120" y="18" width="18" height="5" rx="1.5" fill="#cbd5e1" />
      <rect x="161" y="14" width="40" height="14" rx="3" fill="#3b82f6" />
      <rect
        x="166"
        y="17"
        width="30"
        height="7"
        rx="1"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}

function PreviewNavDark() {
  return (
    <svg viewBox="0 0 220 44" className="w-full" aria-hidden="true">
      <rect width="220" height="44" fill="#1e293b" />
      <rect
        x="14"
        y="16"
        width="38"
        height="8"
        rx="2"
        fill="#e2e8f0"
        opacity="0.8"
      />
      <rect x="130" y="18" width="18" height="5" rx="1.5" fill="#475569" />
      <rect x="154" y="18" width="18" height="5" rx="1.5" fill="#475569" />
      <rect x="178" y="18" width="18" height="5" rx="1.5" fill="#475569" />
    </svg>
  );
}

function PreviewFootColumns() {
  return (
    <svg viewBox="0 0 220 88" className="w-full" aria-hidden="true">
      <rect width="220" height="88" fill="#f8fafc" />
      <line
        x1="0"
        y1="0.5"
        x2="220"
        y2="0.5"
        stroke="#e2e8f0"
        strokeWidth="0.75"
      />
      <rect x="14" y="12" width="26" height="5" rx="1.5" fill="#94a3b8" />
      <rect x="14" y="23" width="38" height="4" rx="1" fill="#e2e8f0" />
      <rect x="14" y="31" width="32" height="4" rx="1" fill="#e2e8f0" />
      <rect x="14" y="39" width="36" height="4" rx="1" fill="#e2e8f0" />
      <rect x="84" y="12" width="26" height="5" rx="1.5" fill="#94a3b8" />
      <rect x="84" y="23" width="38" height="4" rx="1" fill="#e2e8f0" />
      <rect x="84" y="31" width="30" height="4" rx="1" fill="#e2e8f0" />
      <rect x="84" y="39" width="34" height="4" rx="1" fill="#e2e8f0" />
      <rect x="154" y="12" width="26" height="5" rx="1.5" fill="#94a3b8" />
      <rect x="154" y="23" width="38" height="4" rx="1" fill="#e2e8f0" />
      <rect x="154" y="31" width="28" height="4" rx="1" fill="#e2e8f0" />
      <rect x="154" y="39" width="36" height="4" rx="1" fill="#e2e8f0" />
      <line
        x1="14"
        y1="57"
        x2="206"
        y2="57"
        stroke="#e2e8f0"
        strokeWidth="0.75"
      />
      <rect x="82" y="67" width="56" height="4" rx="1.5" fill="#cbd5e1" />
    </svg>
  );
}

function PreviewFootSimple() {
  return (
    <svg viewBox="0 0 220 44" className="w-full" aria-hidden="true">
      <rect width="220" height="44" fill="white" />
      <line
        x1="0"
        y1="0.5"
        x2="220"
        y2="0.5"
        stroke="#e2e8f0"
        strokeWidth="0.75"
      />
      <rect x="80" y="18" width="60" height="5" rx="1.5" fill="#cbd5e1" />
    </svg>
  );
}

function PreviewFootCentered() {
  return (
    <svg viewBox="0 0 220 88" className="w-full" aria-hidden="true">
      <rect width="220" height="88" fill="#f8fafc" />
      <line
        x1="0"
        y1="0.5"
        x2="220"
        y2="0.5"
        stroke="#e2e8f0"
        strokeWidth="0.75"
      />
      <rect x="83" y="12" width="54" height="9" rx="2" fill="#3b82f6" />
      <rect x="34" y="33" width="18" height="4" rx="1" fill="#94a3b8" />
      <rect x="58" y="33" width="18" height="4" rx="1" fill="#94a3b8" />
      <rect x="82" y="33" width="18" height="4" rx="1" fill="#94a3b8" />
      <rect x="106" y="33" width="18" height="4" rx="1" fill="#94a3b8" />
      <rect x="130" y="33" width="18" height="4" rx="1" fill="#94a3b8" />
      <rect x="80" y="55" width="60" height="4" rx="1.5" fill="#cbd5e1" />
    </svg>
  );
}

function PreviewFootDark() {
  return (
    <svg viewBox="0 0 220 88" className="w-full" aria-hidden="true">
      <rect width="220" height="88" fill="#1e293b" />
      <rect x="14" y="12" width="26" height="5" rx="1.5" fill="#475569" />
      <rect x="14" y="23" width="38" height="4" rx="1" fill="#334155" />
      <rect x="14" y="31" width="32" height="4" rx="1" fill="#334155" />
      <rect x="14" y="39" width="36" height="4" rx="1" fill="#334155" />
      <rect x="84" y="12" width="26" height="5" rx="1.5" fill="#475569" />
      <rect x="84" y="23" width="38" height="4" rx="1" fill="#334155" />
      <rect x="84" y="31" width="30" height="4" rx="1" fill="#334155" />
      <rect x="84" y="39" width="34" height="4" rx="1" fill="#334155" />
      <rect x="154" y="12" width="26" height="5" rx="1.5" fill="#475569" />
      <rect x="154" y="23" width="38" height="4" rx="1" fill="#334155" />
      <rect x="154" y="31" width="28" height="4" rx="1" fill="#334155" />
      <rect x="154" y="39" width="36" height="4" rx="1" fill="#334155" />
      <line
        x1="14"
        y1="57"
        x2="206"
        y2="57"
        stroke="#334155"
        strokeWidth="0.75"
      />
      <rect x="82" y="67" width="56" height="4" rx="1.5" fill="#334155" />
    </svg>
  );
}

function PreviewNavShopingo() {
  return (
    <svg viewBox="0 0 220 56" className="w-full" aria-hidden="true">
      {/* dark top utility bar */}
      <rect width="220" height="14" fill="#1e293b" />
      <rect x="14" y="5" width="60" height="4" rx="1" fill="#475569" />
      <rect x="152" y="5" width="22" height="4" rx="1" fill="#475569" />
      <rect x="180" y="5" width="22" height="4" rx="1" fill="#475569" />
      {/* white main nav */}
      <rect
        y="14"
        width="220"
        height="42"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="0.75"
      />
      {/* logo */}
      <rect x="14" y="24" width="36" height="9" rx="1" fill="#1e293b" />
      {/* nav links */}
      <rect x="80" y="26" width="16" height="5" rx="1" fill="#cbd5e1" />
      <rect x="102" y="26" width="16" height="5" rx="1" fill="#cbd5e1" />
      <rect x="124" y="26" width="16" height="5" rx="1" fill="#cbd5e1" />
      <rect x="146" y="26" width="16" height="5" rx="1" fill="#cbd5e1" />
      {/* search + cart icons */}
      <circle
        cx="192"
        cy="28.5"
        r="5"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
      <line
        x1="195.5"
        y1="32"
        x2="198"
        y2="34.5"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
      <rect
        x="203"
        y="24"
        width="9"
        height="9"
        rx="1"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PreviewFootShopingo() {
  return (
    <svg viewBox="0 0 220 96" className="w-full" aria-hidden="true">
      {/* newsletter strip - dark */}
      <rect width="220" height="30" fill="#1e293b" />
      <rect
        x="14"
        y="8"
        width="50"
        height="6"
        rx="1.5"
        fill="#e2e8f0"
        opacity="0.7"
      />
      <rect x="96" y="8" width="72" height="14" fill="white" />
      <rect x="168" y="8" width="28" height="14" fill="#ef4444" />
      <rect
        x="171"
        y="11"
        width="22"
        height="7"
        rx="1"
        fill="white"
        opacity="0.85"
      />
      {/* columns section - light */}
      <rect y="30" width="220" height="52" fill="#f8fafc" />
      <line
        x1="0"
        y1="30.5"
        x2="220"
        y2="30.5"
        stroke="#e2e8f0"
        strokeWidth="0.5"
      />
      <rect x="14" y="38" width="26" height="5" rx="1" fill="#334155" />
      <rect x="14" y="48" width="34" height="3.5" rx="1" fill="#e2e8f0" />
      <rect x="14" y="55" width="28" height="3.5" rx="1" fill="#e2e8f0" />
      <rect x="84" y="38" width="26" height="5" rx="1" fill="#334155" />
      <rect x="84" y="48" width="34" height="3.5" rx="1" fill="#e2e8f0" />
      <rect x="84" y="55" width="28" height="3.5" rx="1" fill="#e2e8f0" />
      <rect x="154" y="38" width="26" height="5" rx="1" fill="#334155" />
      <rect x="154" y="48" width="34" height="3.5" rx="1" fill="#e2e8f0" />
      <rect x="154" y="55" width="28" height="3.5" rx="1" fill="#e2e8f0" />
      {/* bottom bar - dark */}
      <rect y="82" width="220" height="14" fill="#1e293b" />
      <rect x="14" y="87" width="60" height="4" rx="1" fill="#475569" />
      <rect x="170" y="87" width="36" height="4" rx="1" fill="#475569" />
    </svg>
  );
}

const HEADER_PREVIEWS: Record<string, () => React.ReactElement> = {
  minimal: PreviewNavMinimal,
  centered: PreviewNavCentered,
  split: PreviewNavSplit,
  dark: PreviewNavDark,
  shopingo: PreviewNavShopingo,
};

const FOOTER_PREVIEWS: Record<string, () => React.ReactElement> = {
  columns: PreviewFootColumns,
  simple: PreviewFootSimple,
  centered: PreviewFootCentered,
  dark: PreviewFootDark,
  shopingo: PreviewFootShopingo,
};

// ── Layout editor form ────────────────────────────────────────────────────────

function MenuSelect({
  value,
  onChange,
  menus,
  placeholder = "None",
  filterType,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  menus: CmsMenu[];
  placeholder?: string;
  filterType?: string;
}) {
  const grouped = filterType
    ? {
        suggested: menus.filter((m) => m.menuType === filterType),
        other: menus.filter((m) => m.menuType !== filterType),
      }
    : { suggested: [], other: menus };

  const typeLabel = (m: CmsMenu) => {
    const t = MENU_TYPES.find((t) => t.value === (m.menuType ?? "navigation"));
    return t ? ` (${t.label})` : "";
  };

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
    >
      <option value="">{placeholder}</option>
      {grouped.suggested.length > 0 && (
        <optgroup label="Suggested">
          {grouped.suggested.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
              {typeLabel(m)}
            </option>
          ))}
        </optgroup>
      )}
      {grouped.other.length > 0 && (
        <optgroup
          label={grouped.suggested.length > 0 ? "Other menus" : "All menus"}
        >
          {grouped.other.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
              {typeLabel(m)}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}

interface FormState {
  name: string;
  isDefault: boolean;
  navMenuId: string | null;
  footerColumns: { title: string; menuId: string }[];
  headerVariant: string;
  footerVariant: string;
}

function LayoutForm({
  initial,
  menus,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormState;
  menus: CmsMenu[];
  onSave: (data: FormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);

  const addColumn = () =>
    setForm((f) => ({
      ...f,
      footerColumns: [...f.footerColumns, { title: "", menuId: "" }],
    }));

  const removeColumn = (i: number) =>
    setForm((f) => ({
      ...f,
      footerColumns: f.footerColumns.filter((_, idx) => idx !== i),
    }));

  const updateColumn = (i: number, field: "title" | "menuId", value: string) =>
    setForm((f) => ({
      ...f,
      footerColumns: f.footerColumns.map((col, idx) =>
        idx === i ? { ...col, [field]: value } : col,
      ),
    }));

  return (
    <div className="p-6 pb-0 space-y-5">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          Layout Name
        </label>
        <input
          required
          autoFocus
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Blog Layout, Marketing Dark"
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
        />
      </div>

      <div className="flex items-center gap-2.5">
        <input
          id="isDefault"
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) =>
            setForm((f) => ({ ...f, isDefault: e.target.checked }))
          }
          className="w-4 h-4 rounded accent-primary cursor-pointer"
        />
        <label
          htmlFor="isDefault"
          className="text-sm text-foreground cursor-pointer"
        >
          Set as default layout (used when no layout is assigned to a page)
        </label>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          <Monitor size={13} className="inline mr-1.5 mb-0.5" />
          Header menu
        </label>
        <MenuSelect
          value={form.navMenuId}
          onChange={(v) => setForm((f) => ({ ...f, navMenuId: v }))}
          menus={menus}
          placeholder="No header menu"
          filterType="navigation"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          <LayoutTemplate size={13} className="inline mr-1.5 mb-0.5" />
          Header design
        </label>
        <div className="grid grid-cols-2 gap-2">
          {HEADER_VARIANTS.map((v) => {
            const Preview = HEADER_PREVIEWS[v.value];
            const active = form.headerVariant === v.value;
            return (
              <button
                key={v.value}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, headerVariant: v.value }))
                }
                className={`text-left rounded-lg border overflow-hidden transition-all ${
                  active
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div
                  className={`border-b transition-colors ${active ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}
                >
                  <Preview />
                </div>
                <div className="px-2.5 py-2">
                  <p
                    className={`text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}
                  >
                    {v.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    {v.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-foreground">
            <Rows size={13} className="inline mr-1.5 mb-0.5" />
            Footer columns
          </label>
          <button
            type="button"
            onClick={addColumn}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus size={12} /> Add column
          </button>
        </div>

        {form.footerColumns.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No footer columns — click &rdquo;Add column&rdquo; to add one.
          </p>
        )}

        {form.footerColumns.map((col, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={col.title}
              onChange={(e) => updateColumn(i, "title", e.target.value)}
              placeholder="Column heading"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-all"
            />
            <select
              value={col.menuId}
              onChange={(e) => updateColumn(i, "menuId", e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-all"
            >
              <option value="">Pick menu…</option>
              {menus.map((m) => {
                const t = MENU_TYPES.find(
                  (t) => t.value === (m.menuType ?? "navigation"),
                );
                return (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {t ? ` (${t.label})` : ""}
                  </option>
                );
              })}
            </select>
            <button
              type="button"
              onClick={() => removeColumn(i)}
              className="text-muted-foreground hover:text-rose-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          <Rows size={13} className="inline mr-1.5 mb-0.5" />
          Footer design
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FOOTER_VARIANTS.map((v) => {
            const Preview = FOOTER_PREVIEWS[v.value];
            const active = form.footerVariant === v.value;
            return (
              <button
                key={v.value}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, footerVariant: v.value }))
                }
                className={`text-left rounded-lg border overflow-hidden transition-all ${
                  active
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div
                  className={`border-b transition-colors ${active ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}
                >
                  <Preview />
                </div>
                <div className="px-2.5 py-2">
                  <p
                    className={`text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}
                  >
                    {v.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    {v.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 md:-mx-6 px-4 md:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving || !form.name.trim()}
          onClick={() => onSave(form)}
          className="px-5 py-2.5 bg-primary hover:bg-primary-600 text-primary-foreground rounded-sm text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Layout"}
        </button>
      </div>
    </div>
  );
}

// ── Layout card ───────────────────────────────────────────────────────────────

function LayoutCard({
  layout,
  menus,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  layout: CmsLayout;
  menus: CmsMenu[];
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const navMenu = menus.find((m) => m.id === layout.navMenuId);

  return (
    <div
      className={`rounded-xl border bg-card overflow-hidden transition-all ${layout.isDefault ? "border-primary/40 shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]" : "border-border"}`}
    >
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-foreground text-base md:text-lg truncate">
              {layout.name}
            </span>
            {layout.isDefault && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                <CheckCircle2 size={9} /> Default
              </span>
            )}
          </div>
          <div className="mt-2 space-y-1 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Monitor size={11} />
              <span>Header: {navMenu ? navMenu.name : <em>none</em>}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LayoutTemplate size={11} />
              <span>
                {HEADER_VARIANTS.find((v) => v.value === layout.headerVariant)
                  ?.label ?? "Minimal"}{" "}
                header
                {" · "}
                {FOOTER_VARIANTS.find((v) => v.value === layout.footerVariant)
                  ?.label ?? "Columns"}{" "}
                footer
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Rows size={11} />
              <span>
                Footer:{" "}
                {layout.footerColumns.length > 0 ? (
                  `${layout.footerColumns.length} column(s)`
                ) : (
                  <em>none</em>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!layout.isDefault && (
            <button
              onClick={onSetDefault}
              title="Set as default"
              className="p-1.5 rounded-md text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all"
            >
              <Star size={14} />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: FormState = {
  name: "",
  isDefault: false,
  navMenuId: null,
  footerColumns: [],
  headerVariant: "minimal",
  footerVariant: "columns",
};

export function LayoutsView() {
  const [layouts, setLayouts] = useState<CmsLayout[]>([]);
  const [menus, setMenus] = useState<CmsMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [active, setActive] = useState<CmsLayout | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [l, m] = await Promise.all([cmsLayouts.list(), cmsMenus.list()]);
    setLayouts(l);
    setMenus(m);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (form: FormState) => {
    setSaving(true);
    try {
      const created = await cmsLayouts.create(form);
      if (form.isDefault) {
        setLayouts((prev) => [
          created,
          ...prev.map((l) => ({ ...l, isDefault: false })),
        ]);
      } else {
        setLayouts((prev) => [...prev, created]);
      }
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form: FormState) => {
    if (!active) return;
    setSaving(true);
    try {
      const updated = await cmsLayouts.update(active.id, form);
      setLayouts((prev) =>
        prev.map((l) =>
          l.id === active.id
            ? updated
            : form.isDefault
              ? { ...l, isDefault: false }
              : l,
        ),
      );
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await cmsLayouts.delete(active.id);
      setLayouts((prev) => prev.filter((l) => l.id !== active.id));
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (layout: CmsLayout) => {
    const updated = await cmsLayouts.update(layout.id, { isDefault: true });
    setLayouts((prev) =>
      prev.map((l) =>
        l.id === layout.id ? updated : { ...l, isDefault: false },
      ),
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-border bg-muted/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const editInitial: FormState = active
    ? {
        name: active.name,
        isDefault: active.isDefault,
        navMenuId: active.navMenuId,
        footerColumns: active.footerColumns,
        headerVariant: active.headerVariant ?? "minimal",
        footerVariant: active.footerVariant ?? "columns",
      }
    : EMPTY_FORM;

  return (
    <div className="font-sans text-foreground pb-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <SectionTitle
          title="Layouts"
          paragraph={`${layouts.length} layout${layouts.length !== 1 ? "s" : ""} — assign one to any page from the page settings.`}
          mb="0"
          className="!w-auto"
        />
        <button
          onClick={() => {
            setActive(null);
            setModal("create");
          }}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer group active:scale-[0.98] shrink-0"
        >
          <Plus
            size={16}
            className="stroke-[3] transition-transform group-hover:rotate-90 duration-300"
          />
          New Layout
        </button>
      </div>

      {layouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-semibold text-foreground mb-1">No layouts yet</p>
          <p className="text-sm text-muted-foreground">
            Create a layout to assign headers and footers to your pages.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {layouts.map((layout) => (
            <LayoutCard
              key={layout.id}
              layout={layout}
              menus={menus}
              onEdit={() => {
                setActive(layout);
                setModal("edit");
              }}
              onDelete={() => {
                setActive(layout);
                setModal("delete");
              }}
              onSetDefault={() => handleSetDefault(layout)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        isOpen={modal === "create" || modal === "edit"}
        onClose={() => setModal(null)}
        title={modal === "edit" ? `Edit "${active?.name}"` : "New Layout"}
        description={
          modal === "edit"
            ? "Update this layout's header and footer configuration."
            : "Define a reusable header + footer design for your pages."
        }
        icon={modal === "edit" ? <Pencil size={18} /> : <Plus size={18} />}
        maxWidth="lg"
      >
        <LayoutForm
          key={modal === "edit" ? active?.id : "create"}
          initial={modal === "edit" ? editInitial : EMPTY_FORM}
          menus={menus}
          onSave={modal === "edit" ? handleEdit : handleCreate}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal
        isOpen={modal === "delete"}
        onClose={() => setModal(null)}
        title="Delete Layout?"
        description={
          <>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">
              &rdquo;{active?.name}&rdquo;
            </strong>
            ? Pages using this layout will lose their layout assignment.
          </>
        }
        maxWidth="md"
        footer={
          <>
            <button
              onClick={() => setModal(null)}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-sm text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? "Deleting…" : "Yes, Delete"}
            </button>
          </>
        }
      />
    </div>
  );
}
