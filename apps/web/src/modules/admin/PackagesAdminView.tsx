"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { admin, type AdminModule, type AdminPackage } from "@/lib/api";
import { AdminGuard, adminInput } from "./AdminGuard";
import { Button } from "@/components/ui/button";

interface FormState {
  id: string | null;
  name: string;
  description: string;
  priceDollars: string;
  maxUsers: string;
  isPublic: boolean;
  moduleKeys: Set<string>;
}

const emptyForm: FormState = {
  id: null,
  name: "",
  description: "",
  priceDollars: "0",
  maxUsers: "5",
  isPublic: true,
  moduleKeys: new Set(),
};

function Inner() {
  const t = useTranslations("admin.packages");
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, m] = await Promise.all([
        admin.listPackages(),
        admin.listModules(),
      ]);
      setPackages(p);
      setModules(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("failedLoad", { defaultValue: "Failed to load" }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: AdminPackage) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      priceDollars: String(p.priceCents / 100),
      maxUsers: String(p.maxUsers),
      isPublic: p.isPublic,
      moduleKeys: new Set(p.modules),
    });
    setModalOpen(true);
  };

  const toggleModule = (key: string) => {
    setForm((f) => {
      const next = new Set(f.moduleKeys);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...f, moduleKeys: next };
    });
  };

  const save = async () => {
    setBusy(true);
    setError("");
    const body = {
      name: form.name,
      description: form.description || undefined,
      priceCents: Math.round(parseFloat(form.priceDollars || "0") * 100),
      maxUsers: parseInt(form.maxUsers || "1", 10),
      isPublic: form.isPublic,
      moduleKeys: [...form.moduleKeys],
    };
    try {
      if (form.id) await admin.updatePackage(form.id, body);
      else await admin.createPackage(body);
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("failedSave", { defaultValue: "Failed to save package" }));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: AdminPackage) => {
    if (!confirm(t("deleteConfirm", { defaultValue: `Delete the "${p.name}" package?`, name: p.name }))) return;
    try {
      await admin.deletePackage(p.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("failedDelete", { defaultValue: "Failed to delete" }));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
      >
        <Button radius="lg" className="bg-foreground px-3 font-semibold text-background hover:bg-foreground hover:opacity-90"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" /> {t("add")}
        </Button>
      </PageHeader>

      {error && (
        <p className="rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("loading", { defaultValue: "Loading…" })}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-xl border border-border bg-card p-5"
            >
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {p.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {p.priceCents === 0
                        ? t("free", { defaultValue: "Free" })
                        : `$${(p.priceCents / 100).toFixed(0)} / ${p.billingCycle.toLowerCase()}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                      aria-label={t("edit", { defaultValue: "Edit" })}
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(p)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-error/10 hover:text-error transition cursor-pointer"
                      aria-label={t("delete", { defaultValue: "Delete" })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.modules.length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {t("noModules", { defaultValue: "No modules" })}
                    </span>
                  ) : (
                    p.modules.map((m) => (
                      <span
                        key={m}
                        className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                      >
                        {m}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{t("upToUsers", { defaultValue: `Up to ${p.maxUsers} users`, count: p.maxUsers })}</span>
                <span>·</span>
                <StatusBadge
                  variant={p.isPublic ? "info" : "muted"}
                  label={p.isPublic ? t("public", { defaultValue: "Public" }) : t("private", { defaultValue: "Private" })}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? t("editPackage", { defaultValue: "Edit Package" }) : t("addPackage", { defaultValue: "Add Package" })}
        description={t("chooseModules", { defaultValue: "Choose the modules this plan grants access to." })}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition cursor-pointer"
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </button>
            <button
              onClick={save}
              disabled={busy || !form.name}
              className="rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              {busy ? t("saving", { defaultValue: "Saving…" }) : t("save", { defaultValue: "Save" })}
            </button>
          </div>
        }
      >
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm font-medium">{t("name", { defaultValue: "Name" })}</label>
              <input
                className={adminInput}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("namePlaceholder", { defaultValue: "Pro" })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t("price", { defaultValue: "Price (USD)" })}
              </label>
              <input
                type="number"
                min="0"
                className={adminInput}
                value={form.priceDollars}
                onChange={(e) =>
                  setForm({ ...form, priceDollars: e.target.value })
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t("maxUsers", { defaultValue: "Max users" })}
              </label>
              <input
                type="number"
                min="1"
                className={adminInput}
                value={form.maxUsers}
                onChange={(e) => setForm({ ...form, maxUsers: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("descriptionField", { defaultValue: "Description" })}
            </label>
            <input
              className={adminInput}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder={t("descriptionPlaceholder", { defaultValue: "Short summary of the plan" })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t("modules", { defaultValue: "Modules" })}</label>
            <div className="grid grid-cols-2 gap-2">
              {modules.map((m) => {
                const checked = form.moduleKeys.has(m.key);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleModule(m.key)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition cursor-pointer ${
                      checked
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        checked
                          ? "border-primary bg-primary text-white"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {checked && "✓"}
                    </span>
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
            />
            {t("publicSelfSignup", { defaultValue: "Public (available for self-signup)" })}
          </label>
        </div>
      </Modal>
    </div>
  );
}

export function PackagesAdminView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
