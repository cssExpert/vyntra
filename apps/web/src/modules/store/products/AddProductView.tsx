"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ProductForm, type ProductFormData } from "./components/ProductForm";

export function AddProductView() {
  const t = useTranslations("store.products");
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      const newId = `p_new_${Date.now()}`;
      const added = JSON.parse(
        typeof window !== "undefined"
          ? localStorage.getItem("store_products_added") || "[]"
          : "[]",
      );
      added.unshift({
        id:                newId,
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
        createdAt:         new Date().toISOString(),
        updatedAt:         new Date().toISOString(),
      });
      localStorage.setItem("store_products_added", JSON.stringify(added));
      await new Promise((r) => setTimeout(r, 400));
      router.push("/store/products");
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
