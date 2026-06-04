"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { adminInput } from "./AdminGuard";
import { AdminGuard } from "./AdminGuard";

function Inner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Vyntra",
    supportEmail: "support@vyntra.com",
    maxOrganizations: 1000,
    maxUsersPerOrganization: 500,
    enableRegistration: true,
    enableSocialAuth: false,
    maintenanceMode: false,
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      // TODO: Connect to actual API endpoint when available
      // await admin.updateSettings(settings);
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Settings"
        description="Manage platform-wide settings and configuration."
      />

      {error && (
        <p className="rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-lg bg-success/10 border border-success/20 px-3 py-2 text-sm text-success">
          {success}
        </p>
      )}

      <div className="grid gap-6">
        {/* General Settings */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Settings className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-semibold">General Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Site Name</label>
              <input
                className={adminInput}
                value={settings.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                placeholder="Vyntra"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Support Email</label>
              <input
                type="email"
                className={adminInput}
                value={settings.supportEmail}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
                placeholder="support@vyntra.com"
              />
            </div>
          </div>
        </div>

        {/* Limits & Quotas */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Limits & Quotas</h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Max Organizations
              </label>
              <input
                type="number"
                className={adminInput}
                value={settings.maxOrganizations}
                onChange={(e) => handleChange("maxOrganizations", parseInt(e.target.value))}
                min="1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Maximum number of organizations allowed on the platform.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Max Users Per Organization
              </label>
              <input
                type="number"
                className={adminInput}
                value={settings.maxUsersPerOrganization}
                onChange={(e) =>
                  handleChange("maxUsersPerOrganization", parseInt(e.target.value))
                }
                min="1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Maximum users allowed in a single organization.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Feature Toggles</h3>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableRegistration}
                onChange={(e) => handleChange("enableRegistration", e.target.checked)}
                className="w-4 h-4 rounded border border-border bg-background cursor-pointer"
              />
              <span className="text-sm font-medium">Enable User Registration</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSocialAuth}
                onChange={(e) => handleChange("enableSocialAuth", e.target.checked)}
                className="w-4 h-4 rounded border border-border bg-background cursor-pointer"
              />
              <span className="text-sm font-medium">Enable Social Authentication</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                className="w-4 h-4 rounded border border-border bg-background cursor-pointer"
              />
              <span className="text-sm font-medium">Maintenance Mode</span>
              {settings.maintenanceMode && (
                <span className="ml-auto text-xs bg-error/10 text-error px-2 py-1 rounded">
                  Active
                </span>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={save}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition cursor-pointer disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {busy ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

export function SettingsAdminView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
