"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Edit2, Plus, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface InventoryItemViewProps {
  inventoryId: string;
}

export function InventoryItemView({ inventoryId }: InventoryItemViewProps) {
  const t = useTranslations("store.inventory");
  const router = useRouter();
  const [isLoading] = useState(false);

  // TODO: Fetch inventory details from API using inventoryId

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Inventory Item"
        description="View and manage inventory stock levels"
        breadcrumbs={[
          { label: "Store", href: "/store" },
          { label: "Inventory", href: "/store/inventory" },
          { label: "Details" },
        ]}
      >
        <div className="flex gap-2">
          <Button variant="outline" size="lg">
            <Plus size={16} />
            Add Stock
          </Button>
          <Button variant="outline" size="lg">
            <TrendingUp size={16} />
            View Trends
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Inventory Info */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <p className="text-muted-foreground">Inventory item details</p>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Stock</p>
              <p className="text-xl font-bold">Loading...</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p>Loading...</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
              <p className="text-sm">Loading...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock History & Transactions */}
      <div className="glass-card p-6 rounded-xl">
        <p className="text-muted-foreground">Stock history and transactions</p>
      </div>
    </motion.div>
  );
}
