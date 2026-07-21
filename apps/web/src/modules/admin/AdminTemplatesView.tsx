"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Search, X, LayoutTemplate, Globe, Layers, GripVertical } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Toaster, useToaster } from "@/components/common/Toaster";
import { cn } from "@/lib/utils";
import { admin, type DbTemplate, type DbTemplateSaveDto, type DbBlock } from "@/lib/api";
import { BLOCK_META } from "@/lib/themes/shopingo/blockDefaults";
import type { BlockType } from "@/lib/themes/types";
import { AdminGuard, adminInput } from "./AdminGuard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TemplateAdminForm {
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  isGlobal: boolean;
  themeIdentifier: string;
  blockIds: string[];
}

const emptyForm = (): TemplateAdminForm => ({
  name: "",
  description: "",
  thumbnail: "",
  category: "",
  isGlobal: true,
  themeIdentifier: "shopingo",
  blockIds: [],
});

function templateToForm(t: DbTemplate): TemplateAdminForm {
  return {
    name: t.name,
    description: t.description ?? "",
    thumbnail: t.thumbnail ?? "",
    category: t.category ?? "",
    isGlobal: t.isGlobal,
    themeIdentifier: t.themeIdentifier ?? "shopingo",
    blockIds: [...t.blocks].sort((a, b) => a.sortOrder - b.sortOrder).map((tb) => tb.block.id),
  };
}

// ── Block composer (select + drag-reorder) ────────────────────────────────────

function BlockComposer({
  allBlocks,
  blockIds,
  onChange,
}: {
  allBlocks: DbBlock[];
  blockIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const byId = new Map(allBlocks.map((b) => [b.id, b]));
  const selected = blockIds.map((id) => byId.get(id)).filter((b): b is DbBlock => !!b);
  const available = allBlocks.filter((b) => !blockIds.includes(b.id));

  const add = (id: string) => onChange([...blockIds, id]);
  const remove = (id: string) => onChange(blockIds.filter((x) => x !== id));

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const next = [...blockIds];
    const fromIdx = next.indexOf(draggedId);
    const toIdx = next.indexOf(targetId);
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, draggedId);
    onChange(next);
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Composition — drag to reorder</p>
          {selected.map((block) => (
            <div
              key={block.id}
              draggable
              onDragStart={() => setDraggedId(block.id)}
              onDragOver={(e) => {
                e.preventDefault();
                if (block.id !== draggedId) setDragOverId(block.id);
              }}
              onDragEnd={() => {
                setDraggedId(null);
                setDragOverId(null);
              }}
              onDrop={() => handleDrop(block.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-sm transition-all cursor-grab active:cursor-grabbing",
                draggedId === block.id
                  ? "opacity-30 border-border"
                  : dragOverId === block.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/40",
              )}
            >
              <GripVertical size={13} className="text-muted-foreground shrink-0" />
              <span className="font-semibold text-foreground truncate">{block.name}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0">
                {BLOCK_META[block.blockType as BlockType]?.label ?? block.blockType}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(block.id)}
                className="ml-auto h-auto w-auto p-1 text-muted-foreground hover:text-rose-500"
              >
                <X size={13} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {available.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Available blocks</p>
          <div className="flex flex-wrap gap-1.5">
            {available.map((block) => (
              <button
                key={block.id}
                type="button"
                onClick={() => add(block.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
              >
                <Plus size={11} /> {block.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected.length === 0 && available.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No blocks in the catalog yet — create some under Admin → Blocks first.
        </p>
      )}
    </div>
  );
}

// ── Form Modal ────────────────────────────────────────────────────────────────

function TemplateFormModal({
  open,
  title,
  form,
  allBlocks,
  onChange,
  onSave,
  onClose,
  busy,
}: {
  open: boolean;
  title: string;
  form: TemplateAdminForm;
  allBlocks: DbBlock[];
  onChange: (patch: Partial<TemplateAdminForm>) => void;
  onSave: () => void;
  onClose: () => void;
  busy: boolean;
}) {
  const t = useTranslations("admin.templates");

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={title}
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t("cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button onClick={onSave} disabled={busy || !form.name.trim()}>
            {busy ? t("saving", { defaultValue: "Saving…" }) : t("saveTemplate", { defaultValue: "Save Template" })}
          </Button>
        </>
      }
    >
      <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              className={adminInput}
              placeholder="e.g. SaaS Landing"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Input
              className={adminInput}
              placeholder="e.g. Business"
              value={form.category}
              onChange={(e) => onChange({ category: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea
            className={cn(adminInput, "resize-none h-16")}
            placeholder="Short description shown under the template name…"
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Thumbnail URL</label>
          <Input
            className={adminInput}
            placeholder="https://…"
            value={form.thumbnail}
            onChange={(e) => onChange({ thumbnail: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Scope</label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              active={form.isGlobal}
              onClick={() => onChange({ isGlobal: true })}
              className="flex-1 text-xs font-bold"
            >
              <Globe className="w-3.5 h-3.5" /> Global
            </Button>
            <Button
              type="button"
              variant="outline"
              active={!form.isGlobal}
              onClick={() => onChange({ isGlobal: false })}
              className="flex-1 text-xs font-bold"
            >
              <Layers className="w-3.5 h-3.5" /> Theme
            </Button>
          </div>
        </div>

        {!form.isGlobal && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Theme Identifier</label>
            <Input
              className={cn(adminInput, "font-mono text-xs")}
              placeholder="e.g. shopingo"
              value={form.themeIdentifier}
              onChange={(e) =>
                onChange({ themeIdentifier: e.target.value.toLowerCase().replace(/\s+/g, "-") })
              }
            />
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <BlockComposer
            allBlocks={allBlocks}
            blockIds={form.blockIds}
            onChange={(blockIds) => onChange({ blockIds })}
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Inner ─────────────────────────────────────────────────────────────────────

function Inner() {
  const t = useTranslations("admin.templates");
  const [templates, setTemplates] = useState<DbTemplate[]>([]);
  const [allBlocks, setAllBlocks] = useState<DbBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DbTemplate | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<DbTemplate | null>(null);
  const [form, setForm] = useState<TemplateAdminForm>(emptyForm());
  const [formBusy, setFormBusy] = useState(false);
  const { toasts, addToast, dismiss } = useToaster();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [t, b] = await Promise.all([admin.listTemplates(), admin.listBlocks()]);
      setTemplates(t);
      setAllBlocks(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = search.trim()
    ? templates.filter(
        (tpl) =>
          tpl.name.toLowerCase().includes(search.toLowerCase()) ||
          (tpl.category ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : templates;

  const openCreate = () => {
    setForm(emptyForm());
    setEditTarget(null);
    setModalMode("create");
  };
  const openEdit = (tpl: DbTemplate) => {
    setForm(templateToForm(tpl));
    setEditTarget(tpl);
    setModalMode("edit");
  };

  const handleSave = async () => {
    setFormBusy(true);
    try {
      const payload: DbTemplateSaveDto = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        thumbnail: form.thumbnail.trim() || undefined,
        category: form.category.trim() || undefined,
        isGlobal: form.isGlobal,
        themeIdentifier: form.isGlobal ? null : form.themeIdentifier.trim(),
        blockIds: form.blockIds,
      };
      if (modalMode === "create") {
        const created = await admin.createTemplate(payload);
        setTemplates((prev) => [created, ...prev]);
        addToast("Template created.", "success");
      } else if (editTarget) {
        const updated = await admin.updateTemplate(editTarget.id, payload);
        setTemplates((prev) => prev.map((tpl) => (tpl.id === editTarget.id ? updated : tpl)));
        addToast("Template updated.", "success");
      }
      setModalMode(null);
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Save failed.", "error");
    } finally {
      setFormBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await admin.deleteTemplate(pendingDelete.id);
      setTemplates((prev) => prev.filter((tpl) => tpl.id !== pendingDelete.id));
      addToast(`"${pendingDelete.name}" removed.`, "info");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Delete failed.", "error");
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title={t("title", { defaultValue: "Templates" })}
          description={t("description", { defaultValue: "Global and theme-specific page templates, composed from Blocks, offered in the CMS page editor's Pick a Template picker." })}
        />
        <Button radius="xl" onClick={openCreate} className="shrink-0 font-semibold">
          <Plus className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 w-4 h-4" />{" "}
          {t("add", { defaultValue: "New Template" })}
        </Button>
      </div>

      <div className="flex items-center gap-6 px-5 py-3 bg-card border border-border rounded-xl text-sm">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">{templates.length}</span>
          <span className="text-muted-foreground">templates</span>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute inset-y-0 left-3 my-auto text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by name or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="xl"
          className="w-full pl-9 pr-8 bg-background border border-border rounded-xl text-sm"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-2.5 my-auto h-auto w-auto p-0 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-[4/3]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <LayoutTemplate className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold text-foreground">No templates yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Compose a template from your block catalog to offer it in the page editor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((tpl) => (
            <motion.div
              key={tpl.id}
              layout
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {tpl.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <LayoutTemplate className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {tpl.category && (
                    <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-background/80 backdrop-blur-md rounded-md text-primary border border-primary/20">
                      {tpl.category}
                    </span>
                  )}
                  <span
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md backdrop-blur-md border",
                      tpl.isGlobal
                        ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/20"
                        : "bg-violet-950/70 text-violet-300 border-violet-500/20",
                    )}
                  >
                    {tpl.isGlobal ? <Globe className="w-2.5 h-2.5" /> : <Layers className="w-2.5 h-2.5" />}
                    {tpl.isGlobal ? "Global" : tpl.themeIdentifier}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground truncate">{tpl.name}</h3>
                  {tpl.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {tpl.description}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    {tpl.blocks.length} block{tpl.blocks.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" onClick={() => openEdit(tpl)} className="text-xs font-semibold">
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPendingDelete(tpl)}
                    className="p-1.5 h-auto w-auto text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        <TemplateFormModal
          open={modalMode !== null}
          title={modalMode === "create" ? "Create Template" : "Edit Template"}
          form={form}
          allBlocks={allBlocks}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSave={handleSave}
          onClose={() => setModalMode(null)}
          busy={formBusy}
        />
      </AnimatePresence>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove this template?"
        description={
          pendingDelete ? (
            <>
              <span className="font-semibold text-foreground">{pendingDelete.name}</span> will no
              longer be offered in the page editor&apos;s template picker.
            </>
          ) : undefined
        }
        confirmLabel="Yes, Remove"
        cancelLabel="Keep It"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export function AdminTemplatesView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
