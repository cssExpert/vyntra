"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AttributeForm, type AttributeFormData } from "./AttributeForm";

export function AddAttributeView() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: AttributeFormData) => {
    setIsSaving(true);
    try {
      const newId = `attr_new_${Date.now()}`;
      const added = JSON.parse(
        typeof window !== "undefined" ? localStorage.getItem("store_attributes_added") || "[]" : "[]",
      );
      added.unshift({
        id:              newId,
        name:            data.name,
        attributeType:   data.attributeType,
        fieldType:       data.fieldType,
        usedInVariation: data.usedInVariation,
        options:         data.options,
        createdAt:       new Date().toISOString().slice(0, 10),
        updatedAt:       new Date().toISOString().slice(0, 10),
      });
      localStorage.setItem("store_attributes_added", JSON.stringify(added));
      await new Promise((r) => setTimeout(r, 400));
      router.push("/store/attributes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AttributeForm
      mode="add"
      breadcrumbs={[
        { label: "Store",      href: "/store" },
        { label: "Attributes", href: "/store/attributes" },
        { label: "Add" },
      ]}
      onSave={handleSave}
      onCancel={() => router.push("/store/attributes")}
      isSaving={isSaving}
    />
  );
}
