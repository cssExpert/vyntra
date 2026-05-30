"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { PIPELINE_STAGES } from "../data/contacts";
import { KanbanColumn } from "./KanbanColumn";
import type { CRMContact } from "../types";

interface KanbanBoardProps {
  contacts: CRMContact[];
}

export function KanbanBoard({ contacts }: KanbanBoardProps) {
  // Group contacts by pipeline stage
  const grouped = useMemo(() => {
    return PIPELINE_STAGES.reduce<Record<string, CRMContact[]>>((acc, stage) => {
      acc[stage.id] = contacts.filter((c) => c.stage === stage.id);
      return acc;
    }, {});
  }, [contacts]);

  return (
    <div
      className={cn(
        "flex gap-3 overflow-x-auto pb-4 pt-1",
        "no-scrollbar",
      )}
    >
      {PIPELINE_STAGES.map((stage) => (
        <KanbanColumn
          key={stage.id}
          stage={stage}
          contacts={grouped[stage.id] ?? []}
        />
      ))}
    </div>
  );
}
