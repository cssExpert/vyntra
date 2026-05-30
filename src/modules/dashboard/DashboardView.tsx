"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { DashboardPageSkeleton } from "@/components/common/DashboardSkeleton";
import {
  RefreshCw,
  Plus,
  ArrowRight,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RevenueChart } from "@/components/charts/RevenueChart";
import {
  DASHBOARD_STATS,
  REVENUE_CHART_DATA,
  SAMPLE_LEADS,
  RECENT_ACTIVITY,
  SAMPLE_PAYMENTS,
  LIGHTHOUSE_REPORTS,
  SAMPLE_CAMPAIGNS,
  INTEGRATIONS,
} from "@/data/sampleData";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  formatNumber,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

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

function LighthouseScoreRing({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const color = score >= 90 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg width="52" height="52" className="-rotate-90">
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="3"
          />
          <circle
            cx="26"
            cy="26"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  crm_lead: (
    <div className="h-7 w-7 rounded-full bg-info/15 flex items-center justify-center">
      <Zap className="h-3.5 w-3.5 text-info" />
    </div>
  ),
  payment: (
    <div className="h-7 w-7 rounded-full bg-success/15 flex items-center justify-center">
      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
    </div>
  ),
  lighthouse_report: (
    <div className="h-7 w-7 rounded-full bg-warning/15 flex items-center justify-center">
      <Activity className="h-3.5 w-3.5 text-warning" />
    </div>
  ),
  email_campaign: (
    <div className="h-7 w-7 rounded-full bg-brand-500/15 flex items-center justify-center">
      <Zap className="h-3.5 w-3.5 text-brand-400" />
    </div>
  ),
  store_order: (
    <div className="h-7 w-7 rounded-full bg-purple-500/15 flex items-center justify-center">
      <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
    </div>
  ),
  user_signup: (
    <div className="h-7 w-7 rounded-full bg-cyan-500/15 flex items-center justify-center">
      <Zap className="h-3.5 w-3.5 text-cyan-400" />
    </div>
  ),
  seo_alert: (
    <div className="h-7 w-7 rounded-full bg-error/15 flex items-center justify-center">
      <AlertCircle className="h-3.5 w-3.5 text-error" />
    </div>
  ),
};

export function DashboardView() {
  const desktopReport = LIGHTHOUSE_REPORTS.find((r) => r.device === "desktop");
  const mobileReport = LIGHTHOUSE_REPORTS.find((r) => r.device === "mobile");
  const isLoaded = usePageLoad(700);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
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
          title="Dashboard"
          description="Welcome back, Ravi. Here's your business overview."
        >
          <button className="flex items-center gap-2 rounded-sm border border-border bg-white dark:bg-muted px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer">
            <Plus className="h-3.5 w-3.5" />
            Quick Add
          </button>
        </PageHeader>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {DASHBOARD_STATS.map((stat, i) => (
          <div key={stat.id} className="xl:col-span-1 sm:col-span-1">
            <StatCard data={stat} index={i} />
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue chart — takes 2 cols */}
        <SectionCard
          title="Revenue Overview"
          description="Monthly revenue vs previous year"
          action={{ label: "View Reports", href: "/reports" }}
          className="lg:col-span-2"
        >
          <RevenueChart data={REVENUE_CHART_DATA} />
          <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-4 rounded-full bg-brand-500" />
              <span className="text-xs text-muted-foreground">This Year</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-px w-4 border-t-2 border-dashed border-purple-400" />
              <span className="text-xs text-muted-foreground">Last Year</span>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground">YTD Total</p>
              <p className="text-sm font-bold text-foreground">
                {formatCurrency(124750)}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Recent Activity */}
        <SectionCard
          title="Recent Activity"
          action={{ label: "View All", href: "/reports" }}
        >
          <div className="space-y-3">
            {RECENT_ACTIVITY.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {ACTIVITY_ICONS[item.type] ?? (
                    <div className="h-7 w-7 rounded-full bg-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground leading-snug">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 truncate">
                    {item.description}
                  </p>
                </div>
                <span className="flex-shrink-0 text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDate(item.timestamp, "relative")}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* CRM Leads */}
        <SectionCard
          title="Top Leads"
          description="Your hottest CRM prospects"
          action={{ label: "View CRM", href: "/crm" }}
          className="lg:col-span-1"
        >
          <div className="space-y-2.5">
            {SAMPLE_LEADS.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 rounded-sm p-2 hover:bg-muted/50 transition-colors duration-150 cursor-pointer group"
              >
                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-white">
                  {lead.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">
                    {lead.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {lead.company}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <StatusBadge
                    variant={
                      lead.status === "won"
                        ? "success"
                        : lead.status === "lost"
                          ? "error"
                          : lead.status === "negotiation" ||
                              lead.status === "proposal"
                            ? "warning"
                            : lead.status === "new"
                              ? "info"
                              : "default"
                    }
                    label={lead.status}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Lighthouse Scores */}
        <SectionCard
          title="Website Health"
          description="Latest Lighthouse audit results"
          action={{ label: "Full Report", href: "/lighthouse" }}
        >
          {desktopReport && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Desktop
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(desktopReport.runAt, "relative")}
                  </span>
                </div>
                <div className="flex items-center justify-around">
                  <LighthouseScoreRing
                    score={desktopReport.performance}
                    label="Perf"
                  />
                  <LighthouseScoreRing
                    score={desktopReport.accessibility}
                    label="A11y"
                  />
                  <LighthouseScoreRing
                    score={desktopReport.bestPractices}
                    label="Best"
                  />
                  <LighthouseScoreRing score={desktopReport.seo} label="SEO" />
                </div>
              </div>
              {mobileReport && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Mobile
                    </span>
                  </div>
                  <div className="flex items-center justify-around">
                    <LighthouseScoreRing
                      score={mobileReport.performance}
                      label="Perf"
                    />
                    <LighthouseScoreRing
                      score={mobileReport.accessibility}
                      label="A11y"
                    />
                    <LighthouseScoreRing
                      score={mobileReport.bestPractices}
                      label="Best"
                    />
                    <LighthouseScoreRing score={mobileReport.seo} label="SEO" />
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Email Campaigns */}
        <SectionCard
          title="Email Campaigns"
          description="Recent campaign performance"
          action={{ label: "View All", href: "/email" }}
        >
          <div className="space-y-3">
            {SAMPLE_CAMPAIGNS.map((campaign) => {
              const openRate =
                campaign.sent > 0
                  ? ((campaign.opened / campaign.sent) * 100).toFixed(1)
                  : "0";
              return (
                <div
                  key={campaign.id}
                  className="rounded-sm border border-border/50 p-3 hover:border-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-medium text-foreground truncate">
                      {campaign.name}
                    </p>
                    <StatusBadge
                      variant={
                        campaign.status === "sent"
                          ? "success"
                          : campaign.status === "scheduled"
                            ? "info"
                            : campaign.status === "sending"
                              ? "default"
                              : "muted"
                      }
                      label={campaign.status}
                      size="sm"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{formatNumber(campaign.recipients)} recipients</span>
                    {campaign.status === "sent" && (
                      <>
                        <span className="text-success">{openRate}% open</span>
                        <span className="text-primary">
                          {formatNumber(campaign.clicked)} clicks
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Payments */}
        <SectionCard
          title="Recent Payments"
          action={{ label: "View Payments", href: "/payments" }}
        >
          <div className="overflow-hidden">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_PAYMENTS.map((payment) => (
                  <tr key={payment.id}>
                    <td className="font-medium">{payment.customer}</td>
                    <td className="font-mono text-xs">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td>
                      <StatusBadge
                        variant={
                          payment.status === "completed"
                            ? "success"
                            : payment.status === "pending"
                              ? "warning"
                              : payment.status === "failed"
                                ? "error"
                                : "muted"
                        }
                        label={payment.status}
                        dot
                      />
                    </td>
                    <td className="text-muted-foreground">
                      {formatDate(payment.createdAt, "short")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Integration Status */}
        <SectionCard
          title="Integration Status"
          description="Connected services and platforms"
          action={{ label: "Manage", href: "/settings" }}
        >
          <div className="grid grid-cols-2 gap-2">
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center gap-2.5 rounded-sm border border-border/50 p-2.5 hover:border-border transition-colors cursor-pointer group"
              >
                <div
                  className="h-7 w-7 flex-shrink-0 rounded-sm flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: integration.color }}
                >
                  {integration.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">
                    {integration.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        integration.status === "connected"
                          ? "bg-success"
                          : integration.status === "pending"
                            ? "bg-warning"
                            : "bg-muted-foreground",
                      )}
                    />
                    <span className="text-[10px] capitalize text-muted-foreground">
                      {integration.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
