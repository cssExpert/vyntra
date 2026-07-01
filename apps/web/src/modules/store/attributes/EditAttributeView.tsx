"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { storeAttributes, type ApiAttribute } from "@/lib/api";
import { AttributeForm, type AttributeFormData } from "./AttributeForm";

interface EditAttributeViewProps {
  attributeId: string;
}

export function EditAttributeView({ attributeId }: EditAttributeViewProps) {
  const router = useRouter();

  const [attr,      setAttr]      = useState<ApiAttribute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    storeAttributes.get(attributeId)
      .then((a) => { if (active) setAttr(a); })
      .catch(() => { if (active) setError("Attribute not found."); })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, [attributeId]);

  const handleSave = async (data: AttributeFormData) => {
    setIsSaving(true);
    try {
      await storeAttributes.update(attributeId, {
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-64 rounded-sm bg-muted animate-pulse" />
        <div className="h-80 w-full rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (error || !attr) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 min-h-96">
        <p className="text-muted-foreground">{error ?? "Attribute not found."}</p>
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
        attributeType:   attr.attributeType as AttributeFormData["attributeType"],
        fieldType:       attr.fieldType as AttributeFormData["fieldType"],
        usedInVariation: attr.usedInVariation,
        options:         attr.values.map((v) => ({
          id:       v.id,
          name:     v.name,
          colorHex: v.colorHex ?? undefined,
          sortOrder: v.sortOrder,
        })),
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
