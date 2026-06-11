"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { apiChangePassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export function PasswordSettingsView() {
  const t = useTranslations("settings.password");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSave = async () => {
    setFeedback(null);
    if (!current || !next) {
      setFeedback({
        type: "error",
        message: t("fillFields", {
          defaultValue: "Please fill in all fields.",
        }),
      });
      return;
    }
    if (next.length < 8) {
      setFeedback({
        type: "error",
        message: t("pwdMinLength", {
          defaultValue: "New password must be at least 8 characters.",
        }),
      });
      return;
    }
    if (next !== confirm) {
      setFeedback({
        type: "error",
        message: t("pwdNoMatch", {
          defaultValue: "New passwords do not match.",
        }),
      });
      return;
    }
    setSaving(true);
    try {
      await apiChangePassword({ currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      setFeedback({
        type: "success",
        message: t("pwdChanged", {
          defaultValue: "Password changed successfully.",
        }),
      });
    } catch (e) {
      setFeedback({
        type: "error",
        message:
          e instanceof Error
            ? e.message
            : t("error", { defaultValue: "Failed to change password." }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title={t("title", { defaultValue: "Manage Password" })}
        description={t("description", {
          defaultValue: "Update the password you use to sign in.",
        })}
      >
        <Button size="lg" radius="lg" className="px-4"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving
            ? t("saving", { defaultValue: "Saving…" })
            : t("updatePwd", { defaultValue: "Update Password" })}
        </Button>
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
        icon={Lock}
        title={t("changePassword", { defaultValue: "Change Password" })}
        description={t("changePasswordDesc", {
          defaultValue: "Enter your current password, then choose a new one.",
        })}
      >
        <div className="space-y-5">
          <PasswordField
            label={t("currentPassword", { defaultValue: "Current Password" })}
            value={current}
            onChange={setCurrent}
            show={showCurrent}
            onToggle={() => setShowCurrent((s) => !s)}
            placeholder={t("enterCurrentPwd", {
              defaultValue: "Your current password",
            })}
          />
          <PasswordField
            label={t("newPassword", { defaultValue: "New Password" })}
            value={next}
            onChange={setNext}
            show={showNext}
            onToggle={() => setShowNext((s) => !s)}
            placeholder={t("minChars8", {
              defaultValue: "At least 8 characters",
            })}
          />
          <PasswordField
            label={t("confirmPassword", {
              defaultValue: "Confirm New Password",
            })}
            value={confirm}
            onChange={setConfirm}
            show={showNext}
            onToggle={() => setShowNext((s) => !s)}
            placeholder={t("reenterPassword", {
              defaultValue: "Re-enter the new password",
            })}
          />
        </div>
      </SectionCard>
    </div>
  );
}
