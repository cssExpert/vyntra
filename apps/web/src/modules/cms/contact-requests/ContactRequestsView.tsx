"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, HelpCircle, Inbox, Mail, MailOpen, Phone } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";

import SectionTitle from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/common/Modal";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { MotionTabs, type MotionTabItem } from "@/components/ui/MotionTabs";

import {
  SKELETON_COLUMNS,
  buildContactColumns,
  contactSearchFilter,
  formatContactDate,
} from "./contact-requests-table-config";
import { ContactRequestsTable } from "./ContactRequestsTable";
import { contactRequests } from "@/lib/api";
import type { ContactStatus, ContactSubmission } from "./contact-requests.types";

type TabKey = "all" | ContactStatus;

export function ContactRequestsView() {
  const [requests, setRequests] = useState<ContactSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [viewingRequest, setViewingRequest] = useState<ContactSubmission | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<ContactSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    contactRequests
      .list()
      .then((data) => setRequests(data as unknown as ContactSubmission[]))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Lock outer scroll while table is mounted
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  const tabs = useMemo<MotionTabItem<TabKey>[]>(
    () => [
      { id: "all", label: "All", icon: Inbox, badge: requests.length },
      {
        id: "New",
        label: "New",
        icon: Mail,
        badge: requests.filter((r) => r.status === "New").length,
      },
      {
        id: "Read",
        label: "Read",
        icon: MailOpen,
        badge: requests.filter((r) => r.status === "Read").length,
      },
    ],
    [requests],
  );

  const tabFilteredRequests = useMemo(() => {
    if (activeTab === "all") return requests;
    return requests.filter((r) => r.status === activeTab);
  }, [requests, activeTab]);

  const handleToggleStatus = useCallback((row: ContactSubmission) => {
    const nextStatus: ContactStatus = row.status === "New" ? "Read" : "New";
    contactRequests
      .updateStatus(row.id, nextStatus)
      .then(() => {
        setRequests((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, status: nextStatus } : r)),
        );
      })
      .catch(() => {});
  }, []);

  const handleView = useCallback(
    (row: ContactSubmission) => {
      setViewingRequest(row);
      if (row.status === "New") handleToggleStatus(row);
    },
    [handleToggleStatus],
  );

  const columns = useMemo(
    () =>
      buildContactColumns({
        onView: handleView,
        onToggleStatus: handleToggleStatus,
        onDelete: (row) => setDeletingRequest(row),
      }),
    [handleView, handleToggleStatus],
  );

  const table = useReactTable({
    data: tabFilteredRequests,
    columns,
    state: { globalFilter: searchTerm, sorting, rowSelection, pagination },
    onGlobalFilterChange: setSearchTerm,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    globalFilterFn: contactSearchFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const handleConfirmDelete = () => {
    if (!deletingRequest) return;
    contactRequests
      .delete(deletingRequest.id)
      .then(() => {
        setRequests((prev) => prev.filter((r) => r.id !== deletingRequest.id));
      })
      .catch(() => {});
    setDeletingRequest(null);
  };

  const filteredCount = table.getFilteredRowModel().rows.length;
  const selectedCount = Object.keys(rowSelection).length;
  const hasFiltersApplied = !!searchTerm || activeTab !== "all";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isLoading ? (
        <motion.div
          key="skeleton"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <TableSkeleton columns={SKELETON_COLUMNS} rows={8} />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <SectionTitle
              title="Contact Requests"
              paragraph={`${filteredCount} ${filteredCount === 1 ? "request" : "requests"}${selectedCount > 0 ? ` · ${selectedCount} selected` : ""}`}
              mb="0"
              className="!w-auto"
            />

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Search */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Search size={14} />
                </span>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search requests…"
                  size="lg"
                  className="pl-9 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 w-56"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 h-full w-8 text-muted-foreground hover:text-foreground"
                  >
                    <X size={13} />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ── Status tabs ─────────────────────────────────────────────── */}
          <MotionTabs
            tabs={tabs}
            active={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            layoutId="cms-contact-requests-tab"
            className="w-fit mt-5"
          />

          {/* ── Table ───────────────────────────────────────────────────── */}
          <ContactRequestsTable
            table={table}
            hasFiltersApplied={hasFiltersApplied}
          />

          {/* ── View modal ──────────────────────────────────────────────── */}
          <Modal
            isOpen={!!viewingRequest}
            onClose={() => setViewingRequest(null)}
            title={viewingRequest?.subject || "Contact Request"}
            description={
              viewingRequest
                ? `Received ${formatContactDate(viewingRequest.createdAt)}`
                : undefined
            }
            icon={<Mail size={20} />}
            maxWidth="lg"
          >
            {viewingRequest && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Name
                    </p>
                    <p className="text-foreground">{viewingRequest.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <p className="text-foreground">{viewingRequest.email}</p>
                  </div>
                  {viewingRequest.phone && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Phone
                      </p>
                      <p className="text-foreground flex items-center gap-1.5">
                        <Phone size={13} className="text-muted-foreground" />
                        {viewingRequest.phone}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Message
                  </p>
                  <p className="text-foreground whitespace-pre-line leading-relaxed">
                    {viewingRequest.message}
                  </p>
                </div>
              </div>
            )}
          </Modal>

          {/* ── Delete modal ────────────────────────────────────────────── */}
          <Modal
            isOpen={!!deletingRequest}
            onClose={() => setDeletingRequest(null)}
            title="Delete Contact Request?"
            description={
              <>
                Are you sure you want to delete the request from{" "}
                <strong className="text-foreground">
                  &ldquo;{deletingRequest?.name}&rdquo;
                </strong>
                ? This action cannot be undone.
              </>
            }
            icon={<HelpCircle size={20} />}
            iconVariant="danger"
            maxWidth="md"
            footer={
              <>
                <Button
                  variant="ghost"
                  radius="sm"
                  onClick={() => setDeletingRequest(null)}
                  className="font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  radius="sm"
                  onClick={handleConfirmDelete}
                  className="px-5 font-semibold active:scale-95"
                >
                  Yes, Delete
                </Button>
              </>
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
