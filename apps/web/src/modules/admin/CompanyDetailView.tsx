"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Blocks,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Globe,
  Layers,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Toaster, useToaster } from "@/components/common/Toaster";
import {
  admin,
  type AdminCompanyDetail,
  type AdminPackage,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { AdminGuard } from "./AdminGuard";
import { EditCompanyModal } from "./EditCompanyModal";
import { cycleLabel, formatDate, formatPrice } from "./companyUtils";

type TabId = "overview" | "users" | "billing" | "modules";

const TABS: { id: TabId; label: string; icon: typeof Building2 }[] = [
  { id: "overview", label: "Overview & Profile", icon: Building2 },
  { id: "users", label: "Users", icon: Users },
  { id: "billing", label: "Subscription & Billing", icon: CreditCard },
  { id: "modules", label: "Modules & Permissions", icon: Blocks },
];

function statusVariant(status?: string) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "TRIALING":
      return "info" as const;
    case "PAUSED":
      return "warning" as const;
    default:
      return "muted" as const;
  }
}

function Inner({ companyId }: { companyId: string }) {
  const router = useRouter();
  const { toasts, addToast, dismiss } = useToaster();

  const [company, setCompany] = useState<AdminCompanyDetail | null>(null);
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TabId>("overview");
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [c, p] = await Promise.all([
        admin.getCompany(companyId),
        admin.listPackages(),
      ]);
      setCompany(c);
      setPackages(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load company");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <p className="py-24 text-center text-sm text-muted-foreground">Loading…</p>
    );
  }

  if (error || !company) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push("/admin/companies")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Companies
        </button>
        <p className="rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-sm text-error">
          {error || "Company not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/admin/companies")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Companies
      </button>

      <PageHeader
        title={company.name}
        description={company.legalName ?? company.slug}
      >
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer"
        >
          <Pencil className="h-4 w-4" /> Edit Company
        </button>
      </PageHeader>

      {/* Identity card */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-6 w-6" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">
              {company.name}
            </h3>
            <StatusBadge
              variant={company.isActive ? "success" : "muted"}
              label={company.isActive ? "Active" : "Suspended"}
              dot
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {company.industry ?? "—"}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-6 text-sm">
          <Stat label="Plan" value={company.subscription?.package.name ?? "—"} />
          <Stat
            label="Users"
            value={`${company._count.users} / ${company.maxUsers}`}
          />
          <Stat label="Joined" value={formatDate(company.createdAt)} />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {t.id === "users" && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {company.users.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {tab === "overview" && <OverviewTab company={company} />}
      {tab === "users" && <UsersTab company={company} />}
      {tab === "billing" && <BillingTab company={company} />}
      {tab === "modules" && <ModulesTab company={company} />}

      <EditCompanyModal
        company={editing ? company : null}
        packages={packages}
        onClose={() => setEditing(false)}
        onSaved={(name) => {
          setEditing(false);
          addToast(`${name} updated`, "success");
          load();
        }}
        onError={(m) => addToast(m, "error")}
      />

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

// ── Overview tab ─────────────────────────────────────────────
function OverviewTab({ company }: { company: AdminCompanyDetail }) {
  const verifiedUsers = company.users.filter((u) => u.isActive).length;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="Business Information">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <Detail label="Company Name" value={company.name} />
            <Detail label="Legal / Business Name" value={company.legalName} />
            <Detail label="Industry / Domain" value={company.industry} />
            <Detail
              label="Website"
              value={company.website}
              href={company.website ?? undefined}
              icon={<Globe className="h-3.5 w-3.5" />}
            />
            <Detail
              label="Contact Email"
              value={company.email}
              icon={<Mail className="h-3.5 w-3.5" />}
            />
            <Detail
              label="Phone"
              value={company.phone}
              icon={<Phone className="h-3.5 w-3.5" />}
            />
            <Detail
              label="Address"
              value={company.address}
              icon={<MapPin className="h-3.5 w-3.5" />}
              full
            />
          </dl>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Status">
          <div className="space-y-3">
            <Row label="Account">
              <StatusBadge
                variant={company.isActive ? "success" : "muted"}
                label={company.isActive ? "Active" : "Suspended"}
                dot
              />
            </Row>
            <Row label="Plan">
              <span className="font-medium text-foreground">
                {company.subscription?.package.name ?? "—"}
              </span>
            </Row>
            <Row label="Subscription">
              <StatusBadge
                variant={statusVariant(company.subscription?.status)}
                label={company.subscription?.status ?? "NONE"}
              />
            </Row>
            <Row label="Created">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(company.createdAt)}
              </span>
            </Row>
          </div>
        </Card>

        <Card title="Quick Stats">
          <div className="grid grid-cols-2 gap-3">
            <MiniStat
              label="Total Users"
              value={`${company._count.users}`}
              icon={<Users className="h-4 w-4" />}
            />
            <MiniStat
              label="Active Users"
              value={`${verifiedUsers}`}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <MiniStat
              label="Seat Limit"
              value={`${company.maxUsers}`}
              icon={<Layers className="h-4 w-4" />}
            />
            <MiniStat
              label="Modules"
              value={`${company.modules.filter((m) => m.enabled).length}`}
              icon={<Blocks className="h-4 w-4" />}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Users tab ────────────────────────────────────────────────
function UsersTab({ company }: { company: AdminCompanyDetail }) {
  if (company.users.length === 0) {
    return (
      <EmptyCard
        icon={<Users className="h-8 w-8" />}
        text="This company has no users yet."
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Last Login</th>
            <th className="px-4 py-3 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {company.users.map((u) => {
            const role =
              u.roles.find((r) => r.organizationId === company.id)?.role ??
              u.roles[0]?.role ??
              "USER";
            return (
              <tr key={u.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {(u.name ?? u.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {u.name ?? "—"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    variant={role === "ORG_ADMIN" ? "purple" : "default"}
                    label={role}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    variant={u.isActive ? "success" : "muted"}
                    label={u.isActive ? "Active" : "Inactive"}
                    dot
                  />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.lastLogin ? formatDate(u.lastLogin) : "Never"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(u.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Billing tab ──────────────────────────────────────────────
function BillingTab({ company }: { company: AdminCompanyDetail }) {
  const sub = company.subscription;
  const usedPct = useMemo(() => {
    if (!company.maxUsers) return 0;
    return Math.min(
      100,
      Math.round((company._count.users / company.maxUsers) * 100),
    );
  }, [company]);

  if (!sub) {
    return (
      <EmptyCard
        icon={<CreditCard className="h-8 w-8" />}
        text="No active subscription for this company."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="Current Plan">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-foreground">
                {sub.package.name}
              </p>
              {sub.package.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {sub.package.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">
                {formatPrice(sub.package.priceCents, sub.package.billingCycle)}
              </p>
              <StatusBadge variant={statusVariant(sub.status)} label={sub.status} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Detail
              label="Billing Cycle"
              value={cycleLabel(sub.package.billingCycle)}
            />
            <Detail label="Started" value={formatDate(sub.startDate)} />
            <Detail
              label="Renews / Ends"
              value={sub.endDate ? formatDate(sub.endDate) : "—"}
            />
            <Detail label="Billing Email" value={sub.billingEmail} />
          </div>
        </Card>

        <Card title="Quotas & Usage">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Seats</span>
              <span className="font-medium text-foreground">
                {company._count.users} / {company.maxUsers} users
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  usedPct >= 100
                    ? "bg-error"
                    : usedPct >= 80
                      ? "bg-warning"
                      : "bg-primary",
                )}
                style={{ width: `${usedPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {usedPct}% of seats used
            </p>
          </div>
        </Card>
      </div>

      <Card title="Plan Limits">
        <div className="space-y-3">
          <Row label="Max Users">
            <span className="font-medium text-foreground">
              {sub.package.maxUsers}
            </span>
          </Row>
          <Row label="Plan Slug">
            <span className="font-mono text-xs text-muted-foreground">
              {sub.package.slug}
            </span>
          </Row>
          <Row label="Price">
            <span className="font-medium text-foreground">
              {formatPrice(sub.package.priceCents, sub.package.billingCycle)}
            </span>
          </Row>
        </div>
      </Card>
    </div>
  );
}

// ── Modules tab ──────────────────────────────────────────────
function ModulesTab({ company }: { company: AdminCompanyDetail }) {
  if (company.modules.length === 0) {
    return (
      <EmptyCard
        icon={<Blocks className="h-8 w-8" />}
        text="No platform modules are configured."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {company.modules.map((m) => (
        <div
          key={m.key}
          className={cn(
            "rounded-xl border p-4 transition-colors",
            m.enabled
              ? "border-success/30 bg-success/5"
              : "border-border bg-card opacity-80",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  m.enabled
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{m.name}</p>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">
                  {m.key}
                </p>
              </div>
            </div>
            {m.enabled ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          {m.description && (
            <p className="mt-2 text-xs text-muted-foreground">
              {m.description}
            </p>
          )}
          <p className="mt-3 text-xs font-medium">
            {m.enabled ? (
              <span className="text-success">Enabled</span>
            ) : (
              <span className="text-muted-foreground">
                Not in plan
              </span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Small building blocks ────────────────────────────────────
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h4 className="mb-4 text-sm font-semibold text-foreground">{title}</h4>
      {children}
    </div>
  );
}

function Detail({
  label,
  value,
  href,
  icon,
  full,
}: {
  label: string;
  value?: string | null;
  href?: string;
  icon?: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {value ? (
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </dd>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function EmptyCard({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
      <div className="mb-3 opacity-40">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function CompanyDetailView({ companyId }: { companyId: string }) {
  const t = useTranslations("admin.companies");
  return (
    <AdminGuard>
      <Inner companyId={companyId} />
    </AdminGuard>
  );
}
