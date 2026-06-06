"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Menu,
} from "lucide-react";
import { cmsMenus, type CmsMenu, type CmsMenuItem } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/common/Modal";

// ─── Visibility ────────────────────────────────────────────────────────────────

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All devices" },
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];

function VisibilityBadge({ vis }: { vis: string[] }) {
  const labels =
    !vis.length || vis.includes("all")
      ? ["All devices"]
      : vis.map((v) => VISIBILITY_OPTIONS.find((o) => o.value === v)?.label ?? v);
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((l) => (
        <span
          key={l}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
            bg-primary/10 text-primary"
        >
          {l}
        </span>
      ))}
    </div>
  );
}

function VisibilityMultiSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(opt: string) {
    if (opt === "all") { onChange(["all"]); return; }
    const next = value.filter((v) => v !== "all");
    if (next.includes(opt)) {
      const removed = next.filter((v) => v !== opt);
      onChange(removed.length ? removed : ["all"]);
    } else {
      onChange([...next, opt]);
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {VISIBILITY_OPTIONS.map((opt) => {
        const active =
          opt.value === "all"
            ? !value.length || value.includes("all")
            : value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
              ${active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Item row ─────────────────────────────────────────────────────────────────

interface DraftItem { label: string; url: string; target: string }

function ItemRow({
  item, index, total, onChange, onDelete, onMoveUp, onMoveDown,
}: {
  item: DraftItem; index: number; total: number;
  onChange: (field: keyof DraftItem, value: string) => void;
  onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const iCls = "w-full rounded-md px-2.5 py-1.5 text-xs border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors";
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg border border-border bg-muted/30">
      <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-2 flex-shrink-0" />
      <div className="flex-1 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1">Label</p>
          <input className={iCls} placeholder="e.g. Home" value={item.label} onChange={(e) => onChange("label", e.target.value)} />
        </div>
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1">URL</p>
          <input className={iCls} placeholder="/home or https://..." value={item.url} onChange={(e) => onChange("url", e.target.value)} />
        </div>
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1">Open in</p>
          <select className={iCls} value={item.target} onChange={(e) => onChange("target", e.target.value)}>
            <option value="_self">Same tab</option>
            <option value="_blank">New tab</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button type="button" onClick={onMoveUp} disabled={index === 0}
          className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={onMoveDown} disabled={index === total - 1}
          className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={onDelete}
          className="p-1 rounded text-muted-foreground hover:text-rose-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Create / Edit modal ───────────────────────────────────────────────────────

interface EditState { name: string; slug: string; visibility: string[]; items: DraftItem[] }

function MenuModal({
  open, initial, onClose, onSave, saving,
}: {
  open: boolean; initial: EditState | null;
  onClose: () => void; onSave: (s: EditState) => void; saving: boolean;
}) {
  const isNew = !initial;
  const [form, setForm] = useState<EditState>(
    initial ?? { name: "", slug: "", visibility: ["all"], items: [] },
  );

  useEffect(() => {
    if (open) setForm(initial ?? { name: "", slug: "", visibility: ["all"], items: [] });
  }, [open, initial]);

  function handleName(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    setForm((f) => ({ ...f, name, ...(isNew ? { slug } : {}) }));
  }
  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { label: "", url: "", target: "_self" }] }));
  }
  function updateItem(i: number, field: keyof DraftItem, val: string) {
    setForm((f) => { const items = [...f.items]; items[i] = { ...items[i], [field]: val }; return { ...f, items }; });
  }
  function deleteItem(i: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }
  function moveItem(from: number, to: number) {
    setForm((f) => {
      const items = [...f.items]; const [item] = items.splice(from, 1); items.splice(to, 0, item); return { ...f, items };
    });
  }

  const inputCls = "w-full rounded-lg px-3 py-2 text-sm border border-border bg-background text-foreground focus:outline-none focus:border-primary transition-colors";

  return (
    <Modal isOpen={open} onClose={onClose} title={isNew ? "Create Menu" : "Edit Menu"} maxWidth="lg">
      <div className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Menu Name <span className="text-rose-500">*</span>
            </label>
            <input className={inputCls} placeholder="e.g. Main Navigation" value={form.name} onChange={(e) => handleName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Slug <span className="text-rose-500">*</span>
            </label>
            <input className={inputCls} placeholder="e.g. main-nav" value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-2">Show on</label>
          <VisibilityMultiSelect value={form.visibility} onChange={(v) => setForm((f) => ({ ...f, visibility: v }))} />
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Controls which device sizes this menu is visible on in the live site.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-foreground">Menu Items ({form.items.length})</label>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
          {form.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed border-border text-center">
              <Menu className="w-6 h-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No items yet. Click "Add Item" to start.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
              {form.items.map((item, i) => (
                <ItemRow key={i} item={item} index={i} total={form.items.length}
                  onChange={(f, v) => updateItem(i, f, v)} onDelete={() => deleteItem(i)}
                  onMoveUp={() => moveItem(i, i - 1)} onMoveDown={() => moveItem(i, i + 1)} />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(form)} disabled={saving || !form.name.trim() || !form.slug.trim()}
            className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {saving ? "Saving…" : isNew ? "Create Menu" : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Menu card ─────────────────────────────────────────────────────────────────

function MenuCard({
  menu, onEdit, onDelete,
}: { menu: CmsMenu; onEdit: () => void; onDelete: () => void }) {
  const itemCount = menu._count?.items ?? menu.items?.length ?? 0;
  return (
    <div className="flex items-start justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Menu className="w-4 h-4 text-primary flex-shrink-0" />
          <h3 className="text-sm font-semibold text-foreground truncate">{menu.name}</h3>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono mb-2">{menu.slug}</p>
        <VisibilityBadge vis={menu.visibility} />
        <p className="mt-2 text-[11px] text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>
      <div className="flex items-center gap-1 ml-3 flex-shrink-0">
        <button onClick={onEdit}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onDelete}
          className="p-2 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main view ─────────────────────────────────────────────────────────────────

export function MenusView() {
  const [menus, setMenus] = useState<CmsMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CmsMenu | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsMenu | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try { setMenus(await cmsMenus.list()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadMenus(); }, [loadMenus]);

  function openCreate() { setEditTarget(null); setModalOpen(true); }

  function openEdit(menu: CmsMenu) { setEditTarget(menu); setModalOpen(true); }

  async function handleSave(form: EditState) {
    setSaving(true);
    try {
      let menu: CmsMenu;
      if (editTarget) {
        menu = await cmsMenus.update(editTarget.id, { name: form.name, slug: form.slug, visibility: form.visibility });
        menu = await cmsMenus.setItems(menu.id, form.items);
        setMenus((prev) => prev.map((m) => (m.id === menu.id ? menu : m)));
      } else {
        menu = await cmsMenus.create({ name: form.name, slug: form.slug, visibility: form.visibility });
        if (form.items.length > 0) menu = await cmsMenus.setItems(menu.id, form.items);
        setMenus((prev) => [...prev, menu]);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await cmsMenus.delete(deleteTarget.id);
      setMenus((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  }

  const editInitial: EditState | null = editTarget
    ? { name: editTarget.name, slug: editTarget.slug, visibility: editTarget.visibility,
        items: (editTarget.items ?? []).map((it) => ({ label: it.label, url: it.url, target: it.target })) }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Menus"
        description="Create navigation menus and attach them to blocks in the editor."
      >
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold
            bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Menu
        </button>
      </PageHeader>

      <div className="rounded-2xl border border-border bg-card">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : menus.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <Menu className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No menus yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create a menu and attach it to a nav block in the editor.</p>
            </div>
            <button onClick={openCreate}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold
                bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Create your first menu
            </button>
          </div>
        ) : (
          <div className="p-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {menus.map((menu) => (
              <MenuCard key={menu.id} menu={menu}
                onEdit={() => { cmsMenus.get(menu.id).then((full) => openEdit(full)); }}
                onDelete={() => setDeleteTarget(menu)} />
            ))}
          </div>
        )}
      </div>

      <MenuModal open={modalOpen} initial={editInitial} onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving} />

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Menu" maxWidth="sm"
        iconVariant="danger" icon={<Trash2 className="w-5 h-5" />}>
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
            All menu items will be removed. This cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-4 py-2 text-sm font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-60 transition-colors">
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
