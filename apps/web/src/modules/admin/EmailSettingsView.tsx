"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { AdminGuard, adminInput } from "./AdminGuard";
import { cn } from "@/lib/utils";
import {
  apiGetAdminSettings,
  apiUpdateAdminSettings,
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
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "password" | "number";
    required: boolean;
    placeholder?: string;
    description?: string;
  }>;
}

const EMAIL_OPTIONS: EmailOption[] = [
  {
    id: "smtp",
    name: "SMTP Server",
    description: "Use any SMTP provider (Gmail, SendGrid, custom server)",
    icon: "📧",
    cost: "Variable - depends on provider",
    setupTime: "5 min",
    fields: [
      {
        key: "host",
        label: "SMTP Host",
        type: "text",
        required: true,
        placeholder: "smtp.gmail.com",
        description: "SMTP server address",
      },
      {
        key: "port",
        label: "SMTP Port",
        type: "number",
        required: true,
        placeholder: "587",
        description: "Usually 587 (TLS) or 465 (SSL)",
      },
      {
        key: "secure",
        label: "Use TLS/SSL",
        type: "text",
        required: false,
        description: "Enable secure connection",
      },
      {
        key: "username",
        label: "Username / Email",
        type: "text",
        required: false,
        placeholder: "your-email@gmail.com",
        description: "SMTP authentication username",
      },
      {
        key: "password",
        label: "Password / App Password",
        type: "password",
        required: false,
        description: "SMTP authentication password",
      },
      {
        key: "fromEmail",
        label: "From Email Address",
        type: "text",
        required: true,
        placeholder: "noreply@example.com",
        description: "Email address that appears as sender",
      },
    ],
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Professional email delivery service with great reliability",
    icon: "📬",
    cost: "Free - $100/month",
    setupTime: "2 min",
    fields: [
      {
        key: "apiKey",
        label: "SendGrid API Key",
        type: "password",
        required: true,
        description: "Get from SendGrid dashboard → Settings → API Keys",
      },
      {
        key: "fromEmail",
        label: "From Email Address",
        type: "text",
        required: true,
        placeholder: "noreply@example.com",
        description: "Must be a verified sender in SendGrid",
      },
    ],
  },
  {
    id: "mailgun",
    name: "Mailgun",
    description: "Developer-friendly email API with great documentation",
    icon: "📨",
    cost: "Free - Custom pricing",
    setupTime: "3 min",
    fields: [
      {
        key: "apiKey",
        label: "Mailgun API Key",
        type: "password",
        required: true,
        description: "Get from Mailgun dashboard → API Security",
      },
      {
        key: "domain",
        label: "Domain",
        type: "text",
        required: true,
        placeholder: "mail.example.com",
        description: "Your Mailgun domain",
      },
      {
        key: "fromEmail",
        label: "From Email Address",
        type: "text",
        required: true,
        placeholder: "noreply@example.com",
        description: "Must be from your Mailgun domain",
      },
    ],
  },
];

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

function ConfigField({
  field,
  value,
  onChange,
  showPassword,
  onTogglePassword,
}: {
  field: EmailOption["fields"][0];
  value: string | boolean;
  onChange: (val: string | boolean) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
}) {
  const isPasswordField = field.type === "password";
  const isCheckbox = field.key === "secure";

  if (isCheckbox) {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4"
        />
        <div>
          <p className="text-sm font-medium">{field.label}</p>
          {field.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {field.description}
            </p>
          )}
        </div>
      </label>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {field.label}
        {field.required && <span className="text-error ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={
            isPasswordField && !showPassword
              ? "password"
              : field.type === "number"
                ? "number"
                : "text"
          }
          className={cn(adminInput, isPasswordField && "pr-10")}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
}

function Inner() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );

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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiGetAdminSettings();
      if (data.emailProvider) {
        setProvider(data.emailProvider);
      }
      if (data.smtpConfig) {
        setSmtpConfig(data.smtpConfig);
      }
      if (data.sendgridConfig) {
        setSendgridConfig(data.sendgridConfig);
      }
      if (data.mailgunConfig) {
        setMailgunConfig(data.mailgunConfig);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Email Settings"
        description="Configure your email provider for sending transactional emails."
      />

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
        {/* ── Select Provider ─────────────────────────────────────────────── */}
        <SectionCard
          icon={Mail}
          title="Email Provider"
          description="Choose how you want to send emails"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {EMAIL_OPTIONS.map((option) => (
              <EmailOptionCard
                key={option.id}
                option={option}
                isSelected={provider === option.id}
                onSelect={() => setProvider(option.id)}
              />
            ))}
          </div>
        </SectionCard>

        {/* ── SMTP Configuration ──────────────────────────────────────────── */}
        {provider === "smtp" && (
          <SectionCard
            icon={Mail}
            title="SMTP Configuration"
            description="Flexible SMTP configuration for custom email servers, secure authentication, and reliable transactional email delivery."
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3.5 flex gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Common SMTP Providers:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>
                      <strong>Gmail:</strong> smtp.gmail.com, port 587, use{" "}
                      <a
                        href="https://support.google.com/accounts/answer/185833"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        App Password
                      </a>
                    </li>
                    <li>
                      <strong>SendGrid SMTP:</strong> smtp.sendgrid.net, port
                      587, username &quot;apikey&quot;
                    </li>
                    <li>
                      <strong>AWS SES:</strong>{" "}
                      email-smtp.[region].amazonaws.com, port 587
                    </li>
                    <li>
                      <strong>Mailgun SMTP:</strong> smtp.mailgun.org, port 587
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ConfigField
                  field={EMAIL_OPTIONS[0].fields.find((f) => f.key === "host")!}
                  value={smtpConfig.host}
                  onChange={(v) =>
                    setSmtpConfig((p) => ({ ...p, host: String(v) }))
                  }
                  showPassword={false}
                  onTogglePassword={() => {}}
                />
                <ConfigField
                  field={EMAIL_OPTIONS[0].fields.find((f) => f.key === "port")!}
                  value={smtpConfig.port}
                  onChange={(v) =>
                    setSmtpConfig((p) => ({
                      ...p,
                      port: parseInt(String(v)),
                    }))
                  }
                  showPassword={false}
                  onTogglePassword={() => {}}
                />
              </div>

              <ConfigField
                field={EMAIL_OPTIONS[0].fields.find((f) => f.key === "secure")!}
                value={smtpConfig.secure}
                onChange={(v) =>
                  setSmtpConfig((p) => ({ ...p, secure: Boolean(v) }))
                }
                showPassword={false}
                onTogglePassword={() => {}}
              />

              <ConfigField
                field={
                  EMAIL_OPTIONS[0].fields.find((f) => f.key === "username")!
                }
                value={smtpConfig.username}
                onChange={(v) =>
                  setSmtpConfig((p) => ({ ...p, username: String(v) }))
                }
                showPassword={false}
                onTogglePassword={() => {}}
              />

              <ConfigField
                field={
                  EMAIL_OPTIONS[0].fields.find((f) => f.key === "password")!
                }
                value={smtpConfig.password}
                onChange={(v) =>
                  setSmtpConfig((p) => ({ ...p, password: String(v) }))
                }
                showPassword={!showPasswords["smtpPassword"]}
                onTogglePassword={() =>
                  setShowPasswords((p) => ({
                    ...p,
                    smtpPassword: !p["smtpPassword"],
                  }))
                }
              />

              <ConfigField
                field={
                  EMAIL_OPTIONS[0].fields.find((f) => f.key === "fromEmail")!
                }
                value={smtpConfig.fromEmail}
                onChange={(v) =>
                  setSmtpConfig((p) => ({ ...p, fromEmail: String(v) }))
                }
                showPassword={false}
                onTogglePassword={() => {}}
              />
            </div>
          </SectionCard>
        )}

        {/* ── SendGrid Configuration ────────────────────────────────────── */}
        {provider === "sendgrid" && (
          <SectionCard
            icon={Mail}
            title="SendGrid Configuration"
            description="Complete SendGrid configuration for reliable email delivery, transactional messaging, SMTP integration, and advanced email automation."
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3.5 flex gap-3">
                <Info className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                <div className="text-sm text-cyan-700">
                  <p className="font-medium mb-1">Getting Your API Key:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>
                      Go to{" "}
                      <a
                        href="https://app.sendgrid.com/settings/api_keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold"
                      >
                        SendGrid API Keys
                      </a>
                    </li>
                    <li>Click &quot;Create API Key&quot;</li>
                    <li>
                      Give it a name and select &quot;Full Access&quot; or restrict scopes
                    </li>
                    <li>Copy the key and paste it below</li>
                    <li>
                      Verify sender email in Settings → Sender Authentication
                    </li>
                  </ol>
                </div>
              </div>

              <ConfigField
                field={EMAIL_OPTIONS[1].fields.find((f) => f.key === "apiKey")!}
                value={sendgridConfig.apiKey}
                onChange={(v) =>
                  setSendgridConfig((p) => ({ ...p, apiKey: String(v) }))
                }
                showPassword={!showPasswords["sendgridApiKey"]}
                onTogglePassword={() =>
                  setShowPasswords((p) => ({
                    ...p,
                    sendgridApiKey: !p["sendgridApiKey"],
                  }))
                }
              />

              <ConfigField
                field={
                  EMAIL_OPTIONS[1].fields.find((f) => f.key === "fromEmail")!
                }
                value={sendgridConfig.fromEmail}
                onChange={(v) =>
                  setSendgridConfig((p) => ({ ...p, fromEmail: String(v) }))
                }
                showPassword={false}
                onTogglePassword={() => {}}
              />
            </div>
          </SectionCard>
        )}

        {/* ── Mailgun Configuration ──────────────────────────────────────── */}
        {provider === "mailgun" && (
          <SectionCard
            icon={Mail}
            title="Mailgun Configuration"
            description="Professional Mailgun configuration for secure email delivery, transactional automation, SMTP setup, and improved inbox performance."
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3.5 flex gap-3">
                <Info className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-sm text-orange-700">
                  <p className="font-medium mb-1">Getting Your Credentials:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>
                      Go to{" "}
                      <a
                        href="https://app.mailgun.com/app/account/security/api_keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold"
                      >
                        Mailgun API Security
                      </a>
                    </li>
                    <li>Copy your Private API Key</li>
                    <li>
                      Get your domain from Domains page (e.g., mg.example.com)
                    </li>
                    <li>Verify your domain if using custom domain</li>
                  </ol>
                </div>
              </div>

              <ConfigField
                field={EMAIL_OPTIONS[2].fields.find((f) => f.key === "apiKey")!}
                value={mailgunConfig.apiKey}
                onChange={(v) =>
                  setMailgunConfig((p) => ({ ...p, apiKey: String(v) }))
                }
                showPassword={!showPasswords["mailgunApiKey"]}
                onTogglePassword={() =>
                  setShowPasswords((p) => ({
                    ...p,
                    mailgunApiKey: !p["mailgunApiKey"],
                  }))
                }
              />

              <ConfigField
                field={EMAIL_OPTIONS[2].fields.find((f) => f.key === "domain")!}
                value={mailgunConfig.domain}
                onChange={(v) =>
                  setMailgunConfig((p) => ({ ...p, domain: String(v) }))
                }
                showPassword={false}
                onTogglePassword={() => {}}
              />

              <ConfigField
                field={
                  EMAIL_OPTIONS[2].fields.find((f) => f.key === "fromEmail")!
                }
                value={mailgunConfig.fromEmail}
                onChange={(v) =>
                  setMailgunConfig((p) => ({ ...p, fromEmail: String(v) }))
                }
                showPassword={false}
                onTogglePassword={() => {}}
              />
            </div>
          </SectionCard>
        )}
      </div>

      {/* ── Sticky save bar ─────────────────────────────────────────────── */}
      <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
        <p className="text-xs text-muted-foreground">
          {success ? (
            <span className="flex items-center gap-1.5 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </span>
          ) : (
            "Unsaved changes will be lost if you navigate away."
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
          {busy ? "Saving..." : "Save Settings"}
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
