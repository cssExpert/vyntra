"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Pencil, Share2, Archive } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductDetailsViewProps {
  productId: string;
}

export function ProductDetailsView({ productId }: ProductDetailsViewProps) {
  const t = useTranslations("store.products");
  const router = useRouter();
  const [isLoading] = useState(false);

  // TODO: Fetch product details from API using productId

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Product Details"
        description="View and manage product information"
        breadcrumbs={[
          { label: "Store", href: "/store" },
          { label: "Products", href: "/store/products" },
          { label: "Details" },
        ]}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/store/products/${productId}/edit`)}
          >
            <Pencil size={16} />
            Edit
          </Button>
          <Button variant="outline" size="lg">
            <Share2 size={16} />
            Share
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        {/* Product Image */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-xl aspect-square bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Product Image</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">SKU</p>
              <p className="font-mono">Loading...</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Price</p>
              <p className="text-xl font-bold">Loading...</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Stock</p>
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Details, Variants, Reviews */}
      <div className="glass-card p-6 rounded-xl">
        <p className="text-muted-foreground">Product details content</p>
      </div>
    </motion.div>
  );
}
