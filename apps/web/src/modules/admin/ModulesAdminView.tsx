"use client";

import { useCallback, useEffect, useState } from "react";
import { Boxes, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { admin, type AdminModule } from "@/lib/api";
import { AdminGuard, adminInput } from "./AdminGuard";

interface ModuleDetail extends AdminModule {
  companies?: Array<{ id: string; name: string; slug: string }>;
}

function Inner() {
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedModule, setSelectedModule] = useState<ModuleDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

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

  const openDetail = async (m: AdminModule) => {
    try {
      const detail = await admin.getModule(m.id);
      setSelectedModule(detail as ModuleDetail);
      setDetailOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load module details");
    }
  };

  const openEdit = (m: ModuleDetail) => {
    setEditForm({ name: m.name, description: m.description || "" });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedModule) return;
    setEditBusy(true);
    setError("");
    try {
      await admin.updateModule(selectedModule.id, {
        name: editForm.name,
        description: editForm.description || undefined,
      });
      setEditOpen(false);
      await load();
      const updated = await admin.getModule(selectedModule.id);
      setSelectedModule(updated as ModuleDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update module");
    } finally {
      setEditBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modules"
        description="The catalog of features packages can grant."
      />

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
                <tr key={m.id} className="hover:bg-muted/20 cursor-pointer transition" onClick={() => openDetail(m)}>
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
                    <StatusBadge
                      variant={m.isActive ? "success" : "muted"}
                      label={m.isActive ? "Active" : "Disabled"}
                      dot
                      size="sm"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Module Detail Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedModule(null);
        }}
        title={selectedModule?.name}
        description="View module details and usage."
        maxWidth="lg"
        footer={
          <button
            onClick={() => selectedModule && openEdit(selectedModule)}
            className="flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
        }
      >
        <div className="px-6 py-5 space-y-6">
          {selectedModule && (
            <>
              <div className="grid gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Key</p>
                  <p className="mt-1 font-mono text-sm">{selectedModule.key}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
                  <p className="mt-1 text-sm">{selectedModule.description || "No description"}</p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="text-sm font-semibold text-foreground mb-4">Using This Module</h4>
                {selectedModule.companies && selectedModule.companies.length > 0 ? (
                  <div className="space-y-2">
                    {selectedModule.companies.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                      >
                        <span className="font-medium text-foreground">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.slug}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No companies are using this module yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Edit Module Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Module"
        description="Update module details."
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditOpen(false)}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={editBusy || !editForm.name}
              className="rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              {editBusy ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name</label>
            <input
              className={adminInput}
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Module name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <input
              className={adminInput}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Module description"
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
