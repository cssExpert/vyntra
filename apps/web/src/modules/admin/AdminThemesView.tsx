"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Search, X, Globe, Palette, Code2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Toaster, useToaster } from "@/components/common/Toaster";
import { cn } from "@/lib/utils";
import { admin, type DbTheme } from "@/lib/api";
import { AdminGuard, adminInput } from "./AdminGuard";
import { Input } from "@/components/ui/input";

interface ThemeForm {
  name: string;
  description: string;
  thumbnail: string;
  identifier: string;
}

const emptyForm = (): ThemeForm => ({
  name: "",
  description: "",
  thumbnail: "",
  identifier: "shopingo",
});

function themeToForm(t: DbTheme): ThemeForm {
  return {
    name: t.name,
    description: t.description ?? "",
    thumbnail: t.thumbnail ?? "",
    identifier: t.identifier,
  };
}

// ── Form Modal ────────────────────────────────────────────────────────────────

function ThemeFormModal({
  open,
  title,
  form,
  onChange,
  onSave,
  onClose,
  busy,
}: {
  open: boolean;
  title: string;
  form: ThemeForm;
  onChange: (patch: Partial<ThemeForm>) => void;
  onSave: () => void;
  onClose: () => void;
  busy: boolean;
}) {
  const t = useTranslations("admin.themes");

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-all"
          >
            {t("cancel", { defaultValue: "Cancel" })}
          </button>
          <button
            onClick={onSave}
            disabled={busy || !form.name.trim() || !form.identifier.trim()}
            className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50"
          >
            {busy ? t("saving", { defaultValue: "Saving…" }) : t("saveTheme", { defaultValue: "Save Theme" })}
          </button>
        </>
      }
    >
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              className={adminInput}
              placeholder="e.g. Shopingo"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Identifier <span className="text-destructive">*</span>
            </label>
            <Input
              className={cn(adminInput, "font-mono text-xs")}
              placeholder="e.g. shopingo"
              value={form.identifier}
              onChange={(e) => onChange({ identifier: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
            />
            <p className="text-[10px] text-muted-foreground">
              Must match a key in the ThemeRegistry code (e.g. <code className="font-mono">shopingo</code>)
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea
            className={cn(adminInput, "resize-none h-20")}
            placeholder="Short description of the theme style…"
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
          {form.thumbnail && (
            <div className="relative h-24 w-full mt-1 rounded-xl overflow-hidden border border-border">
              <Image src={form.thumbnail} alt="preview" fill className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── Inner ─────────────────────────────────────────────────────────────────────

function Inner() {
  const t = useTranslations("admin.themes");
  const [themes, setThemes] = useState<DbTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DbTheme | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<DbTheme | null>(null);
  const [form, setForm] = useState<ThemeForm>(emptyForm());
  const [formBusy, setFormBusy] = useState(false);
  const { toasts, addToast, dismiss } = useToaster();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setThemes(await admin.listThemes());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load themes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = search.trim()
    ? themes.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.identifier.toLowerCase().includes(search.toLowerCase()) ||
          (t.description ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : themes;

  const openCreate = () => { setForm(emptyForm()); setEditTarget(null); setModalMode("create"); };
  const openEdit = (t: DbTheme) => { setForm(themeToForm(t)); setEditTarget(t); setModalMode("edit"); };

  const handleSave = async () => {
    setFormBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        thumbnail: form.thumbnail.trim() || undefined,
        identifier: form.identifier.trim(),
      };
      if (modalMode === "create") {
        const created = await admin.createTheme(payload);
        setThemes((prev) => [created, ...prev]);
        addToast("Theme registered.", "success");
      } else if (editTarget) {
        const updated = await admin.updateTheme(editTarget.id, payload);
        setThemes((prev) => prev.map((t) => (t.id === editTarget.id ? updated : t)));
        addToast("Theme updated.", "success");
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
      await admin.deleteTheme(pendingDelete.id);
      setThemes((prev) => prev.filter((t) => t.id !== pendingDelete.id));
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
        <PageHeader title={t("title")} description={t("description")} />
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-600 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> {t("add", { defaultValue: "Register Theme" })}
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 px-5 py-3 bg-card border border-border rounded-xl text-sm">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">{themes.length}</span>
          <span className="text-muted-foreground">registered themes</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute inset-y-0 left-3 my-auto text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search by name or identifier…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="xl"
          className="w-full pl-9 pr-8 bg-background border border-border rounded-xl text-sm"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute inset-y-0 right-2.5 my-auto text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
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
            <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-[16/14]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <Palette className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold text-foreground">No themes registered</p>
          <p className="text-sm text-muted-foreground mt-1">
            Register a theme to make it available to organizations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((theme) => (
            <motion.div
              key={theme.id}
              layout
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {theme.thumbnail ? (
                  <Image
                    src={theme.thumbnail}
                    alt={theme.name}
                    fill
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palette className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-background/80 backdrop-blur-md rounded-md text-primary border border-primary/20">
                    <Code2 className="w-3 h-3" /> {theme.identifier}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground truncate">{theme.name}</h3>
                  {theme.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {theme.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => openEdit(theme)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => setPendingDelete(theme)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-border transition-all ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        <ThemeFormModal
          open={modalMode !== null}
          title={modalMode === "create" ? "Register Global Theme" : "Edit Theme"}
          form={form}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSave={handleSave}
          onClose={() => setModalMode(null)}
          busy={formBusy}
        />
      </AnimatePresence>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove this theme?"
        description={
          pendingDelete ? (
            <>
              <span className="font-semibold text-foreground">{pendingDelete.name}</span>{" "}
              will be removed. Organizations using it will fall back to the default.
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

export function AdminThemesView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
