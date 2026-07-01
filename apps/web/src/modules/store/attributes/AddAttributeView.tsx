"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AttributeForm, type AttributeFormData } from "./AttributeForm";
import { storeAttributes } from "@/lib/api";

export function AddAttributeView() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: AttributeFormData) => {
    setIsSaving(true);
    try {
      await storeAttributes.create({
        name:            data.name,
        attributeType:   data.attributeType,
        fieldType:       data.fieldType,
        usedInVariation: data.usedInVariation,
        options:         data.options.map((o, i) => ({
          name:      o.name,
          colorHex:  o.colorHex || undefined,
          sortOrder: i,
        })),
      });
      router.push("/store/attributes");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save attribute");
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
