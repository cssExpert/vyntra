"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Save, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StoreProduct } from "../store.types";
import { SAMPLE_PRODUCTS } from "../store.data";

interface EditProductViewProps {
  productId: string;
}

export function EditProductView({ productId }: EditProductViewProps) {
  const t = useTranslations("store.products");
  const router = useRouter();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const found = SAMPLE_PRODUCTS.find((p) => p.id === productId);
        setProduct(found || null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

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

  if (!product) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 min-h-96"
      >
        <p className="text-muted-foreground">{t("noProducts")}</p>
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
        title={`${t("edit")} - ${product.name}`}
        description={t("updateInformation")}
        breadcrumbs={[
          { label: t("store"), href: "/store" },
          { label: t("title"), href: "/store/products" },
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
            <p className="text-sm font-medium mb-4">{t("visibility")}</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>{t("statusLabel")}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
