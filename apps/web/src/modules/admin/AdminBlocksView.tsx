"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Search, X, Boxes, Globe, Layers } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Toaster, useToaster } from "@/components/common/Toaster";
import { cn } from "@/lib/utils";
import { admin, type DbBlock, type DbBlockSaveDto, type DbTheme } from "@/lib/api";
import { BLOCK_META, BLOCK_DEFAULTS } from "@/lib/themes/shopingo/blockDefaults";
import { BlockForm } from "@/components/editor/RightSidebar/BlockForm";
import type { BlockType } from "@/lib/themes/types";
import { AdminGuard, adminInput } from "./AdminGuard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BLOCK_TYPES = Object.keys(BLOCK_META) as BlockType[];

interface BlockAdminForm {
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  blockType: BlockType;
  isGlobal: boolean;
  themeIdentifier: string;
  data: Record<string, unknown>;
}

const emptyForm = (): BlockAdminForm => ({
  name: "",
  description: "",
  thumbnail: "",
  category: "",
  blockType: "hero-carousel",
  isGlobal: true,
  themeIdentifier: "shopingo",
  data: { ...(BLOCK_DEFAULTS["hero-carousel"] as unknown as Record<string, unknown>) },
});

function blockToForm(b: DbBlock): BlockAdminForm {
  return {
    name: b.name,
    description: b.description ?? "",
    thumbnail: b.thumbnail ?? "",
    category: b.category ?? "",
    blockType: b.blockType as BlockType,
    isGlobal: b.isGlobal,
    themeIdentifier: b.themeIdentifier ?? "shopingo",
    data: b.data,
  };
}

// ── Form Modal ────────────────────────────────────────────────────────────────

function BlockFormModal({
  open,
  title,
  form,
  themes,
  onChange,
  onSave,
  onClose,
  busy,
}: {
  open: boolean;
  title: string;
  form: BlockAdminForm;
  themes: DbTheme[];
  onChange: (patch: Partial<BlockAdminForm>) => void;
  onSave: () => void;
  onClose: () => void;
  busy: boolean;
}) {
  const t = useTranslations("admin.blocks");

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
            {busy ? t("saving", { defaultValue: "Saving…" }) : t("saveBlock", { defaultValue: "Save Block" })}
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
              placeholder="e.g. Bold Hero Banner"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Input
              className={adminInput}
              placeholder="e.g. Hero"
              value={form.category}
              onChange={(e) => onChange({ category: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea
            className={cn(adminInput, "resize-none h-16")}
            placeholder="Short description of this preset…"
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Block Type</label>
            <select
              value={form.blockType}
              onChange={(e) => {
                const blockType = e.target.value as BlockType;
                onChange({
                  blockType,
                  data: { ...(BLOCK_DEFAULTS[blockType] as unknown as Record<string, unknown>) },
                });
              }}
              className={cn(adminInput, "cursor-pointer")}
            >
              {BLOCK_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {BLOCK_META[bt].label}
                </option>
              ))}
            </select>
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
        </div>

        {!form.isGlobal && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Theme</label>
            <select
              value={form.themeIdentifier}
              onChange={(e) => onChange({ themeIdentifier: e.target.value })}
              className={cn(adminInput, "cursor-pointer font-mono text-xs")}
            >
              {themes.length === 0 && (
                <option value={form.themeIdentifier}>{form.themeIdentifier || "shopingo"}</option>
              )}
              {themes.map((t) => (
                <option key={t.id} value={t.identifier}>
                  {t.name} ({t.identifier})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Default Data</p>
          <div className="rounded-xl border border-border overflow-hidden">
            <BlockForm
              blockType={form.blockType}
              data={form.data}
              onSetField={(key, value) => onChange({ data: { ...form.data, [key]: value } })}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── Inner ─────────────────────────────────────────────────────────────────────

function Inner() {
  const t = useTranslations("admin.blocks");
  const [blocks, setBlocks] = useState<DbBlock[]>([]);
  const [themes, setThemes] = useState<DbTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DbBlock | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<DbBlock | null>(null);
  const [form, setForm] = useState<BlockAdminForm>(emptyForm());
  const [formBusy, setFormBusy] = useState(false);
  const { toasts, addToast, dismiss } = useToaster();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [b, t] = await Promise.all([admin.listBlocks(), admin.listThemes()]);
      setBlocks(b);
      setThemes(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load blocks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = search.trim()
    ? blocks.filter(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.blockType.toLowerCase().includes(search.toLowerCase()) ||
          (b.category ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : blocks;

  const openCreate = () => {
    setForm({ ...emptyForm(), themeIdentifier: themes[0]?.identifier ?? "shopingo" });
    setEditTarget(null);
    setModalMode("create");
  };
  const openEdit = (b: DbBlock) => {
    setForm(blockToForm(b));
    setEditTarget(b);
    setModalMode("edit");
  };

  const handleSave = async () => {
    setFormBusy(true);
    try {
      const payload: DbBlockSaveDto = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        thumbnail: form.thumbnail.trim() || undefined,
        category: form.category.trim() || undefined,
        blockType: form.blockType,
        data: form.data,
        isGlobal: form.isGlobal,
        themeIdentifier: form.isGlobal ? null : form.themeIdentifier.trim(),
      };
      if (modalMode === "create") {
        const created = await admin.createBlock(payload);
        setBlocks((prev) => [created, ...prev]);
        addToast("Block created.", "success");
      } else if (editTarget) {
        const updated = await admin.updateBlock(editTarget.id, payload);
        setBlocks((prev) => prev.map((b) => (b.id === editTarget.id ? updated : b)));
        addToast("Block updated.", "success");
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
      await admin.deleteBlock(pendingDelete.id);
      setBlocks((prev) => prev.filter((b) => b.id !== pendingDelete.id));
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
        <PageHeader title={t("title", { defaultValue: "Blocks" })} description={t("description", { defaultValue: "Reusable block presets — global or theme-specific — used to compose Templates." })} />
        <Button radius="xl" onClick={openCreate} className="shrink-0 font-semibold">
          <Plus className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 w-4 h-4" />{" "}
          {t("add", { defaultValue: "New Block" })}
        </Button>
      </div>

      <div className="flex items-center gap-6 px-5 py-3 bg-card border border-border rounded-xl text-sm">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">{blocks.length}</span>
          <span className="text-muted-foreground">block presets</span>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute inset-y-0 left-3 my-auto text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by name, type, or category…"
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
          <Boxes className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold text-foreground">No blocks yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a block preset to start composing Templates from it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((block) => (
            <motion.div
              key={block.id}
              layout
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {block.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={block.thumbnail}
                    alt={block.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Boxes className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-background/80 backdrop-blur-md rounded-md text-primary border border-primary/20">
                    {BLOCK_META[block.blockType as BlockType]?.label ?? block.blockType}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md backdrop-blur-md border",
                      block.isGlobal
                        ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/20"
                        : "bg-violet-950/70 text-violet-300 border-violet-500/20",
                    )}
                  >
                    {block.isGlobal ? <Globe className="w-2.5 h-2.5" /> : <Layers className="w-2.5 h-2.5" />}
                    {block.isGlobal ? "Global" : block.themeIdentifier}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground truncate">{block.name}</h3>
                  {block.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {block.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" onClick={() => openEdit(block)} className="text-xs font-semibold">
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPendingDelete(block)}
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
        <BlockFormModal
          open={modalMode !== null}
          title={modalMode === "create" ? "Create Block" : "Edit Block"}
          form={form}
          themes={themes}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSave={handleSave}
          onClose={() => setModalMode(null)}
          busy={formBusy}
        />
      </AnimatePresence>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove this block?"
        description={
          pendingDelete ? (
            <>
              <span className="font-semibold text-foreground">{pendingDelete.name}</span> will be
              removed and dropped from any Templates using it.
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

export function AdminBlocksView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
