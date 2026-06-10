"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { Switch } from "@/components/ui/switch";
import { apiGetOrgSettings, apiUpdateOrgSettings } from "@/lib/api";

interface ToggleRowProps {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function NotificationsSettingsView() {
  const t = useTranslations("settings.notifications");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const s = await apiGetOrgSettings();
      setEmailNotifications(s.emailNotifications);
      setSlackNotifications(s.slackNotifications);
    } catch (e) {
      setFeedback({
        type: "error",
        message:
          e instanceof Error ? e.message : t("loadError", { defaultValue: "Failed to load notifications." }),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await apiUpdateOrgSettings({ emailNotifications, slackNotifications });
      setFeedback({ type: "success", message: "Notification preferences saved." });
    } catch (e) {
      setFeedback({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to save preferences.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading notifications…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Manage Notifications"
        description="Choose how your organization receives updates."
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

      <SectionCard
        icon={Bell}
        title="Channels"
        description="Where notifications are delivered."
      >
        <div className="divide-y divide-border">
          <ToggleRow
            icon={Mail}
            title="Email Notifications"
            description="Receive important updates and alerts by email."
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
          <ToggleRow
            icon={MessageSquare}
            title="Slack Notifications"
            description="Post activity to your connected Slack workspace."
            checked={slackNotifications}
            onChange={setSlackNotifications}
          />
        </div>
      </SectionCard>
    </div>
  );
}
