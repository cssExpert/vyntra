"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { storeCustomerGroups, type ApiCustomerGroup } from "@/lib/api";
import { CustomerGroupForm, toCustomerGroupPayload, type CustomerGroupFormData, type DiscountType } from "./CustomerGroupForm";

interface EditCustomerGroupViewProps {
  groupId: string;
}

export function EditCustomerGroupView({ groupId }: EditCustomerGroupViewProps) {
  const router = useRouter();
  const t = useTranslations("store.customerGroups");

  const [group, setGroup] = useState<ApiCustomerGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    storeCustomerGroups.get(groupId)
      .then((g) => { if (active) setGroup(g); })
      .catch(() => { if (active) setError(t("notFound", { defaultValue: "Customer group not found." })); })
      .finally(() => { if (active) setIsLoading(false); });

    return () => { active = false; };
  }, [groupId, t]);

  const handleSave = async (data: CustomerGroupFormData) => {
    setIsSaving(true);
    try {
      await storeCustomerGroups.update(groupId, toCustomerGroupPayload(data));
      router.push("/store/customer-groups");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save customer group");
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

  if (error || !group) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 min-h-96">
        <p className="text-muted-foreground">{error ?? t("notFound", { defaultValue: "Customer group not found." })}</p>
        <Button onClick={() => router.push("/store/customer-groups")}>{t("backToGroups", { defaultValue: "Back to Customer Groups" })}</Button>
      </motion.div>
    );
  }

  return (
    <CustomerGroupForm
      mode="edit"
      groupName={group.name}
      initialData={{
        name: group.name,
        description: group.description ?? "",
        discountType: (group.discountType ?? "none") as DiscountType,
        discountValue: group.discountValue ?? 0,
        requiresApproval: group.requiresApproval,
        minOrderValue: group.minOrderValue != null ? String(group.minOrderValue) : "",
        maxOrderValue: group.maxOrderValue != null ? String(group.maxOrderValue) : "",
      }}
      breadcrumbs={[
        { label: t("store", { defaultValue: "Store" }), href: "/store" },
        { label: t("title", { defaultValue: "Customer Groups" }), href: "/store/customer-groups" },
        { label: group.name },
      ]}
      onSave={handleSave}
      onCancel={() => router.push("/store/customer-groups")}
      isSaving={isSaving}
    />
  );
}
