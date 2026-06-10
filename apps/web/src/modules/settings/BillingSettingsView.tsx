"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { FileText, Receipt, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  apiGetMyOrg,
  apiGetPackages,
  type ApiCurrentOrg,
  type ApiPackage,
} from "@/lib/api";

function formatPrice(cents: number, cycle: string) {
  if (!cents) return "Free";
  const amount = `$${(cents / 100).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
  return `${amount} / ${cycle?.toUpperCase() === "YEARLY" ? "year" : "month"}`;
}

export function BillingSettingsView() {
  const t = useTranslations("settings.billing");
  const [org, setOrg] = useState<ApiCurrentOrg | null>(null);
  const [currentPkg, setCurrentPkg] = useState<ApiPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [orgCtx, pkgs] = await Promise.all([
        apiGetMyOrg().catch(() => null),
        apiGetPackages(),
      ]);
      setOrg(orgCtx);
      const match = pkgs.find((p) => p.name === orgCtx?.subscription?.packageName);
      setCurrentPkg(match ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load billing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading billing…</p>
      </div>
    );
  }

  const sub = org?.subscription ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Billing Info"
        description="Your plan, charges, and invoice history."
      />

      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Current plan / charge */}
      <SectionCard
        icon={CreditCard}
        title="Current Plan"
        description="What your organization is billed for."
      >
        {sub ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-foreground">
                  {sub.packageName}
                </span>
                <StatusBadge
                  variant={sub.status?.toUpperCase() === "ACTIVE" ? "success" : "warning"}
                  label={sub.status}
                  size="sm"
                />
              </div>
              <span className="text-lg font-semibold text-foreground">
                {currentPkg
                  ? formatPrice(currentPkg.priceCents, currentPkg.billingCycle)
                  : `Billed ${sub.billingCycle.toLowerCase()}`}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Plan changes and payment methods are managed by your administrator.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No active subscription. Contact your administrator to choose a plan.
          </p>
        )}
      </SectionCard>

      {/* Invoices */}
      <SectionCard
        icon={Receipt}
        title="Invoices"
        description="Your billing and payment history."
      >
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No invoices yet.
          </p>
          <p className="text-xs text-muted-foreground/80">
            Invoices will appear here once billing is processed.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
