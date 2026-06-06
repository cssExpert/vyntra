"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Palette,
  Lock,
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe,
  Trash2,
  ShieldAlert,
  Mail,
  MessageSquare,
  Key,
  Smartphone,
  ChevronDown,
  ImagePlus,
} from "lucide-react";
import { Sketch } from "@uiw/react-color";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";
import { cn } from "@/lib/utils";
import { apiUpdateOrgSettings } from "@/lib/api";
import { useSettings } from "@/providers/SettingsProvider";
import { MotionTabs, type MotionTabItem } from "@/components/ui/MotionTabs";

interface SettingsState {
  organizationName: string;
  organizationSlug: string;
  organizationEmail: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  emailNotifications: boolean;
  slackNotifications: boolean;
}

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";

// ── Color picker field with @uiw/react-color Sketch popover ──────────────────
const SWATCH_PRESETS = [
  "#F76235",
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
  // right = distance from viewport right edge → right-aligns picker to button's right border
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

      {/* Trigger */}
      <div ref={triggerRef} className="shrink-0">
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-2 rounded-xl border border-border bg-white dark:bg-muted px-2.5 py-1.5 hover:bg-muted/80 transition-colors cursor-pointer group"
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
            className="drop-shadow-xl rounded-md overflow-hidden border border-border"
          >
            <Sketch
              color={value}
              presetColors={SWATCH_PRESETS}
              onChange={(c) => onChange(c.hex)}
              style={
                {
                  "--sketch-background": "hsl(var(--card))",
                } as React.CSSProperties
              }
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function SettingsView() {
  const {
    settings: savedSettings,
    loading: contextLoading,
    error: contextError,
    refreshSettings,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<
    "branding" | "notifications" | "security"
  >("branding");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<SettingsState>({
    organizationName: "",
    organizationSlug: "",
    organizationEmail: "",
    primaryColor: "#F76235",
    secondaryColor: "#8b5cf6",
    accentColor: "#ec4899",
    logoUrl: null,
    faviconUrl: null,
    emailNotifications: true,
    slackNotifications: false,
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings({
        organizationName: savedSettings.name,
        organizationSlug: savedSettings.slug,
        organizationEmail: savedSettings.email || "",
        primaryColor: savedSettings.primaryColor,
        secondaryColor: savedSettings.secondaryColor,
        accentColor: savedSettings.accentColor,
        logoUrl: savedSettings.logoUrl,
        faviconUrl: savedSettings.faviconUrl,
        emailNotifications: savedSettings.emailNotifications,
        slackNotifications: savedSettings.slackNotifications,
      });
    }
  }, [savedSettings]);

  const handleChange = (field: keyof SettingsState, value: unknown) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const updateData: Record<string, unknown> = {
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        accentColor: settings.accentColor,
        emailNotifications: settings.emailNotifications,
        slackNotifications: settings.slackNotifications,
      };
      if (settings.organizationName)
        updateData.name = settings.organizationName;
      if (settings.organizationEmail)
        updateData.email = settings.organizationEmail;
      if (settings.logoUrl !== null) updateData.logoUrl = settings.logoUrl;
      if (settings.faviconUrl !== null)
        updateData.faviconUrl = settings.faviconUrl;

      await apiUpdateOrgSettings(updateData);
      await refreshSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const tabs: MotionTabItem<"branding" | "notifications" | "security">[] = [
    { id: "branding",      label: "Branding",      icon: ImagePlus },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security",      label: "Security",      icon: Lock },
  ];

  // ── Loading / no-org states ──────────────────────────────────────────────
  if (contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm">Loading settings…</p>
        </div>
      </div>
    );
  }

  if (contextError?.includes("No organization context")) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your workspace, branding, and preferences."
        />
        <div className="rounded-2xl border border-warning/20 bg-warning/5 px-8 py-10 text-center max-w-md mx-auto">
          <ShieldAlert className="mx-auto h-8 w-8 text-warning mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">
            Organization Settings Not Available
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Organization settings are only available for members of an
            organization. Super admins can manage settings via the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-0">
      <PageHeader
        title="Settings"
        description="Manage your workspace, branding, and preferences."
      />

      {/* Alert banners */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Settings saved successfully!
        </div>
      )}

      <MotionTabs
        tabs={tabs}
        active={activeTab}
        onChange={setActiveTab}
        layoutId="settings-tab-indicator"
        className="w-fit"
      />

      {/* Tab content — same y:8→0 fade-in as MotionTabs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >

      {/* ── Branding Tab ──────────────────────────────────────────────────── */}
      {activeTab === "branding" && (
        <div className="space-y-5">
          {/* Organization Info */}
          <SectionCard
            icon={Building2}
            title="Organization"
            description="Your organization's identity and contact details."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup label="Organization Name">
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={(e) =>
                    handleChange("organizationName", e.target.value)
                  }
                  className={inputCls}
                  placeholder="My Organization"
                />
              </FieldGroup>

              <FieldGroup label="Organization Email">
                <input
                  type="email"
                  value={settings.organizationEmail}
                  onChange={(e) =>
                    handleChange("organizationEmail", e.target.value)
                  }
                  className={inputCls}
                  placeholder="hello@myorg.com"
                />
              </FieldGroup>

              <FieldGroup
                label="Workspace Slug"
                hint="Used in your workspace URL · e.g. app.ervflow.com/my-org"
              >
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={settings.organizationSlug}
                    onChange={(e) =>
                      handleChange(
                        "organizationSlug",
                        e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      )
                    }
                    className={cn(inputCls, "pl-9")}
                    placeholder="my-organization"
                  />
                </div>
              </FieldGroup>
            </div>
          </SectionCard>

          {/* Logo & Icon */}
          <SectionCard
            icon={ImagePlus}
            title="Logo & Icon"
            description="Upload your brand logo and favicon. Recommended: PNG or SVG with transparent background."
          >
            <div className="grid gap-8 sm:grid-cols-2">
              {/* Logo */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Logo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Shown in the sidebar and emails. Landscape format works
                    best.
                  </p>
                </div>
                <ImageUploadWithStorage
                  value={settings.logoUrl}
                  onChange={(url) => handleChange("logoUrl", url)}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  maxSizeMB={5}
                  previewShape="wide"
                  label="Upload Logo"
                />
              </div>

              {/* Favicon */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Favicon / App Icon
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Shown in browser tabs and app launchers. Square 512×512
                    recommended.
                  </p>
                </div>
                <ImageUploadWithStorage
                  value={settings.faviconUrl}
                  onChange={(url) => handleChange("faviconUrl", url)}
                  accept="image/png,image/x-icon,image/svg+xml"
                  maxSizeMB={2}
                  previewShape="circle"
                  label="Upload Icon"
                />
              </div>
            </div>
          </SectionCard>

          {/* Brand Colors */}
          <SectionCard
            icon={Palette}
            title="Brand Colors"
            description="Customize colors used across buttons, links, and highlights."
          >
            <div className="space-y-3">
              <ColorPickerField
                label="Primary"
                description="Main CTA color — buttons, active states, links"
                value={settings.primaryColor}
                onChange={(hex) => handleChange("primaryColor", hex)}
              />
              <ColorPickerField
                label="Secondary"
                description="Supporting color — badges, secondary actions"
                value={settings.secondaryColor}
                onChange={(hex) => handleChange("secondaryColor", hex)}
              />
              <ColorPickerField
                label="Accent"
                description="Highlight color — tags, decorative elements"
                value={settings.accentColor}
                onChange={(hex) => handleChange("accentColor", hex)}
              />

              {/* Live preview strip */}
              <div className="mt-2 pt-5 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Preview
                </p>
                <div className="flex gap-3">
                  {[
                    { label: "Primary", color: settings.primaryColor },
                    { label: "Secondary", color: settings.secondaryColor },
                    { label: "Accent", color: settings.accentColor },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex-1 text-center space-y-2">
                      <div
                        className="h-14 w-full rounded-xl border border-border/50 shadow-inner"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {label}
                      </p>
                      <p className="text-[11px] font-mono text-foreground/60">
                        {color.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Notifications Tab ─────────────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <div className="space-y-5">
          <SectionCard
            icon={Bell}
            title="Notification Channels"
            description="Choose how you receive alerts and updates from ERVFlow."
          >
            <div className="space-y-1">
              {[
                {
                  field: "emailNotifications" as const,
                  icon: Mail,
                  label: "Email Notifications",
                  desc: "Receive activity updates, summaries, and alerts via email.",
                },
                {
                  field: "slackNotifications" as const,
                  icon: MessageSquare,
                  label: "Slack Notifications",
                  desc: "Push real-time alerts directly to your connected Slack workspace.",
                },
              ].map(({ field, icon: Icon, label, desc }) => (
                <label
                  key={field}
                  className="flex items-center justify-between gap-4 rounded-xl px-4 py-4 cursor-pointer hover:bg-muted/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  {/* Toggle */}
                  <div className="relative shrink-0">
                    <input
                      type="checkbox"
                      checked={settings[field]}
                      onChange={(e) => handleChange(field, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className={cn(
                        "w-11 h-6 rounded-full border-2 transition-all duration-200 peer",
                        settings[field]
                          ? "bg-primary border-primary"
                          : "bg-muted border-border",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                          settings[field] ? "left-[22px]" : "left-0.5",
                        )}
                      />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Security Tab ──────────────────────────────────────────────────── */}
      {activeTab === "security" && (
        <div className="space-y-5">
          <SectionCard
            icon={Key}
            title="Authentication"
            description="Manage password policies and login methods."
          >
            <div className="space-y-4">
              {[
                {
                  icon: Smartphone,
                  label: "Two-Factor Authentication",
                  desc: "Require 2FA for all members of this workspace.",
                  badge: "Coming soon",
                },
                {
                  icon: Key,
                  label: "SSO / SAML",
                  desc: "Connect an identity provider for single sign-on.",
                  badge: "Coming soon",
                },
              ].map(({ icon: Icon, label, desc, badge }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  {badge && (
                    <span className="shrink-0 rounded-full bg-muted border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-error/30 bg-error/5 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-error/20">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error">
                <ShieldAlert className="h-4.5 w-4.5" size={18} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-error">
                  Danger Zone
                </h3>
                <p className="text-xs text-error/70">
                  These actions are permanent and cannot be undone.
                </p>
              </div>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Delete Workspace
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Permanently delete this workspace and all its data, members,
                    and billing.
                  </p>
                </div>
                <button className="shrink-0 flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 text-error px-4 py-2 text-sm font-medium hover:bg-error/20 transition cursor-pointer">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        </motion.div>
      </AnimatePresence>

      {/* ── Sticky save bar ───────────────────────────────────────────────── */}
      <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
        <p className="text-xs text-muted-foreground">
          {saved ? (
            <span className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </span>
          ) : (
            "Unsaved changes will be lost if you navigate away."
          )}
        </p>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md shadow-primary/20"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
