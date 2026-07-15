"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { usePageLoad } from "@/hooks/usePageLoad";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableActionMenu } from "@/components/common/TableActionMenu";
import { Plus, Wallet, Pencil, Eye, X, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import type { CustomerCredit } from "../store.types";
import { Button } from "@/components/ui/button";
import { pageWindow, toCustomerCredit } from "../store.utils";
import { storeCustomers } from "@/lib/api";

// ─── Add Credit Modal ─────────────────────────────────────────────────────────

function AddCreditModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount]         = useState("");
  const [reason, setReason]         = useState("");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!customerId.trim()) { setError("Enter a Customer ID."); return; }
    if (!amt || amt <= 0)   { setError("Enter a valid positive amount."); return; }
    if (!reason.trim())     { setError("Enter a reason."); return; }
    setSaving(true);
    setError("");
    try {
      await storeCustomers.addCredit(customerId.trim(), amt, reason.trim());
      onSaved();
    } catch {
      setError("Failed to add credit. Check the Customer ID and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Add Store Credit</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Customer ID</label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="cust_…"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Amount ($)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 25.00"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Loyalty reward, refund compensation…"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
              required
            />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" radius="sm" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" radius="sm" className="flex-1" disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Add Credit"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Adjust Credit Modal ──────────────────────────────────────────────────────

function AdjustCreditModal({
  credit,
  onClose,
  onSaved,
}: {
  credit: CustomerCredit;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [mode, setMode]     = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setError("Enter a valid positive amount."); return; }
    if (!reason.trim())   { setError("Enter a reason."); return; }
    setSaving(true);
    setError("");
    try {
      if (mode === "add") {
        await storeCustomers.addCredit(credit.customerId, amt, reason.trim());
      } else {
        await storeCustomers.deductCredit(credit.customerId, amt, reason.trim());
      }
      onSaved();
    } catch {
      setError("Failed to adjust credit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Adjust Credit</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{credit.customerName} — Current: <strong>${credit.balance.toFixed(2)}</strong></p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(["add", "deduct"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex items-center justify-center gap-1.5 rounded-sm py-2 text-sm font-semibold transition-all cursor-pointer border ${
                mode === m
                  ? m === "add" ? "bg-success/10 border-success/30 text-success" : "bg-error/10 border-error/30 text-error"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {m === "add" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {m === "add" ? "Add" : "Deduct"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Amount ($)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10.00"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Manual correction, order refund…"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
              required
            />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" radius="sm" className="flex-1" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" radius="sm" className="flex-1" disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : mode === "add" ? "Add Credit" : "Deduct Credit"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function StoreCreditsView() {
  const t = useTranslations("store.credits");
  const isLoaded = usePageLoad(600);
  const [credits, setCredits] = useState<CustomerCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adjustCredit, setAdjustCredit] = useState<CustomerCredit | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await storeCustomers.list({ take: 500 });
      setCredits(res.data.map(toCustomerCredit).filter((c) => c.balance > 0));
    } catch {
      // keep empty
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalLiability = credits.reduce((s, c) => s + c.balance, 0);

  const filteredCount = credits.length;
  const fromEntry = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const toEntry = Math.min((pageIndex + 1) * pageSize, filteredCount);
  const pageCount = Math.ceil(filteredCount / pageSize) || 1;
  const paginatedRows = credits.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {!isLoaded || isLoading ? (
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
              breadcrumbs={[
                { label: t("store"), href: "/store" },
                { label: t("title") },
              ]}
            >
              <Button size="lg" radius="sm" className="px-4" onClick={() => setShowAddModal(true)}>
                <Plus size={16} className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-4 w-4" />
                {t("addCredit")}
              </Button>
            </PageHeader>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="glass-card p-4 flex items-center gap-3">
                <Wallet size={18} className="text-info" />
                <div>
                  <p className="text-xl font-extrabold text-foreground">${totalLiability.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total Liability</p>
                </div>
              </div>
              <div className="glass-card p-4 flex items-center gap-3">
                <Wallet size={18} className="text-success" />
                <div>
                  <p className="text-xl font-extrabold text-foreground">{credits.length}</p>
                  <p className="text-xs text-muted-foreground">Customers with Credit</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-clip">
              <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "calc(100vh - 260px)" }}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[13px] font-semibold text-muted-foreground">
                      <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">{t("customer")}</th>
                      <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">{t("email")}</th>
                      <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">{t("balance")}</th>
                      <th className="sticky top-0 bg-muted border-b border-border py-4 px-4">{t("lastTransaction")}</th>
                      <th className="sticky top-0 bg-muted border-b border-border py-4 px-4 text-right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[14px]">
                    {paginatedRows.map((c) => (
                      <tr key={c.customerId} className="group hover:bg-muted/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-white">
                              {c.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <span className="font-semibold text-foreground">{c.customerName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground text-xs">{c.customerEmail}</td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-info tabular-nums">${c.balance.toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-4 text-xs text-muted-foreground">{c.lastTransactionAt ?? "—"}</td>
                        <td className="py-4 px-4 text-right">
                          <TableActionMenu
                            items={[
                              {
                                label: "View History",
                                icon: <Eye size={14} />,
                                onClick: () => {},
                              },
                              {
                                label: "Adjust",
                                icon: <Pencil size={14} />,
                                onClick: () => setAdjustCredit(c),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-4 flex-wrap text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }}
                    className="px-2 py-1.5 bg-background border border-border rounded-sm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
                  >
                    {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span>entries</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">Showing {fromEntry} to {toEntry} of {filteredCount} entries</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" radius="sm" className="h-8 px-3 text-muted-foreground" onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0}>← Previous</Button>
                    {pageWindow(pageIndex, pageCount).map((p, idx) =>
                      p === "…" ? (
                        <span key={`e-${idx}`} className="w-8 text-center text-muted-foreground">…</span>
                      ) : (
                        <button key={p} onClick={() => setPageIndex(p as number)} className={`w-8 h-8 text-sm font-semibold rounded-sm transition-all cursor-pointer ${pageIndex === p ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                          {(p as number) + 1}
                        </button>
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

      {showAddModal && (
        <AddCreditModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); load(); }}
        />
      )}

      {adjustCredit && (
        <AdjustCreditModal
          credit={adjustCredit}
          onClose={() => setAdjustCredit(null)}
          onSaved={() => { setAdjustCredit(null); load(); }}
        />
      )}
    </>
  );
}
