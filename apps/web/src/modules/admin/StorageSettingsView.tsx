"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  HardDrive,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  Zap,
  CloudUpload,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { AdminGuard, adminInput } from "./AdminGuard";
import { cn } from "@/lib/utils";
import { useStorageSettings } from "@/lib/hooks/useStorageSettings";
import {
  apiGetAdminSettings,
  apiUpdateAdminSettings,
  apiMigrateStorageToCloud,
  type AdminSettings,
  type StorageMigrationReport,
  API_BASE,
} from "@/lib/api";

type StorageProvider = "local" | "s3" | "uploadthing" | "vercel-blob";

interface StorageOption {
  id: StorageProvider;
  name: string;
  description: string;
  cost: string;
  icon: string;
  bestFor: string;
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "password" | "number";
    required: boolean;
    placeholder?: string;
    description?: string;
  }>;
}

const STORAGE_OPTIONS: StorageOption[] = [
  {
    id: "local",
    name: "Local Filesystem",
    description: "Store files directly on your server",
    cost: "Free - Self-hosted",
    icon: "📁",
    bestFor: "Development & small deployments",
    fields: [
      {
        key: "path",
        label: "Upload Directory Path",
        type: "text",
        required: false,
        placeholder: "/uploads",
        description: "Relative path where files will be stored",
      },
    ],
  },
  {
    id: "s3",
    name: "AWS S3 (or Compatible)",
    description:
      "Scalable cloud storage with AWS S3 or compatible services (DigitalOcean Spaces, MinIO)",
    cost: "Pay-as-you-go ($0.023/GB)",
    icon: "🪣",
    bestFor: "Production deployments with high scalability",
    fields: [
      {
        key: "bucket",
        label: "S3 Bucket Name",
        type: "text",
        required: true,
        placeholder: "my-bucket",
        description: "The name of your S3 bucket",
      },
      {
        key: "region",
        label: "AWS Region",
        type: "text",
        required: true,
        placeholder: "us-east-1",
        description: "e.g., us-east-1, eu-west-1, ap-south-1",
      },
      {
        key: "accessKeyId",
        label: "Access Key ID",
        type: "password",
        required: true,
        description: "Your AWS IAM access key",
      },
      {
        key: "secretAccessKey",
        label: "Secret Access Key",
        type: "password",
        required: true,
        description: "Your AWS IAM secret key",
      },
    ],
  },
  {
    id: "uploadthing",
    name: "Uploadthing",
    description: "Modern file upload service with built-in image optimization",
    cost: "Free tier + $10-99/month",
    icon: "☁️",
    bestFor: "Ease of use with managed infrastructure",
    fields: [
      {
        key: "apiKey",
        label: "Uploadthing Token (UPLOADTHING_TOKEN)",
        type: "password",
        required: true,
        description:
          'Paste the UPLOADTHING_TOKEN from the "SDK v7+" Quick Copy box (starts with "eyJ"). Do NOT use the sk_live_ secret key.',
      },
    ],
  },
  {
    id: "vercel-blob",
    name: "Vercel Blob",
    description: "Simple blob storage from Vercel - perfect if on Vercel",
    cost: "$5/month + usage",
    icon: "⚡",
    bestFor: "Vercel deployments with minimal setup",
    fields: [
      {
        key: "token",
        label: "Vercel Blob Token",
        type: "password",
        required: true,
        description: "Create a token in your Vercel project settings",
      },
    ],
  },
];

function StorageOptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: StorageOption;
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
              <span className="text-muted-foreground">Best for:</span>{" "}
              <span className="text-foreground">{option.bestFor}</span>
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
  field: StorageOption["fields"][0];
  value: string;
  onChange: (val: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
}) {
  const isPasswordField = field.type === "password";

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {field.label}
        {field.required && <span className="text-error ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPasswordField && !showPassword ? "password" : "text"}
          className={cn(adminInput, isPasswordField && "pr-10")}
          value={value}
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
  const t = useTranslations("admin.storage");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [testingStorage, setTestingStorage] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testError, setTestError] = useState("");
  const [migrating, setMigrating] = useState(false);
  const [migrationReport, setMigrationReport] =
    useState<StorageMigrationReport | null>(null);
  const [migrationError, setMigrationError] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );
  const { refreshSettings } = useStorageSettings();

  const [provider, setProvider] = useState<StorageProvider>("local");
  const [s3Config, setS3Config] = useState({
    bucket: "",
    region: "us-east-1",
    accessKeyId: "",
    secretAccessKey: "",
  });
  const [uploadthingConfig, setUploadthingConfig] = useState({
    apiKey: "",
  });
  const [vercelBlobConfig, setVercelBlobConfig] = useState({
    token: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiGetAdminSettings();
      if (data.storageProvider) {
        setProvider(data.storageProvider);
      }
      if (data.s3Config) {
        setS3Config(data.s3Config);
      }
      if (data.uploadthingConfig) {
        setUploadthingConfig(data.uploadthingConfig);
      }
      if (data.vercelBlobConfig) {
        setVercelBlobConfig(data.vercelBlobConfig);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const testStorage = async () => {
    setTestingStorage(true);
    setTestMessage("");
    setTestError("");
    try {
      type StorageTestConfig = {
        provider: StorageProvider;
        s3Config?: typeof s3Config;
        uploadthingConfig?: typeof uploadthingConfig;
        vercelBlobConfig?: typeof vercelBlobConfig;
      };
      const testConfig: StorageTestConfig = { provider };

      if (provider === "s3") {
        if (!s3Config.bucket || !s3Config.region) {
          throw new Error("Please fill in all required S3 fields");
        }
        testConfig.s3Config = s3Config;
      } else if (provider === "uploadthing") {
        if (!uploadthingConfig.apiKey) {
          throw new Error("Please enter your Uploadthing API key");
        }
        testConfig.uploadthingConfig = uploadthingConfig;
      } else if (provider === "vercel-blob") {
        if (!vercelBlobConfig.token) {
          throw new Error("Please enter your Vercel Blob token");
        }
        testConfig.vercelBlobConfig = vercelBlobConfig;
      }

      const response = await fetch(`${API_BASE}/admin/settings/storage/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testConfig),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Connection test failed");
      }

      const data = await response.json();
      setTestMessage(data.message);
      setTimeout(() => setTestMessage(""), 5000);
    } catch (e) {
      setTestError(e instanceof Error ? e.message : "Connection test failed");
      setTimeout(() => setTestError(""), 5000);
    } finally {
      setTestingStorage(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const updateData: Partial<AdminSettings> = {
        storageProvider: provider,
      };

      if (provider === "s3") {
        if (!s3Config.bucket || !s3Config.region) {
          throw new Error("Please fill in all required S3 fields");
        }
        updateData.s3Config = s3Config;
      } else if (provider === "uploadthing") {
        if (!uploadthingConfig.apiKey) {
          throw new Error("Please enter your Uploadthing API key");
        }
        updateData.uploadthingConfig = uploadthingConfig;
      } else if (provider === "vercel-blob") {
        if (!vercelBlobConfig.token) {
          throw new Error("Please enter your Vercel Blob token");
        }
        updateData.vercelBlobConfig = vercelBlobConfig;
      }

      await apiUpdateAdminSettings(updateData);
      refreshSettings();
      setSuccess("Storage settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setBusy(false);
    }
  };

  const migrate = async () => {
    setMigrating(true);
    setMigrationError("");
    setMigrationReport(null);
    try {
      const report = await apiMigrateStorageToCloud();
      setMigrationReport(report);
    } catch (e) {
      setMigrationError(e instanceof Error ? e.message : "Migration failed");
    } finally {
      setMigrating(false);
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
        title={t("title", { defaultValue: "Storage Settings" })}
        description={t("description", {
          defaultValue:
            "Configure where files and media are stored for your application.",
        })}
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
          icon={HardDrive}
          title={t("provider", { defaultValue: "Storage Provider" })}
          description={t("providerDesc", {
            defaultValue: "Choose where you want to store files and media",
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {STORAGE_OPTIONS.map((option) => (
              <StorageOptionCard
                key={option.id}
                option={option}
                isSelected={provider === option.id}
                onSelect={() => setProvider(option.id)}
              />
            ))}
          </div>
        </SectionCard>

        {/* ── Provider Configuration ────────────────────────────────────── */}
        {provider === "s3" && (
          <SectionCard
            icon={HardDrive}
            title="AWS S3 Configuration"
            description="Scalable cloud storage configuration for AWS S3 or compatible services like DigitalOcean Spaces and MinIO. Set up your S3 bucket, region, and access keys for reliable file storage and management. Perfect for production deployments with high scalability needs."
          >
            <div className="space-y-4">
              {testMessage && (
                <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {testMessage}
                </div>
              )}
              {testError && (
                <div className="flex items-center gap-2.5 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {testError}
                </div>
              )}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3.5 flex gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Getting AWS Credentials:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>
                      Go to{" "}
                      <a
                        href="https://console.aws.amazon.com/iam"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold"
                      >
                        AWS IAM Console
                      </a>
                    </li>
                    <li>Create a new user or use existing one</li>
                    <li>
                      Attach policy: AmazonS3FullAccess (or customize S3
                      permissions)
                    </li>
                    <li>Generate Access Key ID and Secret Access Key</li>
                    <li>
                      Create S3 bucket in the console or via CLI with{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        aws s3 mb s3://my-bucket --region us-east-1
                      </code>
                    </li>
                  </ol>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ConfigField
                  field={
                    STORAGE_OPTIONS[1].fields.find((f) => f.key === "bucket")!
                  }
                  value={s3Config.bucket}
                  onChange={(v) => setS3Config((p) => ({ ...p, bucket: v }))}
                  showPassword={false}
                  onTogglePassword={() => {}}
                />
                <ConfigField
                  field={
                    STORAGE_OPTIONS[1].fields.find((f) => f.key === "region")!
                  }
                  value={s3Config.region}
                  onChange={(v) => setS3Config((p) => ({ ...p, region: v }))}
                  showPassword={false}
                  onTogglePassword={() => {}}
                />
              </div>

              <ConfigField
                field={
                  STORAGE_OPTIONS[1].fields.find(
                    (f) => f.key === "accessKeyId",
                  )!
                }
                value={s3Config.accessKeyId}
                onChange={(v) => setS3Config((p) => ({ ...p, accessKeyId: v }))}
                showPassword={!showPasswords["accessKeyId"]}
                onTogglePassword={() =>
                  setShowPasswords((p) => ({
                    ...p,
                    accessKeyId: !p["accessKeyId"],
                  }))
                }
              />

              <ConfigField
                field={
                  STORAGE_OPTIONS[1].fields.find(
                    (f) => f.key === "secretAccessKey",
                  )!
                }
                value={s3Config.secretAccessKey}
                onChange={(v) =>
                  setS3Config((p) => ({ ...p, secretAccessKey: v }))
                }
                showPassword={!showPasswords["secretAccessKey"]}
                onTogglePassword={() =>
                  setShowPasswords((p) => ({
                    ...p,
                    secretAccessKey: !p["secretAccessKey"],
                  }))
                }
              />
              <button
                onClick={testStorage}
                disabled={testingStorage}
                className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition disabled:opacity-50"
              >
                {testingStorage ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {testingStorage ? "Testing…" : "Test Connection"}
              </button>
            </div>
          </SectionCard>
        )}

        {provider === "uploadthing" && (
          <SectionCard
            icon={HardDrive}
            title="Uploadthing Configuration"
            description="Modern file upload service configuration for Uploadthing. Easily set up your Uploadthing API key to leverage their managed infrastructure, built-in image optimization, and seamless file handling. Ideal for developers seeking a hassle-free cloud storage solution with a user-friendly interface and robust performance."
          >
            <div className="space-y-4">
              {testMessage && (
                <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {testMessage}
                </div>
              )}
              {testError && (
                <div className="flex items-center gap-2.5 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {testError}
                </div>
              )}
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3.5 flex gap-3">
                <Info className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-sm text-purple-700">
                  <p className="font-medium mb-1">Getting Your Token:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>
                      Sign up or log in at{" "}
                      <a
                        href="https://uploadthing.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold"
                      >
                        uploadthing.com
                      </a>
                    </li>
                    <li>Open your app, then go to API Keys</li>
                    <li>
                      In the Quick Copy box, select the{" "}
                      <span className="font-semibold">SDK v7+</span> tab
                    </li>
                    <li>
                      Copy the{" "}
                      <code className="bg-purple-100 px-1 rounded">
                        UPLOADTHING_TOKEN
                      </code>{" "}
                      value (starts with{" "}
                      <code className="bg-purple-100 px-1 rounded">eyJ</code>)
                    </li>
                    <li>
                      Paste it below — do{" "}
                      <span className="font-semibold">not</span> use the
                      sk_live_ secret key
                    </li>
                  </ol>
                </div>
              </div>

              <ConfigField
                field={
                  STORAGE_OPTIONS[2].fields.find((f) => f.key === "apiKey")!
                }
                value={uploadthingConfig.apiKey}
                onChange={(v) =>
                  setUploadthingConfig((p) => ({ ...p, apiKey: v }))
                }
                showPassword={!showPasswords["uploadthingApiKey"]}
                onTogglePassword={() =>
                  setShowPasswords((p) => ({
                    ...p,
                    uploadthingApiKey: !p["uploadthingApiKey"],
                  }))
                }
              />
              <button
                onClick={testStorage}
                disabled={testingStorage}
                className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition disabled:opacity-50"
              >
                {testingStorage ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {testingStorage ? "Testing…" : "Test Connection"}
              </button>
            </div>
          </SectionCard>
        )}

        {provider === "vercel-blob" && (
          <SectionCard
            icon={HardDrive}
            title="Vercel Blob Configuration"
            description="Simple blob storage configuration for Vercel Blob. Set up your Vercel Blob token to easily store files and media directly within your Vercel deployment. Perfect for developers hosting on Vercel who want a straightforward, integrated storage solution without the need for external cloud providers."
          >
            <div className="space-y-4">
              {testMessage && (
                <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {testMessage}
                </div>
              )}
              {testError && (
                <div className="flex items-center gap-2.5 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {testError}
                </div>
              )}
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3.5 flex gap-3">
                <Info className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                <div className="text-sm text-cyan-700">
                  <p className="font-medium mb-1">Getting Your Token:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>
                      Go to your{" "}
                      <a
                        href="https://vercel.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold"
                      >
                        Vercel Dashboard
                      </a>
                    </li>
                    <li>Select your project</li>
                    <li>Go to Settings → Storage</li>
                    <li>Create a Blob store if you haven&apos;t already</li>
                    <li>Copy the token from the Token section</li>
                  </ol>
                </div>
              </div>

              <ConfigField
                field={
                  STORAGE_OPTIONS[3].fields.find((f) => f.key === "token")!
                }
                value={vercelBlobConfig.token}
                onChange={(v) =>
                  setVercelBlobConfig((p) => ({ ...p, token: v }))
                }
                showPassword={!showPasswords["vercelBlobToken"]}
                onTogglePassword={() =>
                  setShowPasswords((p) => ({
                    ...p,
                    vercelBlobToken: !p["vercelBlobToken"],
                  }))
                }
              />
              <button
                onClick={testStorage}
                disabled={testingStorage}
                className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition disabled:opacity-50"
              >
                {testingStorage ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {testingStorage ? "Testing…" : "Test Connection"}
              </button>
            </div>
          </SectionCard>
        )}

        {provider === "local" && (
          <SectionCard
            icon={HardDrive}
            title="Local Storage Configuration"
            description="Files will be stored on your server's filesystem. Make sure to set the upload directory path and ensure it has sufficient space. Remember to include it in your backups!"
          >
            <div className="space-y-4">
              {testMessage && (
                <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {testMessage}
                </div>
              )}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 flex gap-3">
                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium mb-1">Local Storage Notes:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Files are stored on your server&apos;s filesystem</li>
                    <li>Good for development and small deployments</li>
                    <li>
                      For production, ensure the upload directory has sufficient
                      space
                    </li>
                    <li>
                      Backups should include the upload directory to avoid data
                      loss
                    </li>
                    <li>
                      For horizontally scaled deployments, use a cloud provider
                      instead
                    </li>
                  </ul>
                </div>
              </div>
              <button
                onClick={testStorage}
                disabled={testingStorage}
                className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition disabled:opacity-50"
              >
                {testingStorage ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {testingStorage ? "Testing…" : "Test Connection"}
              </button>
            </div>
          </SectionCard>
        )}

        {/* ── Migrate local files to cloud ──────────────────────────────── */}
        {provider !== "local" && (
          <SectionCard
            icon={CloudUpload}
            title="Migrate Local Files to Cloud"
            description="Move images already stored on the local server to your selected cloud provider and update all references to use the new cloud URLs. Local files are kept as a backup — nothing is deleted."
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3.5 flex gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Before you migrate:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>
                      Make sure you have <strong>saved</strong> and{" "}
                      <strong>tested</strong> your cloud provider above.
                    </li>
                    <li>
                      Every image currently served from{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        /uploads/
                      </code>{" "}
                      will be re-uploaded to {provider}.
                    </li>
                    <li>
                      Database references (logos, favicons, media, theme
                      thumbnails) are updated to the new cloud URLs.
                    </li>
                    <li>Local copies remain on disk until you remove them.</li>
                  </ul>
                </div>
              </div>

              {migrationError && (
                <div className="flex items-center gap-2.5 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {migrationError}
                </div>
              )}

              {migrationReport && (
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 font-medium text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      {migrationReport.migrated} migrated
                    </span>
                    {migrationReport.failed > 0 && (
                      <span className="flex items-center gap-1.5 font-medium text-error">
                        <AlertCircle className="h-4 w-4" />
                        {migrationReport.failed} failed
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      {migrationReport.total} total · provider:{" "}
                      {migrationReport.provider}
                    </span>
                  </div>

                  {migrationReport.total === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No local files found to migrate — everything is already on
                      the cloud.
                    </p>
                  )}

                  {migrationReport.details.length > 0 && (
                    <div className="max-h-60 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                      {migrationReport.details.map((d, i) => (
                        <div key={i} className="px-3 py-2 text-xs">
                          <div className="flex items-center gap-2">
                            {d.error ? (
                              <AlertCircle className="h-3.5 w-3.5 text-error shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                            )}
                            <span className="font-medium text-foreground">
                              {d.model}.{d.field}
                            </span>
                          </div>
                          {d.error ? (
                            <p className="text-error mt-0.5 break-all">
                              {d.error}
                            </p>
                          ) : (
                            <p className="text-muted-foreground mt-0.5 break-all">
                              {d.to}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={migrate}
                disabled={migrating}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
              >
                {migrating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <CloudUpload className="h-4 w-4" />
                )}
                {migrating ? "Migrating…" : `Migrate to ${provider}`}
              </button>
            </div>
          </SectionCard>
        )}
      </div>

      {/* ── Sticky save bar ─────────────────────────────────────────────── */}
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

export function StorageSettingsView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
