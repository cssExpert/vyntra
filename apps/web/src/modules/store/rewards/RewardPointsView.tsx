"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { Trophy, Eye, Pencil } from "lucide-react";
import { SAMPLE_REWARDS } from "../store.data";
import type { CustomerReward } from "../store.types";
import { Button } from "@/components/ui/button";
import { REWARD_TIER_BADGES, REWARD_TIER_THRESHOLDS } from "../store.constants";
import { pageWindow } from "../store.utils";

export function RewardPointsView() {
     
  const t = useTranslations("store.rewards");
  const isLoaded = usePageLoad(600);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize,  setPageSize]  = useState(10);
  const totalPoints = SAMPLE_REWARDS.reduce((s, r) => s + r.points, 0);

  const filteredCount = SAMPLE_REWARDS.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = Math.ceil(filteredCount / pageSize) || 1;
  const paginatedRows = SAMPLE_REWARDS.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!isLoaded ? (
        <motion.div key="sk" exit={{ opacity: 0 }} className="space-y-4">
          <div className="h-9 w-48 rounded-sm bg-muted animate-pulse" />
          <div className="h-64 w-full rounded-xl bg-muted animate-pulse" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <PageHeader
            title={t("title")}
            description={t("description")}
            breadcrumbs={[{ label: t("store"), href: "/store" }, { label: t("title") }]}
          />

          {/* Tier stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["bronze","silver","gold","platinum"] as const).map((tier) => {
              const count = SAMPLE_REWARDS.filter((r) => r.tier === tier).length;
              const badge = REWARD_TIER_BADGES[tier];
              return (
                <div key={tier} className="glass-card p-4">
                  <Trophy size={16} className={`mb-2 ${tier === "platinum" ? "text-purple-400" : tier === "gold" ? "text-warning" : tier === "silver" ? "text-info" : "text-muted-foreground"}`} />
                  <p className="text-xl font-extrabold text-foreground">{count}</p>
                  <StatusBadge variant={badge.variant} label={badge.label} size="sm" className="mt-1" />
                </div>
              );
            })}
          </div>

          {/* Tier thresholds legend */}
          <div className="glass-card p-4">
            <p className="text-xs font-semibold text-foreground mb-3">Tier Thresholds</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(TIER_THRESHOLDS).map(([tier, pts]) => (
                <div key={tier} className="flex items-center gap-2">
                  <Trophy size={12} className="text-muted-foreground shrink-0" />
                  <span className="font-semibold capitalize text-foreground">{tier}</span>
                  <span className="text-muted-foreground">{pts}+ pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-clip">
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 380px)" }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[13px] font-semibold text-muted-foreground">
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">Customer</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">Points</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">Tier</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">To Next Tier</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">Last Earned</th>
                  <th className="sticky top-0 bg-muted border-b border-border py-4 px-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[14px]">
                {paginatedRows.map((r) => {
                  const badge = TIER_BADGE[r.tier];
                  return (
                    <tr key={r.customerId} className="group hover:bg-muted/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-white">
                            {r.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{r.customerName}</p>
                            <p className="text-[11px] text-muted-foreground">{r.customerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-warning tabular-nums">{r.points.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge variant={badge.variant} label={badge.label} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground tabular-nums">
                        {r.pointsToNextTier > 0 ? `${r.pointsToNextTier} pts` : "Max tier"}
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground">{r.lastEarnedAt}</td>
                      <td className="py-4 px-4 text-right">
                        <TableActionMenu
                          items={[
                            { label: "View History", icon: <Eye size={14} />,    onClick: () => {} },
                            { label: "Adjust",       icon: <Pencil size={14} />, onClick: () => {} },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Show</span>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }} className="px-2 py-1.5 bg-background border border-border rounded-sm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer">
                  {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span>entries</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Showing {fromEntry} to {toEntry} of {filteredCount} entries</span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" radius="sm" className="h-8 px-3 text-muted-foreground" onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0}>← Previous</Button>
                  {pageWindow(pageIndex, pageCount).map((p, idx) =>
                    p === "…" ? <span key={`e-${idx}`} className="w-8 text-center text-muted-foreground">…</span> : (
                      <button key={p} onClick={() => setPageIndex(p as number)} className={`w-8 h-8 text-sm font-semibold rounded-sm transition-all cursor-pointer ${pageIndex === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{(p as number) + 1}</button>
                    )
                  )}
                  <Button variant="outline" radius="sm" className="h-8 px-3 text-muted-foreground" onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))} disabled={pageIndex >= pageCount - 1}>Next →</Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
