"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Save, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StoreCoupon } from "../store.types";
import { SAMPLE_COUPONS } from "../store.data";

interface EditCouponViewProps {
  couponId: string;
}

export function EditCouponView({ couponId }: EditCouponViewProps) {
  const t = useTranslations("store.coupons");
  const router = useRouter();
  const [coupon, setCoupon] = useState<StoreCoupon | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsSaving(false);
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title={`${t("edit")} - ${coupon.code}`}
        description={t("updateRules")}
        breadcrumbs={[
          { label: t("store"), href: "/store" },
          { label: t("title"), href: "/store/coupons" },
          { label: t("edit") },
        ]}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
          >
            <X size={16} />
            {t("cancel")}
          </Button>
          <Button
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? "Saving..." : t("save")}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl space-y-4">
            <p className="text-sm text-muted-foreground">{t("formInstructions")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl">
            <p className="text-sm font-medium mb-4">{t("status")}</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="capitalize">{coupon.status}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
