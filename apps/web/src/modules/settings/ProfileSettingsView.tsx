"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiUpdateProfile } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";

export function ProfileSettingsView() {
  const t = useTranslations("settings.profile");
  const { user, organizationName, isSuperAdmin, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Seed the form from the authenticated user once it's available.
  useEffect(() => {
    if (user) setName(user.name ?? "");
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">
          {t("loading", { defaultValue: "Loading profile…" })}
        </p>
      </div>
    );
  }

  const trimmed = name.trim();
  const isDirty = trimmed !== (user.name ?? "");
  const canSave = isDirty && trimmed.length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setFeedback(null);
    try {
      await apiUpdateProfile({ name: trimmed });
      await refreshUser();
      setFeedback({
        type: "success",
        message: t("saved", { defaultValue: "Profile updated successfully." }),
      });
    } catch (e) {
      setFeedback({
        type: "error",
        message:
          e instanceof Error
            ? e.message
            : t("error", { defaultValue: "Failed to update profile." }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={t("title", { defaultValue: "Profile" })}
        description={t("description", {
          defaultValue: "Manage your personal account details.",
        })}
      >
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </PageHeader>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "bg-success/10 border-success/20 text-success"
              : "bg-error/10 border-error/20 text-error"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Identity header */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-lg font-bold text-white">
          {user.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-foreground">
            {user.name || "Unnamed user"}
          </p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Personal information */}
      <SectionCard
        icon={UserIcon}
        title="Personal Information"
        description="Your name as it appears across the platform."
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={user.email}
                disabled
                className={`${inputCls} pl-9 cursor-not-allowed bg-muted/40 text-muted-foreground`}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your email is used to sign in and can&apos;t be changed here.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Account */}
      <SectionCard
        icon={ShieldCheck}
        title="Account"
        description="Your role and organization on the platform."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Account Type</p>
            {isSuperAdmin ? (
              <StatusBadge variant="purple" label="Super Admin" size="sm" />
            ) : (
              <StatusBadge variant="muted" label={user.role} size="sm" />
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Organization</p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 size={14} />
              {isSuperAdmin ? "Platform" : (organizationName ?? "—")}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
