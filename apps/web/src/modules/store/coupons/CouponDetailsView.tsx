"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Pencil, Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StoreCoupon } from "../store.types";
import { SAMPLE_COUPONS } from "../store.data";
import { COUPON_TYPE_LABELS } from "../store.constants";
import { formatCouponDiscount } from "../store.utils";

interface CouponDetailsViewProps {
  couponId: string;
}

export function CouponDetailsView({ couponId }: CouponDetailsViewProps) {
  const t = useTranslations("store.coupons");
  const router = useRouter();
  const [coupon, setCoupon] = useState<StoreCoupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoupon = async () => {
      setIsLoading(true);
      try {
        const found = SAMPLE_COUPONS.find((c) => c.id === couponId);
        setCoupon(found || null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupon();
  }, [couponId]);

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

  if (!coupon) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 min-h-96"
      >
        <p className="text-muted-foreground">{t("noCoupons")}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    );
  }

  const typeLabel = COUPON_TYPE_LABELS[coupon.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title={coupon.code}
        description={t(typeLabel)}
        breadcrumbs={[
          { label: t("store"), href: "/store" },
          { label: t("title"), href: "/store/coupons" },
          { label: coupon.code },
        ]}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/store/coupons/${couponId}/edit`)}
          >
            <Pencil size={16} />
            {t("edit")}
          </Button>
          <Button variant="outline" size="lg">
            <Copy size={16} />
            {t("duplicate")}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Coupon Info */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("validFrom")}</p>
              <p className="text-sm">
                {coupon.startsAt ? new Date(coupon.startsAt).toLocaleDateString() : "—"} {coupon.expiresAt && " - " + new Date(coupon.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("minPurchase")}</p>
              <p className="text-sm">{coupon.minimumSpend ? `$${coupon.minimumSpend}` : t("noMinimum")}</p>
            </div>
            {coupon.freeShipping && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Benefit</p>
                <p className="text-sm">Free Shipping</p>
              </div>
            )}
          </div>
        </div>

        {/* Coupon Stats */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("code")}</p>
              <p className="font-mono text-sm">{coupon.code}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("discount")}</p>
              <p className="text-xl font-bold">{formatCouponDiscount(coupon)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("usageLimit")}</p>
              <p className="text-sm">
                {coupon.usageCount || 0} / {coupon.usageLimit || t("unlimited")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="font-semibold mb-4">{t("performance")}</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t("totalRedemptions")}</p>
            <p className="text-lg font-semibold">{coupon.usageCount || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("status")}</p>
            <p className="text-sm capitalize">{coupon.status === "active" ? t("active") : coupon.status === "expired" ? "Expired" : "Disabled"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("createdDate")}</p>
            <p className="text-sm">{new Date(coupon.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
