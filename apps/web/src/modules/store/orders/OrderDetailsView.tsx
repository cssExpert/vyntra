"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Printer, Download, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderDetailsViewProps {
  orderId: string;
}

export function OrderDetailsView({ orderId }: OrderDetailsViewProps) {
  const t = useTranslations("store.orders");
  const router = useRouter();
  const [isLoading] = useState(false);

  // TODO: Fetch order details from API using orderId

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Order Details"
        description="View order information and manage fulfillment"
        breadcrumbs={[
          { label: "Store", href: "/store" },
          { label: "Orders", href: "/store/orders" },
          { label: "Details" },
        ]}
      >
        <div className="flex gap-2">
          <Button variant="outline" size="lg">
            <Printer size={16} />
            Print
          </Button>
          <Button variant="outline" size="lg">
            <Download size={16} />
            Invoice
          </Button>
          <Button size="lg">
            <Send size={16} />
            Send Update
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <p className="text-muted-foreground">Order items</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Order ID</p>
              <p className="font-mono">Loading...</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p>Loading...</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p className="text-xl font-bold">Loading...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Timeline, Shipping, Payments */}
      <div className="glass-card p-6 rounded-xl">
        <p className="text-muted-foreground">Order timeline and details</p>
      </div>
    </motion.div>
  );
}
