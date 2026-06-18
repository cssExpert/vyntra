"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StoreCustomer } from "../store.types";
import { SAMPLE_CUSTOMERS } from "../store.data";
import { CUSTOMER_STATUS_BADGES } from "../store.constants";
import { formatStorePrice } from "../store.utils";

interface CustomerDetailsViewProps {
  customerId: string;
}

export function CustomerDetailsView({ customerId }: CustomerDetailsViewProps) {
  const t = useTranslations("store.customers");
  const router = useRouter();
  const [customer, setCustomer] = useState<StoreCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      setIsLoading(true);
      try {
        const found = SAMPLE_CUSTOMERS.find((c) => c.id === customerId);
        setCustomer(found || null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomer();
  }, [customerId]);

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

  if (!customer) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 min-h-96"
      >
        <p className="text-muted-foreground">{t("noCustomers")}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    );
  }

  const statusBadge = CUSTOMER_STATUS_BADGES[customer.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title={customer.name}
        description={customer.email}
        breadcrumbs={[
          { label: t("store"), href: "/store" },
          { label: t("title"), href: "/store/customers" },
          { label: customer.name },
        ]}
      >
        <div className="flex gap-2">
          <Button variant="outline" size="lg">
            <Mail size={16} />
            {t("email")}
          </Button>
          <Button variant="outline" size="lg">
            <MessageSquare size={16} />
            {t("message")}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("email")}</p>
              <p className="text-sm">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("phone")}</p>
              <p className="text-sm">{customer.phone || "—"}</p>
            </div>
            {customer.country && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Country</p>
                <p className="text-sm">{customer.country}</p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Stats */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("status")}</p>
              <p className="text-sm">{t(statusBadge.label)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("totalOrders")}</p>
              <p className="text-xl font-bold">{customer.totalOrders || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("lifetimeValue")}</p>
              <p className="text-xl font-bold">{formatStorePrice(customer.totalSpent || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-semibold mb-4">{t("details")}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t("joinedDate")}</p>
            <p>{new Date(customer.registeredAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("lastOrder")}</p>
            <p>{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "—"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
