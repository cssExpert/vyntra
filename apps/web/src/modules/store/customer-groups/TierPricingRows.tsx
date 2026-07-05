"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save } from "lucide-react";
import { storeCustomerGroups, type ApiCustomerGroup, type ApiTierPriceRow } from "@/lib/api";

const inp = "w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";
const sel = inp + " cursor-pointer";

interface Row {
  key: string;
  customerGroupId: string | null;
  minQty: number;
  price: number;
}

function toRow(r: ApiTierPriceRow): Row {
  return { key: r.id, customerGroupId: r.customerGroupId, minQty: r.minQty, price: r.price };
}

interface TierPricingRowsProps {
  productId?: string;
}

export function TierPricingRows({ productId }: TierPricingRowsProps) {
  const [groups, setGroups] = useState<ApiCustomerGroup[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const [groupsRes, tierRes] = await Promise.all([
        storeCustomerGroups.list(),
        storeCustomerGroups.tierPrices.list(productId),
      ]);
      setGroups(groupsRes.data);
      setRows(tierRes.map(toRow));
    } catch {
      // keep empty
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  if (!productId) {
    return (
      <p className="text-[13px] text-muted-foreground">
        Save the product first, then come back here to add quantity-based tier pricing per customer group.
      </p>
    );
  }

  const addRow = () => setRows((prev) => [...prev, { key: `new-${Date.now()}`, customerGroupId: null, minQty: 1, price: 0 }]);
  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));
  const updateRow = (key: string, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const hasDuplicate = rows.some(
    (r, i) => rows.findIndex((o) => o.customerGroupId === r.customerGroupId && o.minQty === r.minQty) !== i,
  );

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await storeCustomerGroups.tierPrices.update(
        productId,
        rows.map((r) => ({ customerGroupId: r.customerGroupId, minQty: r.minQty, price: r.price })),
      );
      setRows(updated.map(toRow));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tier prices");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="h-24 rounded-md bg-muted animate-pulse" />
      ) : (
        <>
          {rows.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_100px_100px_32px] gap-2 text-[11px] text-muted-foreground px-1">
                <span>Customer Group</span>
                <span>Min Qty</span>
                <span>Price</span>
                <span />
              </div>
              {rows.map((row) => (
                <div key={row.key} className="grid grid-cols-[1fr_100px_100px_32px] gap-2 items-center">
                  <select
                    value={row.customerGroupId ?? ""}
                    onChange={(e) => updateRow(row.key, { customerGroupId: e.target.value || null })}
                    className={sel}
                  >
                    <option value="">All Groups</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <Input type="number" min={1} value={row.minQty} onChange={(e) => updateRow(row.key, { minQty: Number(e.target.value) || 1 })} className={inp} />
                  <Input type="number" min={0} value={row.price} onChange={(e) => updateRow(row.key, { price: Number(e.target.value) || 0 })} className={inp} />
                  <button type="button" onClick={() => removeRow(row.key)} className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {hasDuplicate && <p className="text-[12px] text-destructive">Duplicate min qty for the same customer group.</p>}
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          <div className="flex items-center justify-between">
            <Button variant="outline" type="button" onClick={addRow} size="sm">
              <Plus size={14} /> Add Row
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving || hasDuplicate} size="sm">
              <Save size={14} /> {isSaving ? "Saving…" : "Save Tier Prices"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
