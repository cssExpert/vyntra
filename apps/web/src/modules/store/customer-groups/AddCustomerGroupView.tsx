"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CustomerGroupForm, toCustomerGroupPayload, type CustomerGroupFormData } from "./CustomerGroupForm";
import { storeCustomerGroups } from "@/lib/api";

export function AddCustomerGroupView() {
  const router = useRouter();
  const t = useTranslations("store.customerGroups");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: CustomerGroupFormData) => {
    setIsSaving(true);
    try {
      const group = await storeCustomerGroups.create(toCustomerGroupPayload(data));
      router.push(`/store/customer-groups/${group.id}/restrictions`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save customer group");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CustomerGroupForm
      mode="add"
      breadcrumbs={[
        { label: t("store", { defaultValue: "Store" }), href: "/store" },
        { label: t("title", { defaultValue: "Customer Groups" }), href: "/store/customer-groups" },
        { label: t("addGroup", { defaultValue: "Add Group" }) },
      ]}
      onSave={handleSave}
      onCancel={() => router.push("/store/customer-groups")}
      isSaving={isSaving}
    />
  );
}
