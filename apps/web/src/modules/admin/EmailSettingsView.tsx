"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import {
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { AdminGuard, adminInput } from "./AdminGuard";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  apiGetAdminSettings,
  apiUpdateAdminSettings,
  apiFetch,
  type AdminSettings,
} from "@/lib/api";

type EmailProvider = "smtp" | "sendgrid" | "mailgun";

interface EmailOption {
  id: EmailProvider;
  name: string;
  description: string;
  icon: string;
  cost: string;
  setupTime: string;
}

const EMAIL_OPTIONS: EmailOption[] = [
  {
    id: "smtp",
    name: "SMTP Server",
    description: "Use any SMTP provider (Gmail, SendGrid, custom server)",
    icon: "📧",
    cost: "Variable - depends on provider",
    setupTime: "5 min",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Professional email delivery service with great reliability",
    icon: "📬",
    cost: "Free - $100/month",
    setupTime: "2 min",
  },
  {
    id: "mailgun",
    name: "Mailgun",
    description: "Developer-friendly email API with great documentation",
    icon: "📨",
    cost: "Free - Custom pricing",
    setupTime: "3 min",
  },
];

const CONFIG_FIELDS = {
  smtp: [
    {
      key: "host",
      label: "SMTP Host",
      type: "text",
      required: true,
      placeholder: "smtp.gmail.com",
    },
    {
      key: "port",
      label: "SMTP Port",
      type: "number",
      required: true,
      placeholder: "587",
    },
    { key: "secure", label: "Use TLS/SSL", type: "checkbox", required: false },
    {
      key: "username",
      label: "Username / Email",
      type: "text",
      required: false,
      placeholder: "your-email@gmail.com",
    },
    {
      key: "password",
      label: "Password / App Password",
      type: "password",
      required: false,
    },
    {
      key: "fromEmail",
      label: "From Email Address",
      type: "text",
      required: true,
      placeholder: "noreply@example.com",
    },
  ],
  sendgrid: [
    {
      key: "apiKey",
      label: "SendGrid API Key",
      type: "password",
      required: true,
    },
    {
      key: "fromEmail",
      label: "From Email Address",
      type: "text",
      required: true,
      placeholder: "noreply@example.com",
    },
  ],
  mailgun: [
    {
      key: "apiKey",
      label: "Mailgun API Key",
      type: "password",
      required: true,
    },
    {
      key: "domain",
      label: "Domain",
      type: "text",
      required: true,
      placeholder: "mail.example.com",
    },
    {
      key: "fromEmail",
      label: "From Email Address",
      type: "text",
      required: true,
      placeholder: "noreply@example.com",
    },
  ],
};

function EmailOptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: EmailOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full text-left rounded-xl border-2 p-5 transition-all duration-200",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/30 hover:bg-muted/50",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{option.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-foreground">{option.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {option.description}
              </p>
            </div>
            <div
              className={cn(
                "h-5 w-5 rounded-full border-2 shrink-0 mt-0.5",
                isSelected
                  ? "border-primary bg-primary"
                  : "border-border bg-background",
              )}
            />
          </div>
          <div className="mt-3 flex flex-col gap-1 text-xs">
            <p>
              <span className="text-muted-foreground">Pricing:</span>{" "}
              <span className="font-medium text-foreground">{option.cost}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Setup time:</span>{" "}
              <span className="font-medium text-foreground">
                {option.setupTime}
              </span>
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

function Inner() {
  const t = useTranslations("admin.email");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );
  const [testEmail, setTestEmail] = useState("");

  const [provider, setProvider] = useState<EmailProvider>("smtp");
  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: 587,
    secure: false,
    username: "",
    password: "",
    fromEmail: "",
  });
  const [sendgridConfig, setSendgridConfig] = useState({
    apiKey: "",
    fromEmail: "",
  });
  const [mailgunConfig, setMailgunConfig] = useState({
    apiKey: "",
    domain: "",
    fromEmail: "",
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGetAdminSettings();
      if (data.emailProvider) {
        setProvider(data.emailProvider);
      }
      if (data.smtpConfig) {
        setSmtpConfig(data.smtpConfig as typeof smtpConfig);
      }
      if (data.sendgridConfig) {
        setSendgridConfig(data.sendgridConfig as typeof sendgridConfig);
      }
      if (data.mailgunConfig) {
        setMailgunConfig(data.mailgunConfig as typeof mailgunConfig);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const save = async () => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const updateData: Partial<AdminSettings> = {
        emailProvider: provider,
      };

      if (provider === "smtp") {
        if (!smtpConfig.host || !smtpConfig.fromEmail) {
          throw new Error("Please fill in all required SMTP fields");
        }
        updateData.smtpConfig = smtpConfig;
      } else if (provider === "sendgrid") {
        if (!sendgridConfig.apiKey || !sendgridConfig.fromEmail) {
          throw new Error("Please fill in all required SendGrid fields");
        }
        updateData.sendgridConfig = sendgridConfig;
      } else if (provider === "mailgun") {
        if (
          !mailgunConfig.apiKey ||
          !mailgunConfig.domain ||
          !mailgunConfig.fromEmail
        ) {
          throw new Error("Please fill in all required Mailgun fields");
        }
        updateData.mailgunConfig = mailgunConfig;
      }

      await apiUpdateAdminSettings(updateData);
      setSuccess("Email settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setBusy(false);
    }
  };

  const testSmtp = async () => {
    if (!smtpConfig.host || !smtpConfig.fromEmail) {
      setError("Please fill in SMTP Host and From Email before testing");
      return;
    }
    if (!testEmail) {
      setError("Please enter a recipient email to send the test email");
      return;
    }

    setTestingSmtp(true);
    setError("");
    try {
      await apiFetch("/admin/settings/email/test-smtp", {
        method: "POST",
        body: JSON.stringify({
          ...smtpConfig,
          testEmail,
        }),
      });
      setSuccess(`✓ Test email sent to ${testEmail}! Check your inbox.`);
      setTimeout(() => setSuccess(""), 5000);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "SMTP test failed. Check your configuration.",
      );
    } finally {
      setTestingSmtp(false);
    }
  };

  const getCurrentConfig = () => {
    if (provider === "smtp") return smtpConfig;
    if (provider === "sendgrid") return sendgridConfig;
    if (provider === "mailgun") return mailgunConfig;
    return {};
  };

  const getCurrentFields = () => {
    return CONFIG_FIELDS[provider] || [];
  };

  const handleFieldChange = (key: string, value: unknown) => {
    if (provider === "smtp") {
      setSmtpConfig((prev) => ({ ...prev, [key]: value }));
    } else if (provider === "sendgrid") {
      setSendgridConfig((prev) => ({ ...prev, [key]: value }));
    } else if (provider === "mailgun") {
      setMailgunConfig((prev) => ({ ...prev, [key]: value }));
    }
  };

  const getFieldValue = (key: string) => {
    const config = getCurrentConfig();
    return (config as Record<string, unknown>)[key] ?? "";
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
      <PageHeader
        title={t("title", { defaultValue: "Email Settings" })}
        description={t("description", {
          defaultValue:
            "Configure your email provider for sending transactional emails.",
        })}
      />

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
        {/* Email Provider Selection */}
        <SectionCard
          icon={Mail}
          title={t("provider", { defaultValue: "Email Provider" })}
          description={t("providerDesc", {
            defaultValue: "Choose how you want to send emails",
          })}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {EMAIL_OPTIONS.map((option) => (
              <EmailOptionCard
                key={option.id}
                option={option}
                isSelected={provider === option.id}
                onSelect={() => {
                  setProvider(option.id);
                  setError("");
                }}
              />
            ))}
          </div>
        </SectionCard>

        {/* Configuration Fields - Dynamic */}
        <SectionCard
          icon={Mail}
          title={`${EMAIL_OPTIONS.find((o) => o.id === provider)?.name || "Email"} Configuration`}
          description={
            EMAIL_OPTIONS.find((o) => o.id === provider)?.description || ""
          }
        >
          <div className="space-y-4">
            {provider === "smtp" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3.5 flex gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-2">
                    {t("smtpGuide", {
                      defaultValue: "SMTP Provider Setup Guide:",
                    })}
                  </p>

                  <div className="mb-3 pb-3 border-b border-blue-200">
                    <p className="font-medium text-xs mb-1">📧 Gmail:</p>
                    <p className="text-xs mb-2">
                      1.{" "}
                      {t("gmailStep1", {
                        defaultValue: "Enable 2-Step Verification:",
                      })}{" "}
                      <a
                        href="https://myaccount.google.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        myaccount.google.com/security
                      </a>
                    </p>
                    <p className="text-xs mb-2">
                      2.{" "}
                      {t("gmailStep2", {
                        defaultValue: "Go to App Passwords:",
                      })}{" "}
                      <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        myaccount.google.com/apppasswords
                      </a>
                    </p>
                    <p className="text-xs mb-2">
                      3.{" "}
                      {t("gmailStep3", {
                        defaultValue: 'Select "Mail" and "Windows/Mac/Linux"',
                      })}
                    </p>
                    <p className="text-xs mb-2">
                      4.{" "}
                      {t("gmailStep4", {
                        defaultValue: "Copy the 16-character password",
                      })}
                    </p>
                    <p className="text-xs font-medium text-blue-800 bg-white/50 px-2 py-1 rounded">
                      • Host: smtp.gmail.com
                      <br />
                      • Port: 587
                      <br />
                      • Username: your-email@gmail.com
                      <br />
                      • Password: (paste the 16-char App Password)
                      <br />• Use TLS/SSL: ON
                    </p>
                  </div>

                  <div className="mb-2">
                    <p className="font-medium text-xs mb-1">🪣 SendGrid:</p>
                    <p className="text-xs">
                      {t("sendgridSetup", {
                        defaultValue:
                          'Host: smtp.sendgrid.net • Port: 587 • Username: "apikey" • Password: your-api-key',
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-xs mb-1">☁️ AWS SES:</p>
                    <p className="text-xs">
                      {t("sesSetup", {
                        defaultValue:
                          "Host: email-smtp.[region].amazonaws.com • Port: 587 • Use your SMTP credentials from AWS",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {getCurrentFields().map((field) => {
                const value = getFieldValue(field.key);
                const showPwd = showPasswords[field.key] || false;

                if (field.type === "checkbox") {
                  return (
                    <label
                      key={field.key}
                      className="flex items-center gap-3 cursor-pointer sm:col-span-2"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) =>
                          handleFieldChange(field.key, e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">{field.label}</span>
                    </label>
                  );
                }

                return (
                  <div key={field.key} className="space-y-1.5">
                    <label className="block text-sm font-medium">
                      {field.label}
                      {field.required && (
                        <span className="text-error ml-1">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        type={
                          field.type === "password" && !showPwd
                            ? "password"
                            : field.type === "number"
                              ? "number"
                              : "text"
                        }
                        className={cn(
                          adminInput,
                          field.type === "password" && "pr-10",
                        )}
                        value={String(value)}
                        onChange={(e) =>
                          handleFieldChange(field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                      />
                      {field.type === "password" && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((p) => ({
                              ...p,
                              [field.key]: !showPwd,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPwd ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* Test SMTP Button */}
        {provider === "smtp" && (
          <SectionCard
            icon={Zap}
            title={t("testEmail", { defaultValue: "Send Test Email" })}
            description={t("testEmailDesc", {
              defaultValue:
                "Send a test email to verify your SMTP configuration",
            })}
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 flex gap-3">
                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium mb-2">
                    {t("beforeTesting", { defaultValue: "Before Testing:" })}
                  </p>
                  <ul className="space-y-1 text-xs list-disc list-inside">
                    <li>
                      {t("testNote1", {
                        defaultValue:
                          "Fill in all SMTP fields (Host, Port, From Email, credentials)",
                      })}
                    </li>
                    <li>
                      {t("testNote2", {
                        defaultValue:
                          "For Gmail: use an App Password, not your regular password",
                      })}
                    </li>
                    <li>
                      {t("testNote3", {
                        defaultValue: "Ensure your credentials are correct",
                      })}
                    </li>
                  </ul>
                  <p className="font-medium mt-3 mb-1">
                    {t("whatDoes", { defaultValue: "What This Does:" })}
                  </p>
                  <p className="text-xs">
                    {t("whatDoesDesc", {
                      defaultValue:
                        "Connects to your SMTP server and sends an actual test email to verify everything works end-to-end.",
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium">
                  {t("sendTestTo", { defaultValue: "Send Test Email To" })}{" "}
                  <span className="text-error">*</span>
                </label>
                <Input
                  type="email"
                  className={adminInput}
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>

              <button
                onClick={testSmtp}
                disabled={testingSmtp}
                className="flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-500/90 disabled:bg-muted text-white px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 cursor-pointer"
              >
                {testingSmtp ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {testingSmtp
                  ? t("sending", { defaultValue: "Sending..." })
                  : t("sendTestEmail", { defaultValue: "Send Test Email" })}
              </button>
            </div>
          </SectionCard>
        )}
      </div>

      {/* Save Button */}
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
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-md shadow-primary/20"
        >
          {busy ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {busy
            ? t("saving", { defaultValue: "Saving..." })
            : t("saveSettings", { defaultValue: "Save Settings" })}
        </button>
      </div>
    </div>
  );
}

export function EmailSettingsView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
