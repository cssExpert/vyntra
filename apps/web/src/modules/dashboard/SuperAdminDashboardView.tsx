"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { useAuth } from "@/providers/AuthProvider";
import { DashboardPageSkeleton } from "@/components/common/DashboardSkeleton";
import {
  RefreshCw,
  Building2,
  Users,
  Package,
  Settings,
  HardDrive,
  Mail,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { adminDashboard } from "@/lib/api/admin";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

interface DashboardData {
  companies: any[];
  users: any[];
  packages: any[];
  modules: any[];
  stats: any;
  settings: any;
  loading: boolean;
  error: string | null;
}

function SectionCard({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn("glass-card p-5", className)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
        {action && (
          <a
            href={action.href}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            {action.label}
            <ArrowRight className="h-3 w-3" />
          </a>
        )}
      </div>
      {children}
    </motion.div>
  );
}

function ConfigStatus({
  label,
  configured,
  href,
}: {
  label: string;
  configured: boolean;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-sm border border-border/50 p-3 hover:border-border transition-colors cursor-pointer group"
    >
      <div className="flex-shrink-0">
        {configured ? (
          <div className="h-8 w-8 rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-warning/15 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-warning" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {configured ? "Configured" : "Not configured"}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
    </a>
  );
}

export function SuperAdminDashboardView() {
  const t = useTranslations("admin.dashboard");
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    companies: [],
    users: [],
    packages: [],
    modules: [],
    stats: null,
    settings: null,
    loading: true,
    error: null,
  });

  const isLoaded = usePageLoad(700);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData((prev) => ({ ...prev, loading: true, error: null }));

        const [companies, users, packages, modules, stats, settings] = await Promise.all(
          [
            adminDashboard.getCompanies(),
            adminDashboard.getUsers(),
            adminDashboard.getPackages(),
            adminDashboard.getModules(),
            adminDashboard.getDashboardStats(),
            adminDashboard.getSettings(),
          ]
        );

        setData({
          companies,
          users,
          packages,
          modules,
          stats,
          settings,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load dashboard data",
        }));
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    setData((prev) => ({ ...prev, loading: true }));
    const [companies, users, packages, modules, stats, settings] = await Promise.all([
      adminDashboard.getCompanies(),
      adminDashboard.getUsers(),
      adminDashboard.getPackages(),
      adminDashboard.getModules(),
      adminDashboard.getDashboardStats(),
      adminDashboard.getSettings(),
    ]);

    setData({
      companies,
      users,
      packages,
      modules,
      stats,
      settings,
      loading: false,
      error: null,
    });
  };

  const ADMIN_STATS = [
    {
      id: "companies",
      title: "Total Companies",
      value: data.stats?.totalCompanies ?? 0,
      change: 12,
      icon: "Users2",
      color: "brand" as const,
    },
    {
      id: "users",
      title: "Total Users",
      value: data.stats?.totalUsers ?? 0,
      change: 8,
      icon: "Users2",
      color: "success" as const,
    },
    {
      id: "packages",
      title: "Packages",
      value: data.stats?.totalPackages ?? 0,
      change: 2,
      icon: "ShoppingBag",
      color: "warning" as const,
    },
    {
      id: "modules",
      title: "Modules",
      value: data.stats?.totalModules ?? 0,
      change: 0,
      icon: "BarChart3",
      color: "info" as const,
    },
  ];

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded || data.loading ? (
        <motion.div
          key="skeleton"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <DashboardPageSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Page header */}
            <motion.div variants={itemVariants}>
              <PageHeader
                title={t("superadmindashboard", { defaultValue: "Super Admin Dashboard" })}
                description={`Welcome back, ${user?.name || "Admin"}. Platform overview and system configuration.`}
              >
                <button
                  onClick={handleRefresh}
                  disabled={data.loading}
                  className="flex items-center gap-2 rounded-sm border border-border bg-white dark:bg-muted px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn(
                      "h-3.5 w-3.5",
                      data.loading && "animate-spin"
                    )}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <a
                  href="/admin/settings"
                  className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </a>
              </PageHeader>
            </motion.div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ADMIN_STATS.map((stat, i) => (
                <div key={stat.id} className="lg:col-span-1">
                  <StatCard data={stat} index={i} />
                </div>
              ))}
            </div>

            {/* System Configuration */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <SectionCard
                title={t("systemconfiguration", { defaultValue: "System Configuration" })}
                description={t("platformsettingsstatus", { defaultValue: "Platform settings status" })}
                className="lg:col-span-2"
              >
                <div className="space-y-2.5">
                  <ConfigStatus
                    label="Cloud Storage"
                    configured={data.stats?.storageConfigured ?? false}
                    href="/admin/settings/storage"
                  />
                  <ConfigStatus
                    label="Email Provider"
                    configured={data.stats?.emailConfigured ?? false}
                    href="/admin/settings/email"
                  />
                  <ConfigStatus
                    label="Payment Gateway"
                    configured={data.stats?.paymentConfigured ?? false}
                    href="/admin/settings/payment"
                  />
                </div>
              </SectionCard>

              {/* Quick Actions */}
              <SectionCard title={t("quickactions", { defaultValue: "Quick Actions" })} description={t("commonadmintasks", { defaultValue: "Common admin tasks" })}>
                <div className="space-y-2">
                  <a
                    href="/admin/companies"
                    className="flex items-center gap-2 rounded-sm p-2.5 text-sm hover:bg-muted transition-colors cursor-pointer group"
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    <span>Manage Companies</span>
                    <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                  <a
                    href="/admin/users"
                    className="flex items-center gap-2 rounded-sm p-2.5 text-sm hover:bg-muted transition-colors cursor-pointer group"
                  >
                    <Users className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    <span>Manage Users</span>
                    <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                  <a
                    href="/admin/packages"
                    className="flex items-center gap-2 rounded-sm p-2.5 text-sm hover:bg-muted transition-colors cursor-pointer group"
                  >
                    <Package className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    <span>Manage Packages</span>
                    <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                  <a
                    href="/admin/modules"
                    className="flex items-center gap-2 rounded-sm p-2.5 text-sm hover:bg-muted transition-colors cursor-pointer group"
                  >
                    <Activity className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    <span>Manage Modules</span>
                    <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                </div>
              </SectionCard>
            </div>

            {/* Companies List */}
            {data.companies.length > 0 && (
              <SectionCard
                title={t("recentcompanies", { defaultValue: "Recent Companies" })}
                description={`${data.companies.length} total companies`}
                action={{ label: "View All", href: "/admin/companies" }}
              >
                <div className="overflow-hidden">
                  <table className="w-full data-table">
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Industry</th>
                        <th>Created</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.companies.slice(0, 5).map((company) => (
                        <tr key={company.id}>
                          <td className="font-medium">{company.name}</td>
                          <td className="text-sm text-muted-foreground">
                            {company.industry || "—"}
                          </td>
                          <td className="text-sm text-muted-foreground">
                            {new Date(company.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <StatusBadge
                              variant="success"
                              label="Active"
                              dot
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}

            {/* Packages Overview */}
            {data.packages.length > 0 && (
              <SectionCard
                title={t("availablepackages", { defaultValue: "Available Packages" })}
                description={`${data.packages.length} total packages`}
                action={{ label: "Manage", href: "/admin/packages" }}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {data.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="rounded-sm border border-border/50 p-3 hover:border-border transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-medium text-foreground">
                          {pkg.name}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-2">
                        {pkg.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          ${pkg.price}/mo
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {pkg.modules?.length || 0} modules
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Modules List */}
            {data.modules.length > 0 && (
              <SectionCard
                title={t("availablemodules", { defaultValue: "Available Modules" })}
                description={`${data.modules.length} total modules`}
                action={{ label: "Manage", href: "/admin/modules" }}
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {data.modules.map((module) => (
                    <div
                      key={module.id}
                      className="rounded-sm border border-border/50 p-3 hover:border-border transition-colors"
                    >
                      <p className="text-xs font-medium text-foreground mb-1">
                        {module.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">
                        {module.description || "No description"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        ID: {module.id}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Users Summary */}
            {data.users.length > 0 && (
              <SectionCard
                title={t("userstatistics", { defaultValue: "User Statistics" })}
                description={`${data.users.length} total users`}
                action={{ label: "Manage Users", href: "/admin/users" }}
              >
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {data.users.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Users
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {data.users.filter((u) => u.superAdmin).length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Super Admins
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {data.users.filter((u) => !u.superAdmin).length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Regular Users
                    </p>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* Error State */}
            {data.error && (
              <motion.div
                variants={itemVariants}
                className="glass-card p-5 border border-error/20 bg-error/5"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-error">
                      Dashboard Error
                    </p>
                    <p className="text-xs text-error/70 mt-0.5">{data.error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
