"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Archive } from "lucide-react";
import { useRouter } from "next/navigation";

interface CustomerDetailsViewProps {
  customerId: string;
}

export function CustomerDetailsView({ customerId }: CustomerDetailsViewProps) {
  const t = useTranslations("store.customers");
  const router = useRouter();
  const [isLoading] = useState(false);

  // TODO: Fetch customer details from API using customerId

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Customer Profile"
        description="View customer information and order history"
        breadcrumbs={[
          { label: "Store", href: "/store" },
          { label: "Customers", href: "/store/customers" },
          { label: "Profile" },
        ]}
      >
        <div className="flex gap-2">
          <Button variant="outline" size="lg">
            <Mail size={16} />
            Email
          </Button>
          <Button variant="outline" size="lg">
            <MessageSquare size={16} />
            Message
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <p className="text-muted-foreground">Customer information</p>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p>Loading...</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
              <p className="text-xl font-bold">Loading...</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Lifetime Value</p>
              <p className="text-xl font-bold">Loading...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Orders, Addresses, Rewards */}
      <div className="glass-card p-6 rounded-xl">
        <p className="text-muted-foreground">Customer orders and history</p>
      </div>
    </motion.div>
  );
}
