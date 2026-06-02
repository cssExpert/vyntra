"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { PIPELINE_STAGES } from "../data/contacts";
import { KanbanColumn } from "./KanbanColumn";
import type { CRMContact } from "../types";
import {
  AddContactDrawer,
  type ContactFormData,
} from "@/modules/crm/components/shared/AddContactDrawer";

interface KanbanBoardProps {
  contacts: CRMContact[];
}

export function KanbanBoard({ contacts: initialContacts }: KanbanBoardProps) {
  // Local state owns the list so new contacts added via the drawer are reflected
  const [contacts, setContacts] = useState<CRMContact[]>(initialContacts);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const grouped = useMemo(
    () =>
      PIPELINE_STAGES.reduce<Record<string, CRMContact[]>>((acc, stage) => {
        acc[stage.id] = contacts.filter((c) => c.stage === stage.id);
        return acc;
      }, {}),
    [contacts],
  );

  const handleAddContact = (data: ContactFormData) => {
    const newContact: CRMContact = {
      id: `c${Date.now()}`,
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      phone: data.phone || undefined,
      company: data.company || undefined,
      owner: data.owner || undefined,
      stage: data.stage,
      source: (data.source as CRMContact["source"]) || undefined,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      lastActivity: "Just now",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setContacts((prev) => [newContact, ...prev]);
  };

  return (
    <>
      <div
        className={cn("flex gap-3 overflow-x-auto pb-4 pt-1", "no-scrollbar")}
      >
        {PIPELINE_STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            contacts={grouped[stage.id] ?? []}
            onAddContact={() => setIsDrawerOpen(true)}
          />
        ))}
      </div>

      {/* Single drawer instance — outside the map */}
      <AddContactDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleAddContact}
      />
    </>
  );
}
