"use client";

import { useEffect, useState } from "react";
import { Globe, CheckCircle2, AlertCircle, Key, Palette, Sun, Moon, Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { cn } from "@/lib/utils";
import { orgDomain, type OrgDomain, type DnsInfo, apiGetOrgSettings, apiUpdateOrgSettings } from "@/lib/api";
import { ImageUploadWithStorage } from "@/components/common/ImageUploadWithStorage";
import { useAuth } from "@/providers/AuthProvider";

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
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
      title="Copy"
    >
      {copied ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
      ) : (
        <Key className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ── Domain Tab ────────────────────────────────────────────────────────────────

function DomainTab() {
  const [domain, setDomain] = useState<OrgDomain | null>(null);
  const [dns, setDns] = useState<DnsInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [d, dnsData] = await Promise.all([
          orgDomain.get(),
          orgDomain.dnsInfo(),
        ]);
        setDomain(d);
        setDns(dnsData);
        setCustomInput(d.customDomain ?? "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load domain info");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const flash = (msg: string, isErr = false) => {
    if (isErr) { setError(msg); setTimeout(() => setError(""), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
  };

  const save = async () => {
    if (!customInput.trim()) return clear();
    setBusy(true);
    try {
      const updated = await orgDomain.setCustom(customInput.trim().toLowerCase());
      setDomain(updated);
      const dnsData = await orgDomain.dnsInfo();
      setDns(dnsData);
      flash("Custom domain saved. Add the DNS records below, then verify.");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Failed to save", true);
    } finally { setBusy(false); }
  };

  const clear = async () => {
    setBusy(true);
    try {
      const updated = await orgDomain.clearCustom();
      setDomain(updated);
      setCustomInput("");
      const dnsData = await orgDomain.dnsInfo();
      setDns(dnsData);
      flash("Custom domain removed.");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Failed to remove", true);
    } finally { setBusy(false); }
  };

  const verify = async () => {
    setVerifyBusy(true);
    try {
      const result = await orgDomain.verify();
      if (result.verified) setDomain((d) => d ? { ...d, customDomainVerified: true } : d);
      const dnsData = await orgDomain.dnsInfo();
      setDns(dnsData);
      flash(result.message, !result.verified);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Verification failed", true);
    } finally { setVerifyBusy(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      {/* Subdomain (read-only) */}
      {dns?.subdomainUrl && (
        <SectionCard
          icon={Globe}
          title="Platform Subdomain"
          description="Assigned by your platform admin. No action needed."
        >
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
            <a
              href={dns.subdomainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-sm font-mono text-primary hover:underline"
            >
              {dns.subdomainUrl}
            </a>
            <CopyBtn text={dns.subdomainUrl} />
          </div>
        </SectionCard>
      )}

      {/* Custom domain */}
      <SectionCard
        icon={Globe}
        title="Custom Domain"
        description="Use your own domain to serve your CMS site. Requires DNS configuration."
      >
        <div className="space-y-4">
          <FieldGroup
            label="Domain"
            hint="Enter your domain without https:// — e.g. example.com"
          >
            <div className="flex gap-2">
              <input
                type="text"
                className={cn(inputCls, "flex-1")}
                placeholder="example.com"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value.toLowerCase().trim())}
              />
              <button
                onClick={save}
                disabled={busy}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </FieldGroup>

          {domain?.customDomain && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-2">
                {domain.customDomainVerified ? (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-warning shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {domain.customDomain}
                  </p>
                  <p className={`text-xs ${domain.customDomainVerified ? "text-success" : "text-warning"}`}>
                    {domain.customDomainVerified ? "Verified" : "Pending verification"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!domain.customDomainVerified && (
                  <button
                    onClick={verify}
                    disabled={verifyBusy}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition disabled:opacity-50 cursor-pointer"
                  >
                    {verifyBusy ? "Checking…" : "Verify now"}
                  </button>
                )}
                <button
                  onClick={clear}
                  disabled={busy}
                  className="rounded-xl border border-error/30 text-error px-3 py-1.5 text-xs hover:bg-error/5 transition disabled:opacity-50 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* DNS records */}
      {dns && dns.dnsRecords.length > 0 && (
        <SectionCard
          icon={Globe}
          title="DNS Configuration"
          description="Add these records in your DNS provider. Changes can take up to 48 hours to propagate."
        >
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left font-medium w-16">Type</th>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Value</th>
                  <th className="px-3 py-2 text-left font-medium w-12">TTL</th>
                  <th className="px-3 py-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dns.dnsRecords.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 font-mono font-semibold text-[10px] ${
                          r.type === "A"
                            ? "bg-blue-500/10 text-blue-500"
                            : r.type === "CNAME"
                              ? "bg-purple-500/10 text-purple-500"
                              : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-foreground break-all">{r.name}</td>
                    <td className="px-3 py-2.5 font-mono text-foreground break-all max-w-[200px]">{r.value}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.ttl}</td>
                    <td className="px-3 py-2.5">
                      <CopyBtn text={r.value} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 space-y-1">
            {dns.dnsRecords.map((r, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">
                <span
                  className={`font-semibold ${
                    r.type === "A"
                      ? "text-blue-500"
                      : r.type === "CNAME"
                        ? "text-purple-500"
                        : "text-amber-600"
                  }`}
                >
                  {r.type} ({r.name})
                </span>
                {" — "}
                {r.note}
              </p>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ── Branding Tab ──────────────────────────────────────────────────────────────

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
      aria-pressed={enabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function BrandingTab() {
  const { user } = useAuth();
  const uploadCompanyId = user?.organizationId || "superadmin";

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [darkLogoUrl, setDarkLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [themeSwitcherEnabled, setThemeSwitcherEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiGetOrgSettings()
      .then((s) => {
        setLogoUrl(s.logoUrl);
        setDarkLogoUrl(s.darkLogoUrl);
        setFaviconUrl(s.faviconUrl);
        setThemeSwitcherEnabled(s.themeSwitcherEnabled);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const flash = (msg: string, isErr = false) => {
    if (isErr) { setError(msg); setTimeout(() => setError(""), 4000); }
    else { setSuccess(msg); setTimeout(() => setSuccess(""), 4000); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiUpdateOrgSettings({
        logoUrl: logoUrl ?? undefined,
        darkLogoUrl: darkLogoUrl ?? undefined,
        faviconUrl: faviconUrl ?? undefined,
        themeSwitcherEnabled,
      });
      flash("Branding saved successfully.");
    } catch {
      flash("Failed to save branding.", true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      {/* Logos */}
      <SectionCard
        icon={ImageIcon}
        title="Site Logos"
        description="Logos displayed in your public site's navigation bar."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Light logo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sun className="h-4 w-4 text-amber-500" />
              Light Mode Logo
            </div>
            <p className="text-xs text-muted-foreground">PNG, SVG, JPEG — max 5 MB. Landscape format recommended.</p>
            <ImageUploadWithStorage
              value={logoUrl}
              onChange={setLogoUrl}
              companyId={uploadCompanyId}
              module="branding"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              maxSizeMB={5}
            />
          </div>

          {/* Dark logo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Moon className="h-4 w-4 text-indigo-400" />
              Dark Mode Logo
            </div>
            <p className="text-xs text-muted-foreground">Shown when visitors switch to dark mode. Falls back to light logo if not set.</p>
            <ImageUploadWithStorage
              value={darkLogoUrl}
              onChange={setDarkLogoUrl}
              companyId={uploadCompanyId}
              module="branding"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              maxSizeMB={5}
            />
          </div>

          {/* Favicon */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Globe className="h-4 w-4 text-primary" />
              Favicon / App Icon
            </div>
            <p className="text-xs text-muted-foreground">512×512 PNG, ICO, or SVG. Shown in browser tab and bookmarks.</p>
            <ImageUploadWithStorage
              value={faviconUrl}
              onChange={setFaviconUrl}
              companyId={uploadCompanyId}
              module="branding"
              accept="image/png,image/x-icon,image/svg+xml"
              maxSizeMB={2}
            />
          </div>
        </div>
      </SectionCard>

      {/* Theme switcher */}
      <SectionCard
        icon={Palette}
        title="Theme Switcher"
        description="Allow visitors to toggle between light and dark mode on your public site."
      >
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-foreground">Enable theme switcher</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              A Sun / Moon toggle button will appear in your site's navigation bar.
            </p>
          </div>
          <Toggle enabled={themeSwitcherEnabled} onToggle={() => setThemeSwitcherEnabled((v) => !v)} />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : "Save Branding"}
        </button>
      </div>
    </div>
  );
}

// ── CmsSettingsView ───────────────────────────────────────────────────────────

const TABS = [
  { id: "branding", label: "Branding" },
  { id: "domain", label: "Domain" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CmsSettingsView() {
  const [activeTab, setActiveTab] = useState<TabId>("branding");

  return (
    <div className="space-y-6 pb-0">
      <PageHeader
        title="CMS Settings"
        description="Configure domain, branding, and site-level options for your CMS."
      />

      {/* Tab strip */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "branding" && <BrandingTab />}
      {activeTab === "domain" && <DomainTab />}
    </div>
  );
}
