"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Globe,
  Copy,
  Check,
  Shield,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Info,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { admin, type DnsInfo, type OrgDomain } from "@/lib/api";
import { adminInput } from "./AdminGuard";
import { Input } from "@/components/ui/input";

interface Props {
  orgId: string;
  orgName: string;
  isOpen: boolean;
  onClose: () => void;
}

type CopyState = Record<string, boolean>;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="shrink-0 flex items-center justify-center h-7 w-7 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
      title="Copy"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export function DomainManagementModal({
  orgId,
  orgName,
  isOpen,
  onClose,
}: Props) {
  const t = useTranslations("admin.domainManagement");
  const [domain, setDomain] = useState<OrgDomain | null>(null);
  const [dns, setDns] = useState<DnsInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // subdomain form
  const [subInput, setSubInput] = useState("");
  const [subBusy, setSubBusy] = useState(false);

  // custom domain form
  const [customInput, setCustomInput] = useState("");
  const [customBusy, setCustomBusy] = useState(false);

  // verify
  const [verifyBusy, setVerifyBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [d, dnsData] = await Promise.all([
        admin.getDomain(orgId),
        admin.getDnsInfo(orgId),
      ]);
      setDomain(d);
      setDns(dnsData);
      setSubInput(d.subdomain ?? "");
      setCustomInput(d.customDomain ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("failedtoloaddomaininfo"));
    } finally {
      setLoading(false);
    }
  }, [orgId, t]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  const flash = (msg: string, isErr = false) => {
    if (isErr) setError(msg);
    else setSuccess(msg);
    setTimeout(() => (isErr ? setError("") : setSuccess("")), 3500);
  };

  // ── subdomain actions ────────────────────────────────────────────────────

  const saveSubdomain = async () => {
    if (!subInput.trim()) return clearSubdomain();
    setSubBusy(true);
    try {
      const updated = await admin.setSubdomain(
        orgId,
        subInput.trim().toLowerCase(),
      );
      setDomain(updated);
      const dns2 = await admin.getDnsInfo(orgId);
      setDns(dns2);
      flash(t("subdomainsaved"));
    } catch (e) {
      flash(e instanceof Error ? e.message : t("failedtosavesubdomain"), true);
    } finally {
      setSubBusy(false);
    }
  };

  const clearSubdomain = async () => {
    setSubBusy(true);
    try {
      const updated = await admin.clearSubdomain(orgId);
      setDomain(updated);
      setSubInput("");
      const dns2 = await admin.getDnsInfo(orgId);
      setDns(dns2);
      flash(t("subdomainremoved"));
    } catch (e) {
      flash(
        e instanceof Error ? e.message : t("failedtoremovesubdomain"),
        true,
      );
    } finally {
      setSubBusy(false);
    }
  };

  // ── custom domain actions ────────────────────────────────────────────────

  const saveCustomDomain = async () => {
    if (!customInput.trim()) return clearCustomDomain();
    setCustomBusy(true);
    try {
      const updated = await admin.setCustomDomain(
        orgId,
        customInput.trim().toLowerCase(),
      );
      setDomain(updated);
      const dns2 = await admin.getDnsInfo(orgId);
      setDns(dns2);
      flash(t("customdomainsavedaddthednsrecordsbelowthenverify"));
    } catch (e) {
      flash(e instanceof Error ? e.message : t("failedtosave domain"), true);
    } finally {
      setCustomBusy(false);
    }
  };

  const clearCustomDomain = async () => {
    setCustomBusy(true);
    try {
      const updated = await admin.clearCustomDomain(orgId);
      setDomain(updated);
      setCustomInput("");
      const dns2 = await admin.getDnsInfo(orgId);
      setDns(dns2);
      flash(t("customdomainremoved"));
    } catch (e) {
      flash(e instanceof Error ? e.message : t("failedtoremovedomain"), true);
    } finally {
      setCustomBusy(false);
    }
  };

  const verifyDomain = async () => {
    setVerifyBusy(true);
    try {
      const result = await admin.verifyDomain(orgId);
      const dns2 = await admin.getDnsInfo(orgId);
      setDns(dns2);
      if (result.verified) {
        setDomain((d) => (d ? { ...d, customDomainVerified: true } : d));
      }
      flash(result.message, !result.verified);
    } catch (e) {
      flash(e instanceof Error ? e.message : t("verificationfailed"), true);
    } finally {
      setVerifyBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Domains — ${orgName}`}
      description="Manage the subdomain and custom domain for this organization's CMS site."
      icon={<Globe className="h-5 w-5" />}
      maxWidth="xl"
    >
      <div className="px-6 py-5 space-y-6">
        {/* Alerts */}
        {error && (
          <p className="rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-success/10 border border-success/20 px-3 py-2 text-sm text-success">
            {success}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
            Loading…
          </div>
        ) : (
          <>
            {/* ── Subdomain ──────────────────────────────────────────────────── */}
            <section>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary text-[10px] font-bold">
                  S
                </span>
                Platform Subdomain
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Assign a subdomain on{" "}
                <strong>{dns?.platformDomain ?? "vyntra.com"}</strong>. The
                wildcard DNS record for{" "}
                <code>*.{dns?.platformDomain ?? "vyntra.com"}</code> must point
                to the platform IP — no customer action needed.
              </p>
              <div className="flex gap-2">
                <div className="flex flex-1 items-center rounded-lg border border-border overflow-hidden">
                  <Input
                    size="lg"
                    className="flex-1 bg-background px-3 text-sm outline-none"
                    placeholder="acme"
                    value={subInput}
                    onChange={(e) =>
                      setSubInput(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      )
                    }
                  />
                  <span className="px-3 text-sm text-muted-foreground bg-muted border-l border-border">
                    .{dns?.platformDomain ?? "vyntra.com"}
                  </span>
                </div>
                <button
                  onClick={saveSubdomain}
                  disabled={subBusy}
                  className="rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                >
                  {subBusy ? "…" : "Save"}
                </button>
                {domain?.subdomain && (
                  <button
                    onClick={clearSubdomain}
                    disabled={subBusy}
                    className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-error/10 hover:text-error transition disabled:opacity-50 cursor-pointer"
                    title="Remove subdomain"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              {dns?.subdomainUrl && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  Site URL:&nbsp;
                  <a
                    href={dns.subdomainUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-mono"
                  >
                    {dns.subdomainUrl}
                  </a>
                  <CopyButton text={dns.subdomainUrl} />
                </div>
              )}
            </section>

            <hr className="border-border" />

            {/* ── Custom Domain ──────────────────────────────────────────────── */}
            <section>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary text-[10px] font-bold">
                  C
                </span>
                Custom Domain
                {domain?.customDomain && (
                  <span
                    className={`ml-auto flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 ${
                      domain.customDomainVerified
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {domain.customDomainVerified ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : (
                      <Shield className="h-3 w-3" />
                    )}
                    {domain.customDomainVerified ? "Verified" : "Unverified"}
                  </span>
                )}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Let the org use their own domain (e.g.&nbsp;
                <code>acme.com</code>). The domain must have the A and TXT
                records configured before verification.
              </p>
              <div className="flex gap-2">
                <Input
                  className={`${adminInput} flex-1`}
                  placeholder="example.com"
                  value={customInput}
                  onChange={(e) =>
                    setCustomInput(e.target.value.toLowerCase().trim())
                  }
                />
                <button
                  onClick={saveCustomDomain}
                  disabled={customBusy}
                  className="rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                >
                  {customBusy ? "…" : "Save"}
                </button>
                {domain?.customDomain && (
                  <>
                    <button
                      onClick={verifyDomain}
                      disabled={verifyBusy || domain.customDomainVerified}
                      className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                      title="Verify domain via DNS"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${verifyBusy ? "animate-spin" : ""}`}
                      />
                      Verify
                    </button>
                    <button
                      onClick={clearCustomDomain}
                      disabled={customBusy}
                      className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-error/10 hover:text-error transition disabled:opacity-50 cursor-pointer"
                      title="Remove custom domain"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </section>

            {/* ── DNS Records ──────────────────────────────────────────────────── */}
            {dns && dns.dnsRecords.length > 0 && (
              <>
                <hr className="border-border" />
                <section>
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    DNS Configuration
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Add these records in your customer&apos;s DNS provider.
                    Changes can take up to 48 hours to propagate.
                  </p>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wide">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium w-14">
                            Type
                          </th>
                          <th className="px-3 py-2 text-left font-medium">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left font-medium">
                            Value
                          </th>
                          <th className="px-3 py-2 text-left font-medium w-12">
                            TTL
                          </th>
                          <th className="px-3 py-2 w-8" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {dns.dnsRecords.map((r, i) => (
                          <tr key={i} className="group">
                            <td className="px-3 py-2.5">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono font-semibold text-[10px] ${
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
                            <td className="px-3 py-2.5 font-mono text-foreground break-all">
                              {r.name}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-foreground break-all max-w-[200px]">
                              {r.value}
                            </td>
                            <td className="px-3 py-2.5 text-muted-foreground">
                              {r.ttl}
                            </td>
                            <td className="px-3 py-2.5">
                              <CopyButton text={r.value} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {dns.dnsRecords.map((r, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground">
                        <span
                          className={`inline font-semibold ${
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
                </section>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-muted/40 border-t border-border flex items-center justify-end">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
