"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CRMContact, PipelineStage } from "../types";
import { LeadCard } from "./LeadCard";

interface KanbanColumnProps {
  stage: PipelineStage;
  contacts: CRMContact[];
}

export function KanbanColumn({ stage, contacts }: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const count = contacts.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "flex flex-col flex-shrink-0 rounded-xl border border-border bg-muted/30",
        "transition-all duration-300",
        isCollapsed ? "w-12" : "w-[300px]",
      )}
    >
      {/* Column header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-3 border-b border-border/60",
          isCollapsed && "flex-col gap-2 px-2 py-3",
        )}
      >
        {isCollapsed ? (
          <>
            {/* Collapsed: vertical label */}
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer"
              title="Expand"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground rotate-180" />
            </button>
            <div
              className="writing-mode-vertical text-xs font-semibold text-muted-foreground select-none cursor-pointer"
              onClick={() => setIsCollapsed(false)}
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: 120 }}
            >
              {stage.shortLabel}
            </div>
            <span className={cn("text-xs font-bold rounded-full px-1.5 py-0.5", stage.color, stage.textColor)}>
              {count}
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">{stage.label}</span>
              <span className={cn("text-xs font-semibold rounded-full px-2 py-0.5 flex-shrink-0", stage.color, stage.textColor)}>
                {count}
              </span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer"
              title="Collapse"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </>
        )}
      </div>

      {/* Cards list */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar min-h-[120px] max-h-[calc(100vh-280px)]"
          >
            {contacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-2">
                  <Plus className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <p className="text-xs text-muted-foreground/60">No contacts</p>
              </div>
            ) : (
              contacts.map((contact, i) => (
                <LeadCard key={contact.id} contact={contact} index={i} />
              ))
            )}

            {/* Add card button */}
            {contacts.length > 0 && (
              <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/50 transition-all duration-150 cursor-pointer">
                <Plus className="h-3.5 w-3.5" />
                Add contact
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
