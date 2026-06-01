"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/common/Modal";
import {
  admin,
  type AdminOrganization,
  type AdminPackage,
} from "@/lib/api";
import { AdminGuard, adminInput } from "./AdminGuard";

function Inner() {
  const [orgs, setOrgs] = useState<AdminOrganization[]>([]);
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", packageSlug: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [o, p] = await Promise.all([
        admin.listOrganizations(),
        admin.listPackages(),
      ]);
      setOrgs(o);
      setPackages(p);
      setForm((f) => ({ ...f, packageSlug: f.packageSlug || p[0]?.slug || "" }));
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
      await admin.createOrganization({
        name: form.name,
        email: form.email || undefined,
        packageSlug: form.packageSlug,
      });
      setModalOpen(false);
      setForm({ name: "", email: "", packageSlug: packages[0]?.slug ?? "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  const changePlan = async (id: string, slug: string) => {
    try {
      await admin.assignPackage(id, slug);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to change plan");
    }
  };

  const remove = async (org: AdminOrganization) => {
    if (!confirm(`Delete "${org.name}"? This removes all its data.`)) return;
    try {
      await admin.deleteOrganization(org.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Companies on the platform and their plans."
      >
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Organization
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
              <th className="px-4 py-3 font-medium">Organization</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Users</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : orgs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No organizations yet.
                </td>
              </tr>
            ) : (
              orgs.map((org) => (
                <tr key={org.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{org.name}</p>
                        <p className="text-xs text-muted-foreground">{org.email ?? org.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={org.subscription?.package.slug ?? ""}
                      onChange={(e) => changePlan(org.id, e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm cursor-pointer"
                    >
                      {packages.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {org._count.users} / {org.maxUsers}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={org.isActive ? "success" : "muted"}
                      label={org.isActive ? "Active" : "Inactive"}
                      dot
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(org)}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-error/10 hover:text-error transition cursor-pointer"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
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
        title="Add Organization"
        description="Create a company and assign its starting plan."
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
              disabled={busy || !form.name || !form.packageSlug}
              className="rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name</label>
            <input
              className={adminInput}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email (optional)</label>
            <input
              className={adminInput}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@acme.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Plan</label>
            <select
              className={adminInput}
              value={form.packageSlug}
              onChange={(e) => setForm({ ...form, packageSlug: e.target.value })}
            >
              {packages.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name} — {p.modules.join(", ") || "no modules"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function OrganizationsAdminView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
