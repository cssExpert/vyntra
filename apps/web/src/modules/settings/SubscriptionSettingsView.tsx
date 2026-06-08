"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  Check,
  Users,
  Boxes,
  Info,
  Sparkles,
} from "lucide-react";
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
  if (!cents) return { amount: "Free", per: "" };
  const amount = `$${(cents / 100).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
  const per = cycle?.toUpperCase() === "YEARLY" ? "/year" : "/month";
  return { amount, per };
}

function statusVariant(status: string): "success" | "warning" | "muted" {
  const s = status?.toUpperCase();
  if (s === "ACTIVE") return "success";
  if (s === "TRIALING" || s === "PAST_DUE") return "warning";
  return "muted";
}

export function SubscriptionSettingsView() {
  const [org, setOrg] = useState<ApiCurrentOrg | null>(null);
  const [packages, setPackages] = useState<ApiPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Plans are public; the org context may 404 for super admins (no org).
      const [pkgs, orgCtx] = await Promise.all([
        apiGetPackages(),
        apiGetMyOrg().catch(() => null),
      ]);
      setPackages(pkgs);
      setOrg(orgCtx);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load subscription");
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
        <p className="text-muted-foreground">Loading subscription…</p>
      </div>
    );
  }

  const sub = org?.subscription ?? null;
  const moduleName = (key: string) => org?.moduleNames?.[key] ?? key;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Subscription"
        description="Your current plan, usage, and what's available."
      />

      {error && (
        <div className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {!org && !error && (
        <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Subscriptions apply to organizations. Your account isn&apos;t tied to
            one.
          </p>
        </div>
      )}

      {/* Current plan */}
      {org && (
        <SectionCard
          icon={CreditCard}
          title="Current Plan"
          description="The plan active for your organization."
        >
          {sub ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-foreground">
                    {sub.packageName}
                  </span>
                  <StatusBadge
                    variant={statusVariant(sub.status)}
                    label={sub.status}
                    size="sm"
                  />
                </div>
                <span className="text-sm text-muted-foreground capitalize">
                  Billed {sub.billingCycle.toLowerCase()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users size={15} />
                Up to {org.maxUsers} {org.maxUsers === 1 ? "seat" : "seats"}
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Boxes size={15} />
                  Included modules
                </p>
                {org.modules.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {org.modules.map((key) => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        <Check size={12} />
                        {moduleName(key)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No modules are currently enabled.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your organization doesn&apos;t have an active subscription. Contact
              your administrator to choose a plan.
            </p>
          )}
        </SectionCard>
      )}

      {/* Available plans */}
      {packages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <h3 className="text-base font-bold text-foreground">
              Available Plans
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => {
              const isCurrent = sub?.packageName === pkg.name;
              const { amount, per } = formatPrice(
                pkg.priceCents,
                pkg.billingCycle,
              );
              return (
                <div
                  key={pkg.id}
                  className={`flex flex-col rounded-2xl border bg-card p-5 transition ${
                    isCurrent
                      ? "border-primary ring-1 ring-primary/30"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground">{pkg.name}</h4>
                    {isCurrent && (
                      <StatusBadge variant="success" label="Current" size="sm" />
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-foreground">
                      {amount}
                    </span>
                    {per && (
                      <span className="text-sm text-muted-foreground">
                        {per}
                      </span>
                    )}
                  </div>

                  {pkg.description && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {pkg.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users size={13} />
                    Up to {pkg.maxUsers} seats
                  </div>

                  <div className="mt-3 flex-1 space-y-1.5">
                    {pkg.modules.map((key) => (
                      <p
                        key={key}
                        className="flex items-center gap-1.5 text-xs text-foreground"
                      >
                        <Check size={13} className="text-success" />
                        {moduleName(key)}
                      </p>
                    ))}
                  </div>

                  <button
                    disabled
                    title="Contact your administrator to change plans"
                    className="mt-5 w-full cursor-not-allowed rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground"
                  >
                    {isCurrent ? "Current Plan" : "Contact admin"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              Plan changes are managed by your administrator. Reach out to them
              to upgrade, downgrade, or update billing.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
