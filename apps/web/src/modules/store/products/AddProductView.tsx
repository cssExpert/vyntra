"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ProductForm, type ProductFormData } from "./components/ProductForm";
import { storeProducts } from "@/lib/api";

export function AddProductView() {
  const t = useTranslations("store.products");
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      await storeProducts.create({
        name:             data.name,
        slug:             data.slug,
        shortDescription: data.shortDescription || undefined,
        description:      data.description      || undefined,
        seoTitle:         data.seoTitle         || undefined,
        seoDescription:   data.seoDescription   || undefined,
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
    } catch (err: unknown) {
      console.error("Create failed:", err);
      alert(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProductForm
      mode="add"
      breadcrumbs={[
        { label: t("store"), href: "/store" },
        { label: t("title"), href: "/store/products" },
        { label: t("add") },
      ]}
      onSave={handleSave}
      onCancel={() => router.push("/store/products")}
      isSaving={isSaving}
    />
  );
}
