"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditProductViewProps {
  productId: string;
}

export function EditProductView({ productId }: EditProductViewProps) {
  const t = useTranslations("store.products");
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // TODO: Fetch product details from API using productId
  // TODO: Initialize form with product data
  // TODO: Setup form validation with React Hook Form + Zod

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Update product via API
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Edit Product"
        description="Update product information"
        breadcrumbs={[
          { label: "Store", href: "/store" },
          { label: "Products", href: "/store/products" },
          { label: "Edit" },
        ]}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl space-y-4">
            <p className="text-muted-foreground">Product edit form</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4 rounded-xl">
            <p className="text-sm font-medium mb-4">Options</p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Visibility & Status</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
