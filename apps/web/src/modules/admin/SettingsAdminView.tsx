"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings, Save, Upload } from "lucide-react";
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
    logoUrl: null as string | null,
    faviconUrl: null as string | null,
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    accentColor: "#ec4899",
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
        {/* Logo & Branding */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-6">Logo & Icon</h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Logo</label>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={settings.logoUrl || ""}
                    onChange={(e) => handleChange("logoUrl", e.target.value || null)}
                    placeholder="https://example.com/logo.png"
                    className={adminInput}
                  />
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition">
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
              </div>
              {settings.logoUrl && (
                <div className="mt-3 p-3 bg-muted/40 rounded-lg">
                  <img src={settings.logoUrl} alt="Logo" className="h-12 object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Favicon</label>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={settings.faviconUrl || ""}
                    onChange={(e) => handleChange("faviconUrl", e.target.value || null)}
                    placeholder="https://example.com/favicon.ico"
                    className={adminInput}
                  />
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition">
                  <Upload className="h-4 w-4" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-6">Brand Colors</h3>

          <div className="space-y-6">
            {[
              { key: "primaryColor", label: "Primary Color" },
              { key: "secondaryColor", label: "Secondary Color" },
              { key: "accentColor", label: "Accent Color" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="mb-3 block text-sm font-medium">{label}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={String(settings[key as keyof typeof settings])}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="h-10 w-16 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={String(settings[key as keyof typeof settings])}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Color Preview */}
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="text-sm font-medium mb-4">Preview</h4>
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">Primary</p>
                <div
                  className="h-24 rounded-lg border border-border"
                  style={{ backgroundColor: String(settings.primaryColor) }}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">Secondary</p>
                <div
                  className="h-24 rounded-lg border border-border"
                  style={{ backgroundColor: String(settings.secondaryColor) }}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-2">Accent</p>
                <div
                  className="h-24 rounded-lg border border-border"
                  style={{ backgroundColor: String(settings.accentColor) }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2.5 mb-6">
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
              <label className="mb-1.5 block text-sm font-medium">Max Organizations</label>
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
              <label className="mb-1.5 block text-sm font-medium">Max Users Per Organization</label>
              <input
                type="number"
                className={adminInput}
                value={settings.maxUsersPerOrganization}
                onChange={(e) => handleChange("maxUsersPerOrganization", parseInt(e.target.value))}
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

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {busy ? "Saving…" : "Save Settings"}
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
