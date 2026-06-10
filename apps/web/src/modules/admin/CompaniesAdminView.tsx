"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Building2,
  Eye,
  Globe,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Toaster, useToaster } from "@/components/common/Toaster";
import { admin, type AdminCompany, type AdminPackage } from "@/lib/api";
import { AdminGuard } from "./AdminGuard";
import { AddCompanyModal } from "./AddCompanyModal";
import { EditCompanyModal } from "./EditCompanyModal";
import { DomainManagementModal } from "./DomainManagementModal";

function Inner() {
  const t = useTranslations("admin.companies");
  const router = useRouter();
  const { toasts, addToast, dismiss } = useToaster();

  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCompany | null>(null);
  const [domainCompany, setDomainCompany] = useState<AdminCompany | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [c, p] = await Promise.all([
        admin.listCompanies(),
        admin.listPackages(),
      ]);
      setCompanies(c);
      setPackages(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("failedToLoad", { defaultValue: "Failed to load companies" }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const changePlan = async (id: string, slug: string) => {
    try {
      await admin.assignPackage(id, slug);
      addToast(t("planUpdated", { defaultValue: "Plan updated" }), "success");
      await load();
    } catch (e) {
      addToast(
        e instanceof Error ? e.message : t("failedChangePlan", { defaultValue: "Failed to change plan" }),
        "error",
      );
    }
  };

  const remove = async (company: AdminCompany) => {
    if (
      !confirm(
        t("deleteConfirm", { defaultValue: `Delete "${company.name}"? This permanently removes the company and all of its data.` })
      )
    )
      return;
    try {
      await admin.deleteCompany(company.id);
      addToast(`${company.name} ${t("deleted", { defaultValue: "deleted" })}`, "success");
      await load();
    } catch (e) {
      addToast(e instanceof Error ? e.message : t("failedDelete", { defaultValue: "Failed to delete" }), "error");
    }
  };

  const filtered = companies.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.legalName ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
      >
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> {t("add")}
        </button>
      </PageHeader>

      {error && (
        <p className="rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">{t("company")}</th>
              <th className="px-4 py-3 font-medium">{t("plan")}</th>
              <th className="px-4 py-3 font-medium">{t("users")}</th>
              <th className="px-4 py-3 font-medium">{t("status")}</th>
              <th className="px-4 py-3 font-medium">{t("domains")}</th>
              <th className="px-4 py-3 font-medium text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {t("loading")}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  <Building2 className="mx-auto mb-3 h-8 w-8 opacity-40" />
                  {companies.length === 0
                    ? t("noCompanies")
                    : t("searchNoMatch")}
                </td>
              </tr>
            ) : (
              filtered.map((company) => (
                <tr
                  key={company.id}
                  onClick={() => router.push(`/admin/companies/${company.id}`)}
                  className="cursor-pointer hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {company.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {company.email ?? company.legalName ?? company.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={company.subscription?.package.slug ?? ""}
                      onChange={(e) => changePlan(company.id, e.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm cursor-pointer"
                    >
                      {packages.map((p) => (
                        <option key={p.id} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {company._count.users} / {company.maxUsers}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      variant={company.isActive ? "success" : "muted"}
                      label={company.isActive ? t("active", { defaultValue: "Active" }) : t("suspended", { defaultValue: "Suspended" })}
                      dot
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setDomainCompany(company)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {t("domains")}
                    </button>
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() =>
                          router.push(`/admin/companies/${company.id}`)
                        }
                        className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                        aria-label={t("view", { defaultValue: "View" })}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditing(company)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                        aria-label={t("edit", { defaultValue: "Edit" })}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(company)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-error/10 hover:text-error transition cursor-pointer"
                        aria-label={t("delete", { defaultValue: "Delete" })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddCompanyModal
        isOpen={addOpen}
        packages={packages}
        onClose={() => setAddOpen(false)}
        onCreated={(name) => {
          addToast(`${name} ${t("created", { defaultValue: "created" })}`, "success");
          load();
        }}
        onError={(m) => addToast(m, "error")}
      />

      <EditCompanyModal
        company={editing}
        packages={packages}
        onClose={() => setEditing(null)}
        onSaved={(name) => {
          setEditing(null);
          addToast(`${name} ${t("updated", { defaultValue: "updated" })}`, "success");
          load();
        }}
        onError={(m) => addToast(m, "error")}
      />

      {domainCompany && (
        <DomainManagementModal
          orgId={domainCompany.id}
          orgName={domainCompany.name}
          isOpen={!!domainCompany}
          onClose={() => setDomainCompany(null)}
        />
      )}

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export function CompaniesAdminView() {
  return (
    <AdminGuard>
      <Inner />
    </AdminGuard>
  );
}
