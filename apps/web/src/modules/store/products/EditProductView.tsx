"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePageLoad } from "@/hooks/usePageLoad";
import { ProductForm, type ProductFormData } from "./components/ProductForm";
import { storeProducts } from "@/lib/api";

interface EditProductViewProps {
  productId: string;
}

export function EditProductView({ productId }: EditProductViewProps) {
  const t = useTranslations("store.products");
  const isLoaded = usePageLoad(500);
  const router = useRouter();

  const [productName, setProductName] = useState<string>("");
  const [initData,    setInitData]    = useState<Partial<ProductFormData> | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    storeProducts.get(productId)
      .then((p) => {
        if (!active) return;
        setProductName(p.name);
        setInitData({
          name:              p.name              ?? "",
          slug:              p.slug              ?? "",
          shortDescription:  p.shortDescription  ?? "",
          description:       p.description       ?? "",
          specification:     p.specification     ?? "",
          featuredImage:     p.featuredImage      ?? null,
          type:              (p.type             ?? "simple") as ProductFormData["type"],
          status:            (p.status           ?? "draft")  as ProductFormData["status"],
          publishedAt:       p.publishedAt        ?? "",
          price:             String(p.price       ?? ""),
          compareAtPrice:    String(p.compareAtPrice ?? ""),
          costPrice:         String(p.costPrice   ?? ""),
          taxClass:          p.taxClass           ?? "standard",
          sku:               p.sku               ?? "",
          stock:             String(p.stock       ?? ""),
          stockStatus:       (p.stockStatus       ?? "in_stock") as ProductFormData["stockStatus"],
          lowStockThreshold: String(p.lowStockThreshold ?? "5"),
          weight:            String(p.weight      ?? ""),
          trackInventory:    true,
          backorderEnabled:  false,
          downloadFiles:     [],
          downloadLimit:     "",
          downloadExpiry:    "",
          attributes:        [],
          variants:          (p.variants ?? []).map((v) => ({
            id:      v.id,
            sku:     v.sku,
            attrs:   v.attributes ?? {},
            price:   String(v.price),
            stock:   String(v.stock),
            enabled: true,
          })),
          billingPeriod:     "month",
          billingInterval:   "1",
          trialPeriod:       "",
          signupFee:         "",
          bundleItems:       [],
          giftCardAmounts:   ["25", "50", "100"],
          allowCustomAmount: false,
          giftCardExpiry:    "365",
          categoryIds:       p.categoryIds ?? [],
          tags:              p.tags ?? [],
          seoTitle:          p.seoTitle          ?? "",
          seoDescription:    p.seoDescription    ?? "",
          seoKeywords:       p.seoKeywords       ?? "",
        });
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load product");
      })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, [productId]);

  const handleSave = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      await storeProducts.update(productId, {
        name:             data.name,
        slug:             data.slug,
        shortDescription: data.shortDescription || undefined,
        description:      data.description      || undefined,
        specification:    data.specification    || undefined,
        seoTitle:         data.seoTitle         || undefined,
        seoDescription:   data.seoDescription   || undefined,
        seoKeywords:      data.seoKeywords       || undefined,
        featuredImage:    data.featuredImage     || undefined,
        type:             data.type,
        status:           data.status,
        publishedAt:      data.publishedAt       || undefined,
        price:            parseFloat(data.price)           || 0,
        compareAtPrice:   parseFloat(data.compareAtPrice)  || undefined,
        costPrice:        parseFloat(data.costPrice)       || undefined,
        taxClass:         data.taxClass          || undefined,
        sku:              data.sku,
        stock:            parseInt(data.stock)             || 0,
        stockStatus:      data.stockStatus,
        weight:           parseFloat(data.weight)          || undefined,
        categoryIds:      data.categoryIds,
        tags:             data.tags,
      });
      router.push("/store/products");
    } catch (err) {
      console.error("Save failed:", err);
      alert(err instanceof Error ? err.message : "Failed to save product");
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

  if (error || !initData) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 min-h-96">
        <p className="text-muted-foreground">{error ?? t("noProducts")}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </motion.div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      initialData={initData}
      productName={productName}
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
