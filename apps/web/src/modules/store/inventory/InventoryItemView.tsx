"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { InventoryItem } from "../store.types";
import { STOCK_STATUS_BADGES } from "../store.constants";
import { toInventoryItem } from "../store.utils";
import { storeInventory } from "@/lib/api";

interface InventoryItemViewProps {
  inventoryId: string;
}

const ADJUST_REASONS = [
  "Manual adjustment",
  "Purchase / restock",
  "Damaged / write-off",
  "Return from customer",
  "Inventory count correction",
  "Other",
];

function AddStockModal({
  productId,
  currentStock,
  onClose,
  onSaved,
}: {
  productId: string;
  currentStock: number;
  onClose: () => void;
  onSaved: (newStock: number) => void;
}) {
  const [qty, setQty]       = useState<string>("1");
  const [reason, setReason] = useState(ADJUST_REASONS[0]);
  const [notes, setNotes]   = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(qty);
    if (!quantity || quantity === 0) { setError("Enter a non-zero quantity."); return; }
    if (!reason) { setError("Select a reason."); return; }
    setSaving(true);
    setError("");
    try {
      const updated = await storeInventory.adjust(productId, quantity, reason, notes || undefined);
      onSaved(updated.stock);
    } catch {
      setError("Failed to adjust stock. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Adjust Stock</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Current stock: <strong className="text-foreground">{currentStock}</strong>. Use positive numbers to add stock, negative to subtract.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Quantity adjustment</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="e.g. 50 or -5"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary outline-none cursor-pointer"
            >
              {ADJUST_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Additional notes…"
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary outline-none resize-none"
            />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" radius="sm" className="flex-1" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" radius="sm" className="flex-1" disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function InventoryItemView({ inventoryId }: InventoryItemViewProps) {
  const t = useTranslations("store.inventory");
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddStock, setShowAddStock] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const found = await storeInventory.getByProduct(inventoryId);
        setInventory(toInventoryItem(found));
      } catch {
        setInventory(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, [inventoryId]);

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  if (!inventory) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 min-h-96">
        <p className="text-muted-foreground">{t("noInventory")}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    );
  }

  const statusBadge = STOCK_STATUS_BADGES[inventory.stockStatus];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="flex flex-col gap-6"
      >
        <PageHeader
          title={inventory.productName}
          description={`SKU: ${inventory.sku}`}
          breadcrumbs={[
            { label: t("store"), href: "/store" },
            { label: t("title"), href: "/store/inventory" },
            { label: inventory.productName },
          ]}
        >
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={() => setShowAddStock(true)}>
              <Plus size={16} />
              {t("addStock")}
            </Button>
            <Button variant="outline" size="lg" disabled title="Trends coming soon">
              <TrendingUp size={16} />
              {t("trends")}
            </Button>
          </div>
        </PageHeader>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="glass-card p-6 rounded-xl space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("warehouse")}</p>
                <p className="text-sm">{inventory.warehouseLocation || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">SKU</p>
                <p className="text-sm font-mono">{inventory.sku}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-4 rounded-xl space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("currentStock")}</p>
                <p className="text-xl font-bold">{inventory.stock}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("status")}</p>
                <p className="text-sm">{t(statusBadge.label)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("lastUpdated")}</p>
                <p className="text-xs">{new Date(inventory.lastUpdated).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h3 className="font-semibold mb-4">{t("stockLevels")}</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t("reorderPoint")}</p>
              <p className="text-lg font-semibold">{inventory.lowStockThreshold || "—"}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {showAddStock && (
        <AddStockModal
          productId={inventoryId}
          currentStock={inventory.stock}
          onClose={() => setShowAddStock(false)}
          onSaved={(newStock: number) => {
            setInventory((prev) => prev ? { ...prev, stock: newStock } : prev);
            setShowAddStock(false);
          }}
        />
      )}
    </>
  );
}
