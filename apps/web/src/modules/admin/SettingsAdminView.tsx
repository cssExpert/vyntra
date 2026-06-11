"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  Settings,
  Save,
  Palette,
  ToggleLeft,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Globe,
} from "lucide-react";
import { Sketch } from "@uiw/react-color";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";
import { AdminGuard, adminInput } from "./AdminGuard";
import { cn } from "@/lib/utils";
import { TIMEZONES } from "@/lib/timezones";
import { Input } from "@/components/ui/input";
import {
  apiGetAdminSettings,
  apiUpdateAdminSettings,
  type AdminSettings,
} from "@/lib/api";

function hexToHslComponents(hex: string): string {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return "14 71% 48%"; // Flamingo fallback
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : l > 0.5 ? d / (2 - max - min) : d / (max + min);
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyColors(primary: string, secondary: string, accent: string) {
  const root = document.documentElement;
  root.style.setProperty("--primary", hexToHslComponents(primary || "#d14c23"));
  root.style.setProperty("--ring", hexToHslComponents(primary || "#d14c23"));
  root.style.setProperty(
    "--secondary",
    hexToHslComponents(secondary || "#8b5cf6"),
  );
  root.style.setProperty("--accent", hexToHslComponents(accent || "#ec4899"));
}

// ── Color picker field ────────────────────────────────────────────────────────

const SWATCH_PRESETS = [
  "#d14c23",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#000000",
  "#ffffff",
];

function ColorPickerField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({ right: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const right = window.innerWidth - r.right;
      if (window.innerHeight - r.bottom >= 280) {
        setCoords({ top: r.bottom + 4, bottom: undefined, right });
      } else {
        setCoords({
          top: undefined,
          bottom: window.innerHeight - r.top + 4,
          right,
        });
      }
    }
    setOpen((p) => !p);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(t) &&
        popoverRef.current &&
        !popoverRef.current.contains(t)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div ref={triggerRef} className="shrink-0">
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-2 rounded-xl border border-border bg-muted px-2.5 py-1.5 hover:bg-muted/80 transition-colors cursor-pointer"
        >
          <span
            className="h-6 w-6 rounded-lg border border-black/10 shadow-sm shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono text-xs text-foreground">
            {value.toUpperCase()}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Portal — escapes overflow:hidden and all stacking contexts */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              ...(coords.top !== undefined ? { top: coords.top } : {}),
              ...(coords.bottom !== undefined ? { bottom: coords.bottom } : {}),
              right: coords.right,
              zIndex: 9999,
            }}
            className="drop-shadow-xl rounded-2xl overflow-hidden border border-border"
          >
            <Sketch
              color={value}
              presetColors={SWATCH_PRESETS}
              onChange={(c) => onChange(c.hex)}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Inner() {
  const t = useTranslations("admin.appSettings");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState<Partial<AdminSettings>>({
    siteName: "ERVFlow",
    supportEmail: "support@ervflow.com",
    maxOrganizations: 1000,
    maxUsersPerOrganization: 500,
    enableRegistration: true,
    enableSocialAuth: false,
    maintenanceMode: false,
    logoUrl: null,
    faviconUrl: null,
    primaryColor: "#d14c23",
    secondaryColor: "#8b5cf6",
    accentColor: "#ec4899",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiGetAdminSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const save = async () => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await apiUpdateAdminSettings({
        siteName: settings.siteName,
        supportEmail: settings.supportEmail,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        maxOrganizations: settings.maxOrganizations,
        maxUsersPerOrganization: settings.maxUsersPerOrganization,
        enableRegistration: settings.enableRegistration,
        enableSocialAuth: settings.enableSocialAuth,
        maintenanceMode: settings.maintenanceMode,
      });
      applyColors(
        settings.primaryColor ?? "#d14c23",
        settings.secondaryColor ?? "#8b5cf6",
        settings.accentColor ?? "#ec4899",
      );
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
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-0">
      <PageHeader title={t("title")} description={t("description")} />

      {/* Banners */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="space-y-5">
        {/* ── Logo & Icon ─────────────────────────────────────────────────── */}
        <SectionCard
          icon={Palette}
          title={t("logoIcon")}
          description={t("logoIconDescription")}
        >
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm md:text-base lg:text-lg font-bold text-foreground">
                  {t("logo", { defaultValue: "Logo" })}
                </h4>
              </div>
              <ImageUploadWithStorage
                value={settings.logoUrl ?? null}
                onChange={(url) => handleChange("logoUrl", url)}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                maxSizeMB={5}
                previewShape="wide"
                label="Upload Logo"
                companyId="superadmin"
                module="branding"
              />
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("logoHelp", {
                  defaultValue:
                    "Shown in the sidebar and emails. Landscape format works best.",
                })}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm md:text-base lg:text-lg font-bold text-foreground">
                  {t("favicon", { defaultValue: "Favicon / App Icon" })}
                </h4>
              </div>
              <ImageUploadWithStorage
                value={settings.faviconUrl ?? null}
                onChange={(url) => handleChange("faviconUrl", url)}
                accept="image/png,image/x-icon,image/svg+xml"
                maxSizeMB={2}
                previewShape="circle"
                label="Upload Icon"
                companyId="superadmin"
                module="branding"
              />
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("faviconHelp", {
                  defaultValue:
                    "Shown in browser tabs and app launchers. Square 64x64 recommended.",
                })}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Brand Colors ─────────────────────────────────────────────────── */}
        <SectionCard
          icon={Palette}
          title={t("brandColors")}
          description={t("brandColorsDescription")}
        >
          <div className="space-y-3">
            <ColorPickerField
              label={t("primaryColor", { defaultValue: "Primary" })}
              description={t("primaryColorDesc", {
                defaultValue: "Main CTA color — buttons, active states, links",
              })}
              value={settings.primaryColor ?? "#d14c23"}
              onChange={(hex) => handleChange("primaryColor", hex)}
            />
            <ColorPickerField
              label={t("secondaryColor", { defaultValue: "Secondary" })}
              description={t("secondaryColorDesc", {
                defaultValue: "Supporting color — badges, secondary actions",
              })}
              value={settings.secondaryColor ?? "#8b5cf6"}
              onChange={(hex) => handleChange("secondaryColor", hex)}
            />
            <ColorPickerField
              label={t("accentColor", { defaultValue: "Accent" })}
              description={t("accentColorDesc", {
                defaultValue: "Highlight color — tags, decorative elements",
              })}
              value={settings.accentColor ?? "#ec4899"}
              onChange={(hex) => handleChange("accentColor", hex)}
            />

            <div className="mt-2 pt-5 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {t("preview", { defaultValue: "Preview" })}
              </p>
              <div className="flex gap-3">
                {[
                  {
                    label: "Primary",
                    color: settings.primaryColor ?? "#d14c23",
                  },
                  {
                    label: "Secondary",
                    color: settings.secondaryColor ?? "#8b5cf6",
                  },
                  { label: "Accent", color: settings.accentColor ?? "#ec4899" },
                ].map(({ label, color }) => (
                  <div key={label} className="flex-1 text-center space-y-2">
                    <div
                      className="h-14 w-full rounded-xl border border-border/50"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                    <p className="text-[11px] font-mono text-foreground/60">
                      {color.toUpperCase()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── General Settings ─────────────────────────────────────────────── */}
        <SectionCard
          icon={Settings}
          title={t("general")}
          description={t("generalDescription")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
                {t("siteName")}
              </label>
              <Input
                className={adminInput}
                value={settings.siteName ?? ""}
                onChange={(e) => handleChange("siteName", e.target.value)}
                placeholder="ERVFlow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
                {t("supportEmail")}
              </label>
              <Input
                type="email"
                className={adminInput}
                value={settings.supportEmail ?? ""}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
                placeholder="support@ervflow.com"
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Localization ─────────────────────────────────────────────────── */}
        <SectionCard
          icon={Globe}
          title={t("localization")}
          description={t("localizationDescription")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
                {t("timezone")}
              </label>
              <select
                className={adminInput}
                value={(settings as any).timezone ?? "UTC"}
                onChange={(e) => handleChange("timezone", e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {t("timezoneHelp")}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Limits & Quotas ──────────────────────────────────────────────── */}
        <SectionCard
          icon={Users}
          title={t("limitsQuotas")}
          description={t("limitsQuotasDescription")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
                Max Organizations
              </label>
              <Input
                type="number"
                className={adminInput}
                value={settings.maxOrganizations ?? ""}
                onChange={(e) =>
                  handleChange("maxOrganizations", parseInt(e.target.value))
                }
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Max organizations on the platform
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
                Max Users Per Org
              </label>
              <Input
                type="number"
                className={adminInput}
                value={settings.maxUsersPerOrganization ?? ""}
                onChange={(e) =>
                  handleChange(
                    "maxUsersPerOrganization",
                    parseInt(e.target.value),
                  )
                }
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Max users allowed per organization
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── Feature Toggles ──────────────────────────────────────────────── */}
        <SectionCard
          icon={ToggleLeft}
          title={t("featureToggles", { defaultValue: "Feature Toggles" })}
          description={t("featureTogglesDesc", {
            defaultValue: "Enable or disable platform-wide features.",
          })}
        >
          <div className="space-y-1">
            {[
              {
                field: "enableRegistration",
                label: t("enableRegistration", {
                  defaultValue: "User Registration",
                }),
                desc: t("registrationHelp", {
                  defaultValue: "Allow new users to sign up on the platform.",
                }),
              },
              {
                field: "enableSocialAuth",
                label: t("enableSocialAuth", {
                  defaultValue: "Social Authentication",
                }),
                desc: t("socialAuthHelp", {
                  defaultValue:
                    "Allow login via Google, GitHub, and other providers.",
                }),
              },
              {
                field: "maintenanceMode",
                label: t("maintenanceMode", {
                  defaultValue: "Maintenance Mode",
                }),
                desc: t("maintenanceModeHelp", {
                  defaultValue:
                    "Take the platform offline for all non-admin users.",
                }),
              },
            ].map(({ field, label, desc }) => {
              const checked = Boolean(settings[field as keyof typeof settings]);
              return (
                <label
                  key={field}
                  className="flex items-center justify-between gap-4 rounded-xl px-4 py-4 cursor-pointer hover:bg-muted/40 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      {label}
                      {field === "maintenanceMode" && checked && (
                        <span className="text-[10px] font-bold bg-error/10 text-error px-2 py-0.5 rounded-full">
                          {t("active", { defaultValue: "Active" })}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {desc}
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleChange(field, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className={cn(
                        "w-11 h-6 rounded-full border-2 transition-all duration-200",
                        checked
                          ? "bg-primary border-primary"
                          : "bg-muted border-border",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                          checked ? "left-[22px]" : "left-0.5",
                        )}
                      />
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* ── Sticky save bar ─────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 mx-auto px-4 md:px-6 py-4 bg-background/70 backdrop-blur-md rounded-2xl rounded-b-none border border-border flex items-center justify-between gap-4 z-10">
        <p className="text-xs text-muted-foreground">
          {success ? (
            <span className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />{" "}
              {t("saved", { defaultValue: "Saved" })}
            </span>
          ) : (
            t("unsavedChanges", {
              defaultValue:
                "Unsaved changes will be lost if you navigate away.",
            })
          )}
        </p>
        <button
          onClick={save}
          disabled={busy}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md shadow-primary/20"
        >
          {busy ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {busy
            ? t("saving", { defaultValue: "Saving…" })
            : t("saveSettings", { defaultValue: "Save Settings" })}
        </button>
      </div>
    </div>
  );
}

export function AppSettingsView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}

export function SettingsAdminView() {
  return <AppSettingsView />;
}
