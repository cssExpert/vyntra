"use client";

import { useCallback, useEffect, useState } from "react";
import { Boxes, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { admin, type AdminModule } from "@/lib/api";
import { AdminGuard, adminInput } from "./AdminGuard";

function Inner() {
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ key: "", name: "", description: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setModules(await admin.listModules());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setBusy(true);
    setError("");
    try {
      await admin.createModule({
        key: form.key,
        name: form.name,
        description: form.description || undefined,
      });
      setModalOpen(false);
      setForm({ key: "", name: "", description: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create module");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (m: AdminModule) => {
    try {
      await admin.updateModule(m.id, { isActive: !m.isActive });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modules"
        description="The catalog of features packages can grant."
      >
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Module
        </button>
      </PageHeader>

      {error && (
        <p className="rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Module</th>
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : (
              modules.map((m) => (
                <tr key={m.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Boxes className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-foreground">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{m.key}</code>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.description ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleActive(m)} className="cursor-pointer">
                      <StatusBadge
                        variant={m.isActive ? "success" : "muted"}
                        label={m.isActive ? "Active" : "Disabled"}
                        dot
                        size="sm"
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Module"
        description="Define a new platform feature packages can include."
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={create}
              disabled={busy || !form.key || !form.name}
              className="rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Key</label>
            <input
              className={adminInput}
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase() })}
              placeholder="ANALYTICS"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Uppercase identifier used in code & package gating.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name</label>
            <input
              className={adminInput}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Analytics"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <input
              className={adminInput}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function ModulesAdminView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
