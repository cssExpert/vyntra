"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, HelpCircle } from "lucide-react";
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

import {
  SKELETON_COLUMNS,
  buildSubscriberColumns,
  subscriberSearchFilter,
} from "./newsletter-subscribers-table-config";
import { NewsletterSubscribersTable } from "./NewsletterSubscribersTable";
import { newsletterSubscribers } from "@/lib/api";
import type { NewsletterSubscriber } from "./newsletter-subscribers.types";

export function NewsletterSubscribersView() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deletingSubscriber, setDeletingSubscriber] =
    useState<NewsletterSubscriber | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    newsletterSubscribers
      .list()
      .then((data) => setSubscribers(data as unknown as NewsletterSubscriber[]))
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

  const columns = useMemo(
    () =>
      buildSubscriberColumns({
        onDelete: (row) => setDeletingSubscriber(row),
      }),
    [],
  );

  const table = useReactTable({
    data: subscribers,
    columns,
    state: { globalFilter: searchTerm, sorting, rowSelection, pagination },
    onGlobalFilterChange: setSearchTerm,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    globalFilterFn: subscriberSearchFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const handleConfirmDelete = useCallback(() => {
    if (!deletingSubscriber) return;
    newsletterSubscribers
      .delete(deletingSubscriber.id)
      .then(() => {
        setSubscribers((prev) =>
          prev.filter((s) => s.id !== deletingSubscriber.id),
        );
      })
      .catch(() => {});
    setDeletingSubscriber(null);
  }, [deletingSubscriber]);

  const filteredCount = table.getFilteredRowModel().rows.length;
  const selectedCount = Object.keys(rowSelection).length;
  const hasFiltersApplied = !!searchTerm;

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
              title="Newsletter Subscribers"
              paragraph={`${filteredCount} ${filteredCount === 1 ? "subscriber" : "subscribers"}${selectedCount > 0 ? ` · ${selectedCount} selected` : ""}`}
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
                  placeholder="Search subscribers…"
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

          {/* ── Table ───────────────────────────────────────────────────── */}
          <NewsletterSubscribersTable
            table={table}
            hasFiltersApplied={hasFiltersApplied}
          />

          {/* ── Delete modal ────────────────────────────────────────────── */}
          <Modal
            isOpen={!!deletingSubscriber}
            onClose={() => setDeletingSubscriber(null)}
            title="Remove Subscriber?"
            description={
              <>
                Are you sure you want to remove{" "}
                <strong className="text-foreground">
                  &ldquo;{deletingSubscriber?.email}&rdquo;
                </strong>{" "}
                from your newsletter list? This action cannot be undone.
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
                  onClick={() => setDeletingSubscriber(null)}
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
                  Yes, Remove
                </Button>
              </>
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
