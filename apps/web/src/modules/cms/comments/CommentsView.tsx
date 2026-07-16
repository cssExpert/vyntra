"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, HelpCircle, MessageCircle, Clock, CheckCircle2, XCircle, Star } from "lucide-react";
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
  buildCommentColumns,
  commentSearchFilter,
  formatCommentDate,
  ResourceTypeBadge,
} from "./comments-table-config";
import { CommentsTable } from "./CommentsTable";
import { comments as commentsApi } from "@/lib/api";
import type { CommentStatus, Comment } from "./comments.types";

type TabKey = "all" | CommentStatus;

export function CommentsView() {
  const [rows, setRows] = useState<Comment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [viewingComment, setViewingComment] = useState<Comment | null>(null);
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    commentsApi
      .list()
      .then((data) => setRows(data as unknown as Comment[]))
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
      { id: "all", label: "All", icon: MessageCircle, badge: rows.length },
      { id: "PENDING", label: "Pending", icon: Clock, badge: rows.filter((r) => r.status === "PENDING").length },
      { id: "APPROVED", label: "Approved", icon: CheckCircle2, badge: rows.filter((r) => r.status === "APPROVED").length },
      { id: "REJECTED", label: "Rejected", icon: XCircle, badge: rows.filter((r) => r.status === "REJECTED").length },
    ],
    [rows],
  );

  const tabFilteredRows = useMemo(() => {
    if (activeTab === "all") return rows;
    return rows.filter((r) => r.status === activeTab);
  }, [rows, activeTab]);

  const handleSetStatus = useCallback((row: Comment, status: CommentStatus) => {
    commentsApi
      .updateStatus(row.id, status)
      .then(() => {
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
        setViewingComment((prev) => (prev && prev.id === row.id ? { ...prev, status } : prev));
      })
      .catch(() => {});
  }, []);

  const columns = useMemo(
    () =>
      buildCommentColumns({
        onView: (row) => setViewingComment(row),
        onApprove: (row) => handleSetStatus(row, "APPROVED"),
        onReject: (row) => handleSetStatus(row, "REJECTED"),
        onDelete: (row) => setDeletingComment(row),
      }),
    [handleSetStatus],
  );

  const table = useReactTable({
    data: tabFilteredRows,
    columns,
    state: { globalFilter: searchTerm, sorting, rowSelection, pagination },
    onGlobalFilterChange: setSearchTerm,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    globalFilterFn: commentSearchFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const handleConfirmDelete = () => {
    if (!deletingComment) return;
    commentsApi
      .delete(deletingComment.id)
      .then(() => {
        setRows((prev) => prev.filter((r) => r.id !== deletingComment.id));
      })
      .catch(() => {});
    setDeletingComment(null);
  };

  const filteredCount = table.getFilteredRowModel().rows.length;
  const selectedCount = Object.keys(rowSelection).length;
  const hasFiltersApplied = !!searchTerm || activeTab !== "all";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isLoading ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
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
              title="Comments"
              paragraph={`${filteredCount} ${filteredCount === 1 ? "comment" : "comments"}${selectedCount > 0 ? ` · ${selectedCount} selected` : ""}`}
              mb="0"
              className="!w-auto"
            />

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Search size={14} />
                </span>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search comments…"
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
            layoutId="cms-comments-tab"
            className="w-fit mt-5"
          />

          {/* ── Table ───────────────────────────────────────────────────── */}
          <CommentsTable table={table} hasFiltersApplied={hasFiltersApplied} />

          {/* ── View modal ──────────────────────────────────────────────── */}
          <Modal
            isOpen={!!viewingComment}
            onClose={() => setViewingComment(null)}
            title={viewingComment?.authorName || "Comment"}
            description={viewingComment ? `Received ${formatCommentDate(viewingComment.createdAt)}` : undefined}
            icon={<MessageCircle size={20} />}
            maxWidth="lg"
          >
            {viewingComment && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                    <p className="text-foreground">{viewingComment.authorEmail || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">On</p>
                    <div className="flex items-center gap-2">
                      <ResourceTypeBadge type={viewingComment.resourceType} />
                      {viewingComment.resourceTitle && (
                        <span className="text-foreground truncate">{viewingComment.resourceTitle}</span>
                      )}
                    </div>
                  </div>
                  {viewingComment.rating != null && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Rating</p>
                      <span className="inline-flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className="w-3.5 h-3.5" fill={i < viewingComment.rating! ? "currentColor" : "none"} />
                        ))}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Comment</p>
                  <p className="text-foreground whitespace-pre-line leading-relaxed">{viewingComment.body}</p>
                </div>
              </div>
            )}
            {viewingComment && (
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                {viewingComment.status !== "APPROVED" && (
                  <Button
                    variant="outline"
                    radius="sm"
                    onClick={() => handleSetStatus(viewingComment, "APPROVED")}
                    className="font-semibold"
                  >
                    Approve
                  </Button>
                )}
                {viewingComment.status !== "REJECTED" && (
                  <Button
                    variant="outline"
                    radius="sm"
                    onClick={() => handleSetStatus(viewingComment, "REJECTED")}
                    className="font-semibold"
                  >
                    Reject
                  </Button>
                )}
              </div>
            )}
          </Modal>

          {/* ── Delete modal ────────────────────────────────────────────── */}
          <Modal
            isOpen={!!deletingComment}
            onClose={() => setDeletingComment(null)}
            title="Delete Comment?"
            description={
              <>
                Are you sure you want to delete the comment from{" "}
                <strong className="text-foreground">&ldquo;{deletingComment?.authorName || "Anonymous"}&rdquo;</strong>?
                This also deletes any replies to it. This action cannot be undone.
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
                  onClick={() => setDeletingComment(null)}
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
