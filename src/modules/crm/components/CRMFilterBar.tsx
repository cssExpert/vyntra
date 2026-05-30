"use client";

import { Plus, Pencil, SlidersHorizontal } from "lucide-react";
import { FilterPopover, type FilterOption } from "./shared/FilterPopover";

// ─── Filter option definitions ──────────────────────────
const OWNER_OPTIONS: FilterOption[] = [
  { id: "me",          label: "Me",          subtitle: "Dynamically applied to the current user", isDynamic: true },
  { id: "deactivated", label: "All deactivated and removed owners", isDynamic: true },
  { id: "ravi",        label: "Ravi Gupta"  },
  { id: "alex",        label: "Alex Smith"  },
  { id: "emma",        label: "Emma Davis"  },
  { id: "unassigned",  label: "Unassigned"  },
];

const DATE_OPTIONS: FilterOption[] = [
  { id: "today",       label: "Today"          },
  { id: "7d",          label: "Last 7 days"    },
  { id: "30d",         label: "Last 30 days"   },
  { id: "90d",         label: "Last 90 days"   },
  { id: "this_month",  label: "This month"     },
  { id: "last_month",  label: "Last month"     },
  { id: "this_year",   label: "This year"      },
];

const ACTIVITY_OPTIONS: FilterOption[] = [
  { id: "1d",    label: "Last 24 hours" },
  { id: "3d",    label: "Last 3 days"   },
  { id: "7d",    label: "Last 7 days"   },
  { id: "30d",   label: "Last 30 days"  },
  { id: "email", label: "Email sent"    },
  { id: "call",  label: "Call made"     },
  { id: "none",  label: "No activity"   },
];

const STATUS_OPTIONS: FilterOption[] = [
  { id: "subscriber",  label: "Subscriber"               },
  { id: "lead",        label: "Lead"                     },
  { id: "mql",         label: "Marketing Qualified Lead" },
  { id: "sql",         label: "Sales Qualified Lead"     },
  { id: "opportunity", label: "Opportunity"              },
  { id: "customer",    label: "Customer"                 },
];

interface CRMFilterBarProps {
  owners:     string[];
  dates:      string[];
  activities: string[];
  statuses:   string[];
  onOwnersChange:     (v: string[]) => void;
  onDatesChange:      (v: string[]) => void;
  onActivitiesChange: (v: string[]) => void;
  onStatusesChange:   (v: string[]) => void;
}

export function CRMFilterBar({
  owners, dates, activities, statuses,
  onOwnersChange, onDatesChange, onActivitiesChange, onStatusesChange,
}: CRMFilterBarProps) {
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <FilterPopover
        label="Contact owner"
        options={OWNER_OPTIONS}
        selected={owners}
        onChange={onOwnersChange}
        width={380}
      />
      <FilterPopover
        label="Create date"
        options={DATE_OPTIONS}
        selected={dates}
        onChange={onDatesChange}
        searchable={false}
        width={240}
      />
      <FilterPopover
        label="Last activity date"
        options={ACTIVITY_OPTIONS}
        selected={activities}
        onChange={onActivitiesChange}
        searchable={false}
        width={240}
      />
      <FilterPopover
        label="Lead status"
        options={STATUS_OPTIONS}
        selected={statuses}
        onChange={onStatusesChange}
        searchable={false}
        width={280}
      />

      {/* Add filter */}
      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted transition-colors cursor-pointer">
        <Plus className="h-3.5 w-3.5" />
      </button>

      <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <div className="h-5 w-px bg-border mx-1" />

      <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Advanced filters
      </button>
    </div>
  );
}
