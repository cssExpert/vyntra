"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SAMPLE_ATTRIBUTES } from "../store.data";
import type { StoreAttribute } from "../store.types";
import { AttributeForm, type AttributeFormData } from "./AttributeForm";

interface EditAttributeViewProps {
  attributeId: string;
}

function getAttributeById(id: string): StoreAttribute | null {
  if (typeof window === "undefined") {
    return SAMPLE_ATTRIBUTES.find((a) => a.id === id) ?? null;
  }
  const edited = JSON.parse(localStorage.getItem("store_attributes_edited") || "{}");
  const added  = JSON.parse(localStorage.getItem("store_attributes_added")  || "[]");
  const fromAdded = added.find((a: StoreAttribute) => a.id === id);
  if (fromAdded) return edited[id] ?? fromAdded;
  const base = SAMPLE_ATTRIBUTES.find((a) => a.id === id);
  return base ? (edited[id] ?? base) : null;
}

export function EditAttributeView({ attributeId }: EditAttributeViewProps) {
  const router     = useRouter();
  const [attr,     setAttr]     = useState<StoreAttribute | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAttr(getAttributeById(attributeId));
  }, [attributeId]);

  const handleSave = async (data: AttributeFormData) => {
    setIsSaving(true);
    try {
      const edited = JSON.parse(localStorage.getItem("store_attributes_edited") || "{}");
      edited[attributeId] = {
        id:              attributeId,
        name:            data.name,
        attributeType:   data.attributeType,
        fieldType:       data.fieldType,
        usedInVariation: data.usedInVariation,
        options:         data.options,
        createdAt:       attr?.createdAt ?? new Date().toISOString().slice(0, 10),
        updatedAt:       new Date().toISOString().slice(0, 10),
      };
      localStorage.setItem("store_attributes_edited", JSON.stringify(edited));
      await new Promise((r) => setTimeout(r, 400));
      router.push("/store/attributes");
    } finally {
      setIsSaving(false);
    }
  };

  if (!attr) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 min-h-96">
        <p className="text-muted-foreground">Attribute not found.</p>
        <Button onClick={() => router.push("/store/attributes")}>Back to Attributes</Button>
      </motion.div>
    );
  }

  return (
    <AttributeForm
      mode="edit"
      attributeName={attr.name}
      initialData={{
        name:            attr.name,
        attributeType:   attr.attributeType,
        fieldType:       attr.fieldType,
        usedInVariation: attr.usedInVariation,
        options:         attr.options,
      }}
      breadcrumbs={[
        { label: "Store",      href: "/store" },
        { label: "Attributes", href: "/store/attributes" },
        { label: attr.name },
      ]}
      onSave={handleSave}
      onCancel={() => router.push("/store/attributes")}
      isSaving={isSaving}
    />
  );
}
