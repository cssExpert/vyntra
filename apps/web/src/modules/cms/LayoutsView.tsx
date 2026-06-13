"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Monitor,
  Rows,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import SectionTitle from "@/components/common/SectionTitle";
import { Modal } from "@/components/common/Modal";
import { cmsLayouts, cmsMenus, type CmsLayout, type CmsMenu } from "@/lib/api";
import { MENU_TYPES } from "./MenusView";
import { Input } from "@/components/ui/input";

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
        <Input
          required
          autoFocus
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Blog Layout, Marketing Dark"
          size="xl"
          className="w-full rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
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
            <Input
              value={col.title}
              onChange={(e) => updateColumn(i, "title", e.target.value)}
              placeholder="Column heading"
              size="lg"
              className="flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-all"
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

      <div className="sticky bottom-0 -mx-4 md:-mx-6 px-4 md:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-all"
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
};

export function LayoutsView() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("cms.layouts.tsx");
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
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer group active:scale-[0.98] shrink-0"
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
            ? "Update this layout's menu and footer column configuration."
            : "Define a reusable navigation and footer structure for your pages."
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
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-all"
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
