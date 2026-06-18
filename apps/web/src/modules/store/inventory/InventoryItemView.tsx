"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { InventoryItem } from "../store.types";
import { SAMPLE_INVENTORY } from "../store.data";
import { STOCK_STATUS_BADGES } from "../store.constants";

interface InventoryItemViewProps {
  inventoryId: string;
}

export function InventoryItemView({ inventoryId }: InventoryItemViewProps) {
  const t = useTranslations("store.inventory");
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      setIsLoading(true);
      try {
        const found = SAMPLE_INVENTORY.find((i) => i.id === inventoryId);
        setInventory(found || null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, [inventoryId]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-96"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  if (!inventory) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 min-h-96"
      >
        <p className="text-muted-foreground">{t("noInventory")}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    );
  }

  const statusBadge = STOCK_STATUS_BADGES[inventory.stockStatus];

  return (
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
          <Button variant="outline" size="lg">
            <Plus size={16} />
            {t("addStock")}
          </Button>
          <Button variant="outline" size="lg">
            <TrendingUp size={16} />
            {t("trends")}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Inventory Info */}
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

        {/* Inventory Stats */}
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

      {/* Stock Info */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-semibold mb-4">{t("stockLevels")}</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t("minimumStock")}</p>
            <p className="text-lg font-semibold">{inventory.minStock || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("maximumStock")}</p>
            <p className="text-lg font-semibold">{inventory.maxStock || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("reorderPoint")}</p>
            <p className="text-lg font-semibold">{inventory.reorderPoint || "—"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
