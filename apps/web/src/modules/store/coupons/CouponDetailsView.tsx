"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Pencil, Copy, Archive } from "lucide-react";
import { useRouter } from "next/navigation";

interface CouponDetailsViewProps {
  couponId: string;
}

export function CouponDetailsView({ couponId }: CouponDetailsViewProps) {
  const t = useTranslations("store.coupons");
  const router = useRouter();
  const [isLoading] = useState(false);

  // TODO: Fetch coupon details from API using couponId

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Coupon Details"
        description="View coupon information and usage statistics"
        breadcrumbs={[
          { label: "Store", href: "/store" },
          { label: "Coupons", href: "/store/coupons" },
          { label: "Details" },
        ]}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/store/coupons/${couponId}/edit`)}
          >
            <Pencil size={16} />
            Edit
          </Button>
          <Button variant="outline" size="lg">
            <Copy size={16} />
            Duplicate
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Coupon Info */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <p className="text-muted-foreground">Coupon information</p>
          </div>
        </div>

        {/* Coupon Stats */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Code</p>
              <p className="font-mono">Loading...</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Discount</p>
              <p className="text-xl font-bold">Loading...</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Uses</p>
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="glass-card p-6 rounded-xl">
        <p className="text-muted-foreground">Coupon usage and performance</p>
      </div>
    </motion.div>
  );
}
