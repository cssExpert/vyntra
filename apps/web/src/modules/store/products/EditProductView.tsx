"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { StoreProduct } from "../store.types";
import { SAMPLE_PRODUCTS } from "../store.data";
import { usePageLoad } from "@/hooks/usePageLoad";
import { ProductForm, type ProductFormData } from "./components/ProductForm";

interface EditProductViewProps {
  productId: string;
}

export function EditProductView({ productId }: EditProductViewProps) {
  const t = useTranslations("store.products");
  const isLoaded = usePageLoad(500);
  const router = useRouter();

  const [product,   setProduct]   = useState<StoreProduct | null>(null);
  const [initData,  setInitData]  = useState<Partial<ProductFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);

  useEffect(() => {
    setIsLoading(true);
    try {
      // Merge SAMPLE_PRODUCTS with any localStorage edits
      const saved = JSON.parse(
        typeof window !== "undefined"
          ? localStorage.getItem("store_products_edited") || "{}"
          : "{}",
      );
      const base = SAMPLE_PRODUCTS.find((p) => p.id === productId);
      if (!base) { setIsLoading(false); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const merged: Record<string, any> = { ...base, ...saved[productId] };
      setProduct(base);

      setInitData({
        name:               merged.name               ?? "",
        slug:               merged.slug               ?? "",
        shortDescription:   merged.shortDescription   ?? "",
        description:        merged.description        ?? "",
        specification:      merged.specification      ?? "",
        featuredImage:      merged.featuredImage       ?? null,
        type:               merged.type               ?? "simple",
        status:             merged.status             ?? "draft",
        publishedAt:        merged.publishedAt        ?? "",
        price:              String(merged.price       ?? ""),
        compareAtPrice:     String(merged.compareAtPrice ?? ""),
        costPrice:          String(merged.costPrice   ?? ""),
        taxClass:           merged.taxClass           ?? "standard",
        sku:                merged.sku                ?? "",
        stock:              String(merged.stock       ?? ""),
        stockStatus:        merged.stockStatus        ?? "in_stock",
        lowStockThreshold:  String(merged.lowStockThreshold ?? "5"),
        weight:             String(merged.weight      ?? ""),
        trackInventory:     merged.trackInventory     !== false,
        backorderEnabled:   merged.backorderEnabled   === true,
        downloadFiles:      merged.downloadFiles      ?? [],
        downloadLimit:      String(merged.downloadLimit   ?? ""),
        downloadExpiry:     String(merged.downloadExpiry  ?? ""),
        attributes:         merged.attributes         ?? [],
        variants:           merged.variants           ?? [],
        billingPeriod:      merged.billingPeriod      ?? "month",
        billingInterval:    String(merged.billingInterval ?? "1"),
        trialPeriod:        String(merged.trialPeriod    ?? ""),
        signupFee:          String(merged.signupFee      ?? ""),
        bundleItems:        merged.bundleItems        ?? [],
        giftCardAmounts:    merged.giftCardAmounts    ?? ["25", "50", "100"],
        allowCustomAmount:  merged.allowCustomAmount  ?? false,
        giftCardExpiry:     String(merged.giftCardExpiry ?? "365"),
        categoryIds:        merged.categoryIds        ?? [],
        tags:               merged.tags               ?? [],
        seoTitle:           merged.seoTitle           ?? "",
        seoDescription:     merged.seoDescription     ?? "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  const handleSave = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      const saved = JSON.parse(localStorage.getItem("store_products_edited") || "{}");
      saved[productId] = {
        id:                productId,
        name:              data.name,
        slug:              data.slug,
        shortDescription:  data.shortDescription,
        description:       data.description,
        specification:     data.specification,
        featuredImage:     data.featuredImage,
        type:              data.type,
        status:            data.status,
        publishedAt:       data.publishedAt,
        price:             parseFloat(data.price)           || 0,
        compareAtPrice:    parseFloat(data.compareAtPrice)  || 0,
        costPrice:         parseFloat(data.costPrice)       || 0,
        taxClass:          data.taxClass,
        sku:               data.sku,
        stock:             parseInt(data.stock)             || 0,
        stockStatus:       data.stockStatus,
        lowStockThreshold: parseInt(data.lowStockThreshold) || 5,
        weight:            parseFloat(data.weight)          || 0,
        trackInventory:    data.trackInventory,
        backorderEnabled:  data.backorderEnabled,
        downloadFiles:     data.downloadFiles,
        downloadLimit:     data.downloadLimit,
        downloadExpiry:    data.downloadExpiry,
        attributes:        data.attributes,
        variants:          data.variants,
        billingPeriod:     data.billingPeriod,
        billingInterval:   data.billingInterval,
        trialPeriod:       data.trialPeriod,
        signupFee:         data.signupFee,
        bundleItems:       data.bundleItems,
        giftCardAmounts:   data.giftCardAmounts,
        allowCustomAmount: data.allowCustomAmount,
        giftCardExpiry:    data.giftCardExpiry,
        categoryIds:       data.categoryIds,
        tags:              data.tags,
        seoTitle:          data.seoTitle,
        seoDescription:    data.seoDescription,
      };
      localStorage.setItem("store_products_edited", JSON.stringify(saved));
      await new Promise((r) => setTimeout(r, 400));
      router.push("/store/products");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-64 rounded-sm bg-muted animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {[100, 120, 180, 160, 140].map((h, i) => (
              <div key={i} style={{ height: h }} className="w-full rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {[120, 90, 180, 150].map((h, i) => (
              <div key={i} style={{ height: h }} className="w-full rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 min-h-96">
        <p className="text-muted-foreground">{t("noProducts")}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      initialData={initData ?? {}}
      productName={product.name}
      breadcrumbs={[
        { label: t("store"), href: "/store" },
        { label: t("title"), href: "/store/products" },
        { label: t("edit") },
      ]}
      onSave={handleSave}
      onCancel={() => router.push("/store/products")}
      isSaving={isSaving}
    />
  );
}
