"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";
import { RadioChips } from "@/components/common/RadioChips";
import type { CreateCustomerGroupPayload } from "@/lib/api";

const inp = "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";
const lbl = "block text-sm font-medium text-foreground mb-1.5";

export type DiscountType = "none" | "percentage" | "fixed";

export type CustomerGroupFormData = {
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  requiresApproval: boolean;
  minOrderValue: string;
  maxOrderValue: string;
};

/**
 * Maps form state to the API payload shared by create and update. Cleared fields map to
 * `null` (explicit clear), not `undefined` (which the update endpoint treats as "leave
 * untouched" and would silently fail to clear a previously-set discount/value).
 */
export function toCustomerGroupPayload(data: CustomerGroupFormData): CreateCustomerGroupPayload {
  return {
    name: data.name,
    description: data.description || null,
    discountType: data.discountType === "none" ? null : data.discountType,
    discountValue: data.discountType === "none" ? null : data.discountValue,
    requiresApproval: data.requiresApproval,
    minOrderValue: data.minOrderValue ? Number(data.minOrderValue) : null,
    maxOrderValue: data.maxOrderValue ? Number(data.maxOrderValue) : null,
  };
}

interface CustomerGroupFormProps {
  mode: "add" | "edit";
  initialData?: Partial<CustomerGroupFormData>;
  groupName?: string;
  breadcrumbs: { label: string; href?: string }[];
  onSave: (data: CustomerGroupFormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function CustomerGroupForm({
  mode, initialData, groupName, breadcrumbs, onSave, onCancel, isSaving,
}: CustomerGroupFormProps) {
  const t = useTranslations("store.customerGroups");

  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(initialData?.discountType ?? "none");
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue ?? 0);
  const [requiresApproval, setRequiresApproval] = useState(initialData?.requiresApproval ?? false);
  const [minOrderValue, setMinOrderValue] = useState(initialData?.minOrderValue ?? "");
  const [maxOrderValue, setMaxOrderValue] = useState(initialData?.maxOrderValue ?? "");
  const [errors, setErrors] = useState<Partial<Record<"name" | "discountValue" | "minOrderValue" | "maxOrderValue", string>>>({});

  const handleDiscountValueChange = (raw: string) => {
    let n = Number(raw);
    if (Number.isNaN(n)) n = 0;
    if (discountType === "percentage") n = Math.min(100, Math.max(0, n));
    else n = Math.max(0, n);
    setDiscountValue(n);
  };

  const validate = (): boolean => {
    const next: typeof errors = {};

    if (!name.trim()) {
      next.name = t("errorNameRequired", { defaultValue: "Name is required." });
    }

    if (discountType !== "none" && discountValue <= 0) {
      next.discountValue = t("errorDiscountValue", { defaultValue: "Enter a discount value greater than 0." });
    }

    const min = minOrderValue ? Number(minOrderValue) : null;
    const max = maxOrderValue ? Number(maxOrderValue) : null;
    if (min !== null && min < 0) {
      next.minOrderValue = t("errorNonNegative", { defaultValue: "Must be 0 or greater." });
    }
    if (max !== null && max < 0) {
      next.maxOrderValue = t("errorNonNegative", { defaultValue: "Must be 0 or greater." });
    }
    if (min !== null && max !== null && min > max) {
      next.maxOrderValue = t("errorMaxBelowMin", { defaultValue: "Max order value must be greater than or equal to min." });
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await onSave({ name, description, discountType, discountValue, requiresApproval, minOrderValue, maxOrderValue });
  };

  const cardAnim = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex flex-col gap-4"
    >
      <PageHeader
        title={mode === "add" ? t("addTitle", { defaultValue: "Add Customer Group" }) : t("editTitle", { defaultValue: `Edit Customer Group — ${groupName}`, name: groupName ?? "" })}
        description={t("formDescription", { defaultValue: "Define the group name, flat discount, and B2B purchasing rules." })}
        breadcrumbs={breadcrumbs}
      >
        <Button variant="outline" size="lg" onClick={onCancel}>
          <X size={16} /> {t("cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button size="lg" onClick={handleSave} disabled={isSaving || !name.trim()}>
          <Save size={16} /> {isSaving ? t("saving", { defaultValue: "Saving…" }) : t("save", { defaultValue: "Save" })}
        </Button>
      </PageHeader>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">{t("groupDetails", { defaultValue: "Group Details" })}</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={lbl}>{t("nameLabel", { defaultValue: "Name" })} <span className="text-destructive">*</span></label>
                <Input
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
                  placeholder={t("namePlaceholder", { defaultValue: "e.g. Dealers, Contractors…" })}
                  className={inp}
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <label className={lbl}>{t("descriptionLabel", { defaultValue: "Description" })}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("descriptionPlaceholder", { defaultValue: "Optional internal note about this group…" })}
                  rows={3}
                  className={inp}
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">{t("discount", { defaultValue: "Flat Discount" })}</h3>
            </div>
            <div className="p-5 space-y-4">
              <RadioChips
                value={discountType}
                onChange={setDiscountType}
                options={[
                  { value: "none", label: t("discountNone", { defaultValue: "None" }) },
                  { value: "percentage", label: t("discountPercent", { defaultValue: "Percent" }) },
                  { value: "fixed", label: t("discountFixed", { defaultValue: "Fixed" }) },
                ]}
              />
              {discountType !== "none" && (
                <div>
                  <label className={lbl}>{t("discountValueLabel", { defaultValue: "Discount Value" })}</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={discountValue}
                      onChange={(e) => { handleDiscountValueChange(e.target.value); if (errors.discountValue) setErrors((p) => ({ ...p, discountValue: undefined })); }}
                      min={0}
                      max={discountType === "percentage" ? 100 : undefined}
                      className={inp}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                      {discountType === "percentage" ? "%" : "$"}
                    </span>
                  </div>
                  {errors.discountValue && <p className="mt-1 text-xs text-destructive">{errors.discountValue}</p>}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">{t("purchasing", { defaultValue: "Purchasing" })}</h3>
            </div>
            <div className="p-5 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-[14px] font-medium text-foreground">{t("requiresApproval", { defaultValue: "Requires Approval" })}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{t("requiresApprovalDesc", { defaultValue: "New customers assigned to this group stay pending until staff approve them." })}</p>
                </div>
                <Switch checked={requiresApproval} onCheckedChange={setRequiresApproval} />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>{t("minOrderValue", { defaultValue: "Min Order Value" })}</label>
                  <Input
                    type="number"
                    min={0}
                    value={minOrderValue}
                    onChange={(e) => { setMinOrderValue(e.target.value); setErrors((p) => ({ ...p, minOrderValue: undefined, maxOrderValue: undefined })); }}
                    placeholder="0"
                    className={inp}
                  />
                  {errors.minOrderValue && <p className="mt-1 text-xs text-destructive">{errors.minOrderValue}</p>}
                </div>
                <div>
                  <label className={lbl}>{t("maxOrderValue", { defaultValue: "Max Order Value" })}</label>
                  <Input
                    type="number"
                    min={0}
                    value={maxOrderValue}
                    onChange={(e) => { setMaxOrderValue(e.target.value); setErrors((p) => ({ ...p, minOrderValue: undefined, maxOrderValue: undefined })); }}
                    placeholder={t("noLimit", { defaultValue: "No limit" })}
                    className={inp}
                  />
                  {errors.maxOrderValue && <p className="mt-1 text-xs text-destructive">{errors.maxOrderValue}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">{t("summary", { defaultValue: "Summary" })}</h3>
            </div>
            <div className="p-5 space-y-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("nameLabel", { defaultValue: "Name" })}</span>
                <span className="font-medium text-foreground">{name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("discount", { defaultValue: "Discount" })}</span>
                <span className="font-medium text-foreground">
                  {discountType === "none" ? "—" : discountType === "percentage" ? `${discountValue}%` : `$${discountValue}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("requiresApproval", { defaultValue: "Requires Approval" })}</span>
                <span className={`font-semibold ${requiresApproval ? "text-primary" : "text-muted-foreground"}`}>
                  {requiresApproval ? t("yes", { defaultValue: "Yes" }) : t("no", { defaultValue: "No" })}
                </span>
              </div>
            </div>
          </motion.div>
          {mode === "add" && (
            <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="p-5 text-[13px] text-muted-foreground">
                {t("addNextStepHint", { defaultValue: "After saving, you'll be taken to Manage Restrictions to configure product, category, and payment visibility for this group." })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
        <p className="text-xs text-muted-foreground hidden sm:block">{t("allChangesSaved", { defaultValue: "All changes are saved to the database." })}</p>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" onClick={onCancel}>{t("cancel", { defaultValue: "Cancel" })}</Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            <Save size={14} /> {isSaving ? t("saving", { defaultValue: "Saving…" }) : t("save", { defaultValue: "Save" })}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
