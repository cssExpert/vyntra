"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollText, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiGetActivity, type ApiActivityLog } from "@/lib/api";

function statusVariant(code: number | null): "success" | "warning" | "error" | "muted" {
  if (code == null) return "muted";
  if (code < 300) return "success";
  if (code < 400) return "warning";
  return "error";
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleString();
}

export function SystemLogsView() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("settings.systemlogs.tsx");
  const [logs, setLogs] = useState<ApiActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLogs(await apiGetActivity());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load activity.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="System Logs"
        description="Recent activity recorded for your organization."
      >
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </PageHeader>

      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="px-4 py-12 text-center text-muted-foreground">
            Loading activity…
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <ScrollText className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No activity recorded yet.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Action</th>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{log.action}</p>
                    {log.resourceType && (
                      <p className="text-xs text-muted-foreground">
                        {log.resourceType}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {log.user ? (
                      <>
                        <p className="text-foreground">
                          {log.user.name ?? log.user.email}
                        </p>
                        {log.user.name && (
                          <p className="text-xs">{log.user.email}</p>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={statusVariant(log.statusCode)}
                      label={log.statusCode != null ? String(log.statusCode) : "—"}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatWhen(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
