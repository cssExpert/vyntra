"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { useRouter } from "next/navigation";
import {
  Save,
  Store,
  CreditCard,
  Truck,
  DollarSign,
  Bell,
  Cpu,
  CheckCircle2,
  Settings2,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MotionTabs, type MotionTabItem } from "@/components/ui/MotionTabs";
import { Input } from "@/components/ui/input";
import { PageSettingsPanel } from "@/components/common/PageSettingsPanel";
import { useAuth } from "@/providers/AuthProvider";
import { API_BASE, storePaymentSettings, type StripeSettings } from "@/lib/api";

const PAGE_SETTINGS_ROLES = ["ORG_ADMIN", "EDITOR"];

type TabId =
  | "general"
  | "payment"
  | "shipping"
  | "tax"
  | "notifications"
  | "ai";

const getTabs = (t: any): MotionTabItem<TabId>[] => [
  {
    id: "general",
    label: t("generalTab", { defaultValue: "General" }),
    icon: Store,
  },
  {
    id: "payment",
    label: t("paymentTab", { defaultValue: "Payment" }),
    icon: CreditCard,
  },
  {
    id: "shipping",
    label: t("shippingTab", { defaultValue: "Shipping" }),
    icon: Truck,
  },
  { id: "tax", label: t("taxTab", { defaultValue: "Tax" }), icon: DollarSign },
  {
    id: "notifications",
    label: t("notificationsTab", { defaultValue: "Notifications" }),
    icon: Bell,
  },
  {
    id: "ai",
    label: t("aiIntegrationsTab", { defaultValue: "AI & Integrations" }),
    icon: Cpu,
  },
];

const inputCls =
  "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelCls = "block text-xs font-semibold text-foreground mb-1";

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  defaultChecked,
  onChange,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => setOn((v) => { onChange?.(!v); return !v; })}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer",
          on ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200",
            on ? "left-4" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

function PaymentSettingsTab({ organizationId }: { organizationId: string }) {
  const [settings, setSettings] = useState<StripeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => {
    setLoading(true);
    storePaymentSettings
      .get()
      .then((s) => {
        setSettings(s);
        setEnabled(s.stripeEnabled);
        setTestMode(s.stripeTestMode);
        setPublishableKey(s.stripePublishableKey ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const webhookUrl = `${API_BASE}/store/webhooks/stripe/${organizationId}`;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const updated = await storePaymentSettings.update({
        stripeEnabled: enabled,
        stripeTestMode: testMode,
        stripePublishableKey: publishableKey,
        ...(secretKey && { stripeSecretKey: secretKey }),
        ...(webhookSecret && { stripeWebhookSecret: webhookSecret }),
      });
      setSettings(updated);
      setSecretKey("");
      setWebhookSecret("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Couldn't save Stripe settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      setTestResult(await storePaymentSettings.test());
    } catch (err) {
      setTestResult({ success: false, message: err instanceof Error ? err.message : "Test failed" });
    } finally {
      setTesting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Section title="Payment Gateways" description="Connect and configure your payment providers.">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </Section>
    );
  }

  return (
    <Section
      title="Payment Gateways"
      description="Each store connects its own Stripe account — customer payments go straight to you, not through a shared platform account."
    >
      <div className="flex items-center justify-between py-2 border-b border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Stripe</p>
          <p className="text-xs text-muted-foreground mt-0.5">Credit / Debit cards, Apple Pay, Google Pay</p>
        </div>
        <button
          onClick={() => setEnabled((v) => !v)}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer",
            enabled ? "bg-primary" : "bg-muted-foreground/30",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200",
              enabled ? "left-4" : "left-0.5",
            )}
          />
        </button>
      </div>

      <Toggle label="Test mode" description="Use Stripe test-mode keys before going live." defaultChecked={testMode} onChange={setTestMode} />

      <FieldGroup label="Publishable Key">
        <Input
          className={inputCls}
          value={publishableKey}
          onChange={(e) => setPublishableKey(e.target.value)}
          placeholder={testMode ? "pk_test_…" : "pk_live_…"}
        />
      </FieldGroup>
      <FieldGroup label="Secret Key">
        <Input
          className={inputCls}
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder={settings?.secretKeyConfigured ? "•••••••••••••••• (configured — leave blank to keep)" : (testMode ? "sk_test_…" : "sk_live_…")}
        />
      </FieldGroup>
      <FieldGroup label="Webhook Signing Secret">
        <Input
          className={inputCls}
          type="password"
          value={webhookSecret}
          onChange={(e) => setWebhookSecret(e.target.value)}
          placeholder={settings?.webhookSecretConfigured ? "•••••••••••••••• (configured — leave blank to keep)" : "whsec_…"}
        />
      </FieldGroup>

      <div className="space-y-1">
        <label className={labelCls}>Webhook URL</label>
        <p className="text-xs text-muted-foreground">Add this endpoint in your Stripe Dashboard → Developers → Webhooks.</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-sm border border-border bg-muted px-3 py-2 text-xs text-foreground overflow-x-auto whitespace-nowrap">
            {webhookUrl}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1 rounded-sm border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {saveError && <p className="text-xs text-destructive">{saveError}</p>}
      {testResult && (
        <p className={cn("text-xs", testResult.success ? "text-success" : "text-destructive")}>{testResult.message}</p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer disabled:opacity-50"
        >
          {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Stripe Settings"}
        </button>
        <button
          onClick={handleTest}
          disabled={testing || !settings?.secretKeyConfigured}
          className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer disabled:opacity-50"
        >
          {testing ? "Testing…" : "Test Connection"}
        </button>
      </div>
    </Section>
  );
}

export function StoreSettingsView() {
  const t = useTranslations("admin.store.settings");
  const isLoaded = usePageLoad(500);
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saved, setSaved]         = useState(false);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);

  const canManagePageSettings =
    !!user?.organizationId &&
    (user.superAdmin || user.roles.some((r) => PAGE_SETTINGS_ROLES.includes(r)));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-4">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="h-64 w-full rounded-xl bg-muted animate-pulse" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <PageHeader
            title={t("title", { defaultValue: "Store Settings" })}
            description={t("storeDescription", {
              defaultValue:
                "Configure your store's general settings, payments, shipping, and more.",
            })}
            breadcrumbs={[
              { label: t("store", { defaultValue: "Store" }), href: "/store" },
              { label: t("settings", { defaultValue: "Settings" }) },
            ]}
          >
            {canManagePageSettings && (
              <button
                onClick={() => setPageSettingsOpen(true)}
                className="flex items-center gap-1.5 rounded-sm border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Shop Page Settings
              </button>
            )}
            <button
              onClick={() => router.push("/store")}
              className="rounded-sm border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer"
            >
              {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              {saved ? "Saved!" : t("saveChanges", { defaultValue: "Save Changes" })}
            </button>
          </PageHeader>

          {canManagePageSettings && (
            <PageSettingsPanel
              open={pageSettingsOpen}
              onClose={() => setPageSettingsOpen(false)}
              pageType="product-listing"
              label="Product Listing"
              pagePath="/shop"
              companyId={user!.organizationId!}
              module="store"
            />
          )}

          <MotionTabs
            tabs={getTabs(t)}
            active={activeTab}
            onChange={setActiveTab}
            layoutId="store-settings-tab"
            className="w-fit"
          />

          {/* Tab content */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {activeTab === "general" && (
                <>
                  <Section title="Store Identity">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FieldGroup label="Store Name">
                        <Input
                          className={inputCls}
                          defaultValue="ERVFlow Store"
                        />
                      </FieldGroup>
                      <FieldGroup label="Store URL">
                        <Input
                          className={inputCls}
                          defaultValue="https://store.ervflow.com"
                        />
                      </FieldGroup>
                      <FieldGroup label="Support Email">
                        <Input
                          className={inputCls}
                          defaultValue="support@ervflow.com"
                        />
                      </FieldGroup>
                      <FieldGroup label="Currency">
                        <select className={inputCls}>
                          <option>USD — US Dollar</option>
                          <option>EUR — Euro</option>
                          <option>GBP — British Pound</option>
                        </select>
                      </FieldGroup>
                      <FieldGroup label="Country / Region">
                        <select className={inputCls}>
                          <option>United States</option>
                          <option>United Kingdom</option>
                          <option>European Union</option>
                        </select>
                      </FieldGroup>
                      <FieldGroup label="Timezone">
                        <select className={inputCls}>
                          <option>UTC-05:00 Eastern Time</option>
                          <option>UTC+00:00 London</option>
                        </select>
                      </FieldGroup>
                    </div>
                  </Section>
                  <Section title="Checkout Settings">
                    <Toggle
                      label="Guest checkout"
                      description="Allow customers to checkout without creating an account."
                      defaultChecked
                    />
                    <Toggle label="Require phone number" />
                    <Toggle label="Enable order notes" defaultChecked />
                    <Toggle
                      label="Terms & Conditions checkbox"
                      defaultChecked
                    />
                  </Section>
                </>
              )}

              {activeTab === "payment" && user?.organizationId && (
                <PaymentSettingsTab organizationId={user.organizationId} />
              )}

              {activeTab === "shipping" && (
                <Section
                  title="Shipping Methods"
                  description="Set up shipping zones, rates, and carriers."
                >
                  <Toggle label="Free shipping on orders over threshold" />
                  <FieldGroup label="Free Shipping Minimum ($)">
                    <Input
                      className={inputCls}
                      type="number"
                      defaultValue="50"
                    />
                  </FieldGroup>
                  <Toggle label="Flat rate shipping" defaultChecked />
                  <FieldGroup label="Flat Rate ($)">
                    <Input
                      className={inputCls}
                      type="number"
                      defaultValue="4.99"
                    />
                  </FieldGroup>
                  <Toggle label="Local pickup" />
                  <Toggle label="Real-time carrier rates (UPS / FedEx)" />
                </Section>
              )}

              {activeTab === "tax" && (
                <Section title="Tax Configuration">
                  <Toggle label="Enable tax calculation" defaultChecked />
                  <Toggle label="Prices include tax (display)" />
                  <Toggle label="Charge tax on shipping" />
                  <FieldGroup label="Default Tax Rate (%)">
                    <Input
                      className={inputCls}
                      type="number"
                      defaultValue="9"
                    />
                  </FieldGroup>
                </Section>
              )}

              {activeTab === "notifications" && (
                <Section title="Email Notifications">
                  <Toggle
                    label="New order notification to admin"
                    defaultChecked
                  />
                  <Toggle
                    label="Order confirmation to customer"
                    defaultChecked
                  />
                  <Toggle
                    label="Shipping confirmation to customer"
                    defaultChecked
                  />
                  <Toggle
                    label="Refund notification to customer"
                    defaultChecked
                  />
                  <Toggle label="Low stock alert to admin" defaultChecked />
                  <Toggle
                    label="Abandoned cart recovery email"
                    defaultChecked
                  />
                </Section>
              )}

              {activeTab === "ai" && (
                <Section
                  title="AI Assistant"
                  description="Connect your AI provider to enable the Store AI Assistant."
                >
                  <FieldGroup label="Anthropic API Key">
                    <Input
                      className={inputCls}
                      type="password"
                      placeholder="sk-ant-…"
                    />
                  </FieldGroup>
                  <FieldGroup label="Default AI Model">
                    <select className={inputCls}>
                      <option>claude-sonnet-4-6</option>
                      <option>claude-opus-4-8</option>
                      <option>claude-haiku-4-5-20251001</option>
                    </select>
                  </FieldGroup>
                  <Toggle
                    label="AI product description generation"
                    defaultChecked
                  />
                  <Toggle label="AI order fraud detection" defaultChecked />
                  <Toggle label="AI customer segmentation" />
                </Section>
              )}
            </motion.div>
            <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
              <p className="text-xs text-muted-foreground hidden sm:block">
                Unsaved changes will be lost if you navigate away.
              </p>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => router.push("/store")}
                  className="rounded-sm border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button onClick={handleSave} className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-all cursor-pointer">
                  {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </div>
            </div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
