"use client";

import { useState } from "react";
import { Building2, Palette, Lock, Bell, Upload, Trash2, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";

interface SettingsState {
  organizationName: string;
  organizationSlug: string;
  organizationEmail: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  emailNotifications: boolean;
  slackNotifications: boolean;
  twoFactorEnabled: boolean;
}

const PRESET_COLORS = [
  { name: "Blue", hex: "#3b82f6" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Red", hex: "#ef4444" },
  { name: "Orange", hex: "#f97316" },
  { name: "Green", hex: "#22c55e" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Cyan", hex: "#06b6d4" },
];

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<"branding" | "notifications" | "security">("branding");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    organizationName: "My Organization",
    organizationSlug: "my-organization",
    organizationEmail: "hello@myorg.com",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    accentColor: "#ec4899",
    logoUrl: "",
    faviconUrl: "",
    emailNotifications: true,
    slackNotifications: false,
    twoFactorEnabled: false,
  });

  const handleChange = (field: keyof SettingsState, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Connect to actual API
      // await api.updateSettings(settings);
      await new Promise((r) => setTimeout(r, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "branding", label: "Branding", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your workspace, branding, and preferences."
      />

      {saved && (
        <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
          Settings saved successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id as any;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {/* Branding Tab */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            {/* Organization Info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold">Organization</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Organization Name</label>
                  <input
                    type="text"
                    value={settings.organizationName}
                    onChange={(e) => handleChange("organizationName", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="My Organization"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Organization Email</label>
                  <input
                    type="email"
                    value={settings.organizationEmail}
                    onChange={(e) => handleChange("organizationEmail", e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="hello@myorg.com"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Workspace Slug</label>
                  <input
                    type="text"
                    value={settings.organizationSlug}
                    onChange={(e) =>
                      handleChange("organizationSlug", e.target.value.toLowerCase().replace(/\s+/g, "-"))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="my-organization"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Used in your workspace URL</p>
                </div>
              </div>
            </div>

            {/* Logo & Favicon */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-6">Logo & Icon</h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Logo</label>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={settings.logoUrl}
                        onChange={(e) => handleChange("logoUrl", e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                        value={settings.faviconUrl}
                        onChange={(e) => handleChange("faviconUrl", e.target.value)}
                        placeholder="https://example.com/favicon.ico"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
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

            {/* Color Branding */}
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
                    <div className="space-y-3">
                      {/* Custom color input */}
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings[key as keyof SettingsState]}
                          onChange={(e) => handleChange(key as keyof SettingsState, e.target.value)}
                          className="h-10 w-16 rounded-lg border border-border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings[key as keyof SettingsState]}
                          onChange={(e) => handleChange(key as keyof SettingsState, e.target.value)}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground font-mono"
                          placeholder="#3b82f6"
                        />
                      </div>

                      {/* Preset colors */}
                      <div className="flex gap-2 flex-wrap">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color.hex}
                            onClick={() => handleChange(key as keyof SettingsState, color.hex)}
                            className={cn(
                              "h-8 w-8 rounded-lg border-2 transition-all hover:scale-110",
                              settings[key as keyof SettingsState] === color.hex
                                ? "border-foreground"
                                : "border-transparent",
                            )}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
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
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-2">Secondary</p>
                    <div
                      className="h-24 rounded-lg border border-border"
                      style={{ backgroundColor: settings.secondaryColor }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-2">Accent</p>
                    <div
                      className="h-24 rounded-lg border border-border"
                      style={{ backgroundColor: settings.accentColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                  className="w-4 h-4 rounded border border-border bg-background cursor-pointer"
                />
                <div>
                  <span className="block text-sm font-medium">Email Notifications</span>
                  <span className="text-xs text-muted-foreground">Receive updates via email</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.slackNotifications}
                  onChange={(e) => handleChange("slackNotifications", e.target.checked)}
                  className="w-4 h-4 rounded border border-border bg-background cursor-pointer"
                />
                <div>
                  <span className="block text-sm font-medium">Slack Notifications</span>
                  <span className="text-xs text-muted-foreground">Send alerts to your Slack workspace</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-6">Security Settings</h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-muted/40 transition">
                  <div>
                    <span className="block text-sm font-medium">Two-Factor Authentication</span>
                    <span className="text-xs text-muted-foreground">Add an extra layer of security</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.twoFactorEnabled}
                    onChange={(e) => handleChange("twoFactorEnabled", e.target.checked)}
                    className="w-4 h-4 rounded border border-border bg-background cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-error/20 bg-error/5 p-6">
              <h3 className="text-lg font-semibold mb-4 text-error">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Delete your workspace and all associated data. This action is irreversible.
              </p>
              <button className="flex items-center gap-2 rounded-lg bg-error/10 text-error px-4 py-2 text-sm font-medium hover:bg-error/20 transition">
                <Trash2 className="h-4 w-4" />
                Delete Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
