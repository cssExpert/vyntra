"use client";

import { useEffect, useState } from "react";
import { Globe, CheckCircle2, AlertCircle, Key } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { cn } from "@/lib/utils";
import { orgDomain, type OrgDomain, type DnsInfo } from "@/lib/api";

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

// ── Navigation Tab ────────────────────────────────────────────────────────────

// ── CmsSettingsView ───────────────────────────────────────────────────────────

export function CmsSettingsView() {
  return (
    <div className="space-y-6 pb-0">
      <PageHeader
        title="CMS Settings"
        description="Configure domain, publishing, and site-level options for your CMS."
      />
      <DomainTab />
    </div>
  );
}
