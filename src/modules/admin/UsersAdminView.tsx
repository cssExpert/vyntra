"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { admin, type AdminUser } from "@/lib/api";
import { AdminGuard } from "./AdminGuard";

function Inner() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await admin.listUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const promote = async (u: AdminUser) => {
    if (!confirm(`Promote ${u.email} to super admin?`)) return;
    try {
      await admin.promoteUser(u.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to promote");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="All users across every organization."
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
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Organization</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="px-4 py-3 font-medium">Type</th>
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
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{u.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.organization?.name ?? (u.superAdmin ? "— (platform)" : "—")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        u.roles.map((r, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                          >
                            {r.role}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.superAdmin ? (
                      <StatusBadge variant="purple" label="Super Admin" size="sm" />
                    ) : (
                      <StatusBadge variant="muted" label="Member" size="sm" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!u.superAdmin && (
                      <button
                        onClick={() => promote(u)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> Make super admin
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UsersAdminView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
