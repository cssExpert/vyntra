"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { CRMPageSkeleton } from "@/components/common/DashboardSkeleton";
import { CRMHeader } from "./components/CRMHeader";
import { CRMToolbar } from "./components/CRMToolbar";
import { CRMFilterBar } from "./components/CRMFilterBar";
import { KanbanBoard } from "./components/KanbanBoard";
import { ContactsTable } from "./components/ContactsTable";
import { AddContactDrawer, type ContactFormData } from "./components/shared/AddContactDrawer";
import { type SortOption } from "./components/shared/SortDropdown";
import { SAMPLE_CONTACTS } from "./data/contacts";
import type { ContactListTab, CRMContact, CRMViewMode } from "./types";

export function CRMView() {
  const t = useTranslations("admin.crm");
  // ── View state ──────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState<ContactListTab>("all");
  const [viewMode,    setViewMode]    = useState<CRMViewMode>("board");
  const [search,      setSearch]      = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ── Sort state ──────────────────────────────────────────
  const [activeSort, setActiveSort] = useState("created_desc");
  const [sortField,  setSortField]  = useState("createdAt");
  const [sortOrder,  setSortOrder]  = useState<"asc" | "desc">("desc");

  // ── Filter state ────────────────────────────────────────
  const [selectedOwners,     setSelectedOwners]     = useState<string[]>([]);
  const [selectedDates,      setSelectedDates]      = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedStatuses,   setSelectedStatuses]   = useState<string[]>([]);

  // ── Local contacts (add new contacts) ───────────────────
  const [contacts, setContacts] = useState<CRMContact[]>(SAMPLE_CONTACTS);
  const isLoaded = usePageLoad(700);

  const handleSortChange = (opt: SortOption) => {
    setActiveSort(opt.id);
    setSortField(opt.field);
    setSortOrder(opt.order);
  };

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
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      lastActivity: "Just now",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setContacts((prev) => [newContact, ...prev]);
  };

  // ── Filtered + sorted contacts ──────────────────────────
  const filteredContacts = useMemo(() => {
    let result = contacts;

    // Tab filter
    if (activeTab === "newsletter") {
      result = result.filter((c) => c.tags?.includes("newsletter") || c.stage === "subscriber");
    } else if (activeTab === "unsubscribed") {
      result = result.filter((c) => c.isUnsubscribed);
    } else if (activeTab === "customers") {
      result = result.filter((c) => c.stage === "customer");
    }

    // Owner filter
    if (selectedOwners.length > 0) {
      result = result.filter((c) => {
        if (selectedOwners.includes("unassigned") && !c.owner) return true;
        if (selectedOwners.includes("me") && c.owner === "Ravi Gupta") return true;
        if (selectedOwners.includes("ravi") && c.owner === "Ravi Gupta") return true;
        if (selectedOwners.includes("alex") && c.owner === "Alex Smith") return true;
        if (selectedOwners.includes("emma") && c.owner === "Emma Davis") return true;
        return false;
      });
    }

    // Lead status filter
    if (selectedStatuses.length > 0) {
      result = result.filter((c) => selectedStatuses.includes(c.stage));
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.owner?.toLowerCase().includes(q),
      );
    }

    // Sort
    return [...result].sort((a, b) => {
      let aVal = a[sortField as keyof CRMContact] ?? "";
      let bVal = b[sortField as keyof CRMContact] ?? "";
      if (sortField === "value") { aVal = a.value ?? 0; bVal = b.value ?? 0; }
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [contacts, activeTab, selectedOwners, selectedStatuses, search, sortField, sortOrder]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div
          key="skeleton"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <CRMPageSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-full"
      >
        {/* Header: tabs + add button */}
        <CRMHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalContacts={contacts.length}
          onAddContact={() => setIsDrawerOpen(true)}
        />

        {/* Toolbar: search + view + sort + export */}
        <CRMToolbar
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewChange={setViewMode}
          activeSort={activeSort}
          onSortChange={handleSortChange}
        />

        {/* Filter pills: owner, date, activity, status */}
        <CRMFilterBar
          owners={selectedOwners}
          dates={selectedDates}
          activities={selectedActivities}
          statuses={selectedStatuses}
          onOwnersChange={setSelectedOwners}
          onDatesChange={setSelectedDates}
          onActivitiesChange={setSelectedActivities}
          onStatusesChange={setSelectedStatuses}
        />

        {/* Active filter chips */}
        {(selectedOwners.length > 0 || selectedStatuses.length > 0 || selectedDates.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1.5 mb-3"
          >
            {selectedOwners.map((o) => (
              <span key={o} className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                Owner: {o}
                <button onClick={() => setSelectedOwners((p) => p.filter((x) => x !== o))} className="cursor-pointer opacity-60 hover:opacity-100">×</button>
              </span>
            ))}
            {selectedStatuses.map((s) => (
              <span key={s} className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-400">
                Status: {s}
                <button onClick={() => setSelectedStatuses((p) => p.filter((x) => x !== s))} className="cursor-pointer opacity-60 hover:opacity-100">×</button>
              </span>
            ))}
            <button
              onClick={() => { setSelectedOwners([]); setSelectedDates([]); setSelectedActivities([]); setSelectedStatuses([]); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-1"
            >
              Clear all
            </button>
          </motion.div>
        )}

        {/* Board / List */}
        {viewMode === "board" ? (
          <KanbanBoard contacts={filteredContacts} />
        ) : (
          <ContactsTable contacts={filteredContacts} />
        )}
      </motion.div>

      {/* Add contact drawer */}
      <AddContactDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleAddContact}
      />
    </>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
