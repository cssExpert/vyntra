"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Pencil, Share2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StoreProduct } from "../store.types";
import { SAMPLE_PRODUCTS } from "../store.data";
import { PRODUCT_STATUS_BADGES, PRODUCT_TYPE_LABELS } from "../store.constants";
import { formatStorePrice } from "../store.utils";

interface ProductDetailsViewProps {
  productId: string;
}

export function ProductDetailsView({ productId }: ProductDetailsViewProps) {
  const t = useTranslations("store.products");
  const router = useRouter();
  const [product, setProduct] = useState<StoreProduct | null>(null);
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

  const statusBadge = PRODUCT_STATUS_BADGES[product.status];
  const typeLabel = PRODUCT_TYPE_LABELS[product.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title={product.name}
        description={product.shortDescription}
        breadcrumbs={[
          { label: t("store"), href: "/store" },
          { label: t("title"), href: "/store/products" },
          { label: product.name },
        ]}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/store/products/${productId}/edit`)}
          >
            <Pencil size={16} />
            {t("edit")}
          </Button>
          <Button variant="outline" size="lg">
            <Share2 size={16} />
            {t("share")}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Product Image */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-xl aspect-square bg-muted flex items-center justify-center">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-lg" />
            ) : (
              <span className="text-muted-foreground">No image</span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("sku")}</p>
              <p className="font-mono text-sm">{product.sku}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("price")}</p>
              <p className="text-xl font-bold">{formatStorePrice(product.price)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("type")}</p>
              <p className="text-sm capitalize">{t(typeLabel)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t("status")}</p>
              <span className="text-sm">{t(statusBadge.label)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="glass-card p-6 rounded-xl space-y-6">
        <div>
          <h3 className="font-semibold mb-2">{t("description")}</h3>
          <p className="text-sm text-muted-foreground">{product.description || product.shortDescription}</p>
        </div>
        {product.tags && product.tags.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">{t("tags")}</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 text-xs bg-muted rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
