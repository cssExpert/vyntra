"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronDown, Plus, MoreHorizontal, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactListTab, ContactListTabDef } from "../types";

interface CRMHeaderProps {
  activeTab: ContactListTab;
  onTabChange: (tab: ContactListTab) => void;
  totalContacts: number;
  onAddContact: () => void;
}

const TAB_IDS: ContactListTabDef["id"][] = [
  "all",
  "newsletter",
  "unsubscribed",
  "customers",
];

export function CRMHeader({
  activeTab,
  onTabChange,
  totalContacts,
  onAddContact,
}: CRMHeaderProps) {
  const t = useTranslations("crm");
  const TABS: ContactListTabDef[] = TAB_IDS.map((id) => ({
    id,
    label: t(`tabs.${id}` as never),
  }));
  return (
    <div className="flex items-center gap-3 mb-4">
      {/* Contacts dropdown */}
      <button className="flex items-center min-h-10 max-h-10 gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer flex-shrink-0">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        {t("contacts")}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {/* Tab bar */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center min-h-10 max-h-10 gap-2 px-3 py-2 border border-border rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer flex-shrink-0 bg-white dark:bg-muted",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/150",
              )}
            >
              {tab.label}
              {isActive && tab.id === "all" && (
                <>
                  <span className="rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                    {totalContacts}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </>
              )}
              {isActive && (
                <motion.div
                  layoutId="crm-tab-indicator"
                  className="absolute inset-0 rounded-lg bg-muted -z-10"
                  transition={{ type: "tween", duration: 0.18 }}
                />
              )}
            </button>
          );
        })}

        {/* Add view */}
        <button
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title={t("addView")}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <button
          onClick={onAddContact}
          className="flex items-center gap-2 h-10 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-600 transition-colors cursor-pointer shadow-glow-brand"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("addContact")}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </div>
    </div>
  );
}
