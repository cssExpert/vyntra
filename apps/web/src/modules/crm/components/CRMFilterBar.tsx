"use client";

import { useTranslations } from "next-intl";
import { Plus, Pencil, SlidersHorizontal } from "lucide-react";
import { FilterPopover, type FilterOption } from "./shared/FilterPopover";

interface CRMFilterBarProps {
  owners: string[];
  dates: string[];
  activities: string[];
  statuses: string[];
  onOwnersChange: (v: string[]) => void;
  onDatesChange: (v: string[]) => void;
  onActivitiesChange: (v: string[]) => void;
  onStatusesChange: (v: string[]) => void;
}

export function CRMFilterBar({
  owners,
  dates,
  activities,
  statuses,
  onOwnersChange,
  onDatesChange,
  onActivitiesChange,
  onStatusesChange,
}: CRMFilterBarProps) {
  const t = useTranslations("crm");

  // ─── Filter option definitions (translated) ──────────────
  const OWNER_OPTIONS: FilterOption[] = [
    {
      id: "me",
      label: t("ownerOptions.me"),
      subtitle: t("ownerOptions.meSubtitle"),
      isDynamic: true,
    },
    {
      id: "deactivated",
      label: t("ownerOptions.deactivated"),
      isDynamic: true,
    },
    { id: "ravi", label: "Ravi Gupta" },
    { id: "alex", label: "Alex Smith" },
    { id: "emma", label: "Emma Davis" },
    { id: "unassigned", label: t("ownerOptions.unassigned") },
  ];

  const DATE_OPTIONS: FilterOption[] = [
    { id: "today", label: t("dateOptions.today") },
    { id: "7d", label: t("dateOptions.last7") },
    { id: "30d", label: t("dateOptions.last30") },
    { id: "90d", label: t("dateOptions.last90") },
    { id: "this_month", label: t("dateOptions.thisMonth") },
    { id: "last_month", label: t("dateOptions.lastMonth") },
    { id: "this_year", label: t("dateOptions.thisYear") },
  ];

  const ACTIVITY_OPTIONS: FilterOption[] = [
    { id: "1d", label: t("activityOptions.last24h") },
    { id: "3d", label: t("activityOptions.last3d") },
    { id: "7d", label: t("activityOptions.last7d") },
    { id: "30d", label: t("activityOptions.last30d") },
    { id: "email", label: t("activityOptions.emailSent") },
    { id: "call", label: t("activityOptions.callMade") },
    { id: "none", label: t("activityOptions.noActivity") },
  ];

  // Stage labels stay data-driven — they will come from the backend pipeline
  const STATUS_OPTIONS: FilterOption[] = [
    { id: "subscriber", label: "Subscriber" },
    { id: "lead", label: "Lead" },
    { id: "mql", label: "Marketing Qualified Lead" },
    { id: "sql", label: "Sales Qualified Lead" },
    { id: "opportunity", label: "Opportunity" },
    { id: "customer", label: "Customer" },
  ];

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <FilterPopover
        label={t("filterOwner")}
        options={OWNER_OPTIONS}
        selected={owners}
        onChange={onOwnersChange}
        width={380}
      />
      <FilterPopover
        label={t("filterCreateDate")}
        options={DATE_OPTIONS}
        selected={dates}
        onChange={onDatesChange}
        searchable={false}
        width={240}
      />
      <FilterPopover
        label={t("filterActivity")}
        options={ACTIVITY_OPTIONS}
        selected={activities}
        onChange={onActivitiesChange}
        searchable={false}
        width={240}
      />
      <FilterPopover
        label={t("filterStatus")}
        options={STATUS_OPTIONS}
        selected={statuses}
        onChange={onStatusesChange}
        searchable={false}
        width={280}
      />

      {/* Add filter */}
      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground bg-white dark:bg-muted hover:text-foreground hover:border-border hover:bg-muted transition-colors cursor-pointer">
        <Plus className="h-3.5 w-3.5" />
      </button>

      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground bg-white dark:bg-muted hover:text-foreground hover:border-border hover:bg-muted transition-colors cursor-pointer">
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <div className="h-5 w-px bg-border mx-1" />

      <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {t("advancedFilters")}
      </button>
    </div>
  );
}
