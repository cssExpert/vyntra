"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, X, Plus } from "lucide-react";
import type { AttributeType, AttributeFieldType, AttributeOption } from "../store.types";

// ─── Styles ───────────────────────────────────────────────────────────────────

const inp = "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15";
const lbl = "block text-sm font-medium text-foreground mb-1.5";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AttributeFormData = {
  name: string;
  attributeType: AttributeType;
  fieldType: AttributeFieldType;
  usedInVariation: boolean;
  options: AttributeOption[];
};

// ─── Field Type options ───────────────────────────────────────────────────────

const FIELD_TYPES: { value: AttributeFieldType; label: string; desc: string }[] = [
  { value: "dropdown",    label: "Dropdown",    desc: "Single selection from a dropdown list." },
  { value: "multiselect", label: "Multi-select", desc: "Allow multiple values to be selected — e.g. available widths, finishes." },
  { value: "buttons",     label: "Buttons",     desc: "Create individual buttons for Customers to select an option." },
  { value: "text",        label: "Text",        desc: "Free-form single-line text input per product." },
  { value: "textarea",    label: "Textarea",    desc: "Free-form multi-line text input per product." },
];

// ─── RadioList ────────────────────────────────────────────────────────────────

function RadioList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; desc?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-start gap-3 cursor-pointer rounded-md border px-4 py-3 transition-all ${
            value === opt.value
              ? "border-primary bg-primary/5"
              : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
          }`}
        >
          <input
            type="radio"
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 accent-primary cursor-pointer shrink-0"
          />
          <div>
            <p className={`text-[14px] font-medium leading-tight ${value === opt.value ? "text-primary" : "text-foreground"}`}>
              {opt.label}
            </p>
            {opt.desc && <p className="text-[12px] text-muted-foreground mt-0.5">{opt.desc}</p>}
          </div>
        </label>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AttributeFormProps {
  mode: "add" | "edit";
  initialData?: Partial<AttributeFormData>;
  attributeName?: string;
  breadcrumbs: { label: string; href?: string }[];
  onSave: (data: AttributeFormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AttributeForm({
  mode, initialData, attributeName, breadcrumbs, onSave, onCancel, isSaving,
}: AttributeFormProps) {
  const [name,             setName]             = useState(initialData?.name             ?? "");
  const [attributeType,    setAttributeType]    = useState<AttributeType>(initialData?.attributeType    ?? "selection");
  const [fieldType,        setFieldType]        = useState<AttributeFieldType>(initialData?.fieldType        ?? "dropdown");
  const [usedInVariation,  setUsedInVariation]  = useState(initialData?.usedInVariation  ?? false);
  const [options,          setOptions]          = useState<AttributeOption[]>(initialData?.options ?? []);
  const [optionInput,      setOptionInput]      = useState("");

  const showOptions = attributeType === "color" || (fieldType !== "text" && fieldType !== "textarea");

  const addOption = () => {
    const val = optionInput.trim();
    if (!val || options.find((o) => o.name === val)) return;
    setOptions((p) => [...p, { id: Date.now().toString(), name: val }]);
    setOptionInput("");
  };

  const addOptionOnKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    addOption();
  };

  const removeOption = (id: string) => setOptions((p) => p.filter((o) => o.id !== id));

  const updateOption = (id: string, field: "name" | "colorHex", value: string) =>
    setOptions((p) => p.map((o) => o.id === id ? { ...o, [field]: value } : o));

  const handleSave = async () => {
    await onSave({ name, attributeType, fieldType, usedInVariation, options });
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
        title={mode === "add" ? "Add Attribute" : `Edit Attribute — ${attributeName}`}
        description="Define attribute name, type, field type, and options."
        breadcrumbs={breadcrumbs}
      >
        <Button variant="outline" size="lg" onClick={onCancel}>
          <X size={16} /> Cancel
        </Button>
        <Button size="lg" onClick={handleSave} disabled={isSaving || !name.trim()}>
          <Save size={16} /> {isSaving ? "Saving…" : "Save"}
        </Button>
      </PageHeader>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* ── Left: form ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Attribute Name */}
          <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">Attribute Name</h3>
            </div>
            <div className="p-5">
              <label className={lbl}>Attribute Name <span className="text-destructive">*</span></label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Color, Size, Material…" className={inp} />
            </div>
          </motion.div>

          {/* Attribute Type */}
          <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">Attribute Type</h3>
            </div>
            <div className="p-5">
              <RadioList
                value={attributeType}
                onChange={(v) => setAttributeType(v)}
                options={[
                  { value: "selection", label: "Selection", desc: "Add options for Customers to select before adding to cart" },
                  { value: "color",     label: "Color",     desc: "Add color options for Customers to choose before adding to cart. Pricing is optional" },
                ]}
              />
            </div>
          </motion.div>

          {/* Field Type — only for Selection */}
          {attributeType === "selection" && (
            <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">Field Type</h3>
              </div>
              <div className="p-5">
                <RadioList
                  value={fieldType}
                  onChange={(v) => setFieldType(v)}
                  options={FIELD_TYPES}
                />
              </div>
            </motion.div>
          )}

          {/* Used In Variation */}
          <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">Used In Variation</h3>
            </div>
            <div className="p-5">
              <RadioList
                value={usedInVariation ? "yes" : "no"}
                onChange={(v) => setUsedInVariation(v === "yes")}
                options={[
                  { value: "yes", label: "Yes (This attribute is used to create product variations/variants.)" },
                  { value: "no",  label: "No (This attribute is displayed as product specifications on the product page.)" },
                ]}
              />
            </div>
          </motion.div>

          {/* List of Options */}
          {showOptions && (
            <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">List of Options</h3>
                {options.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">{options.length} option{options.length !== 1 ? "s" : ""}</span>
                )}
              </div>
              <div className="p-5 space-y-4">
                {/* Existing options */}
                {options.length > 0 && (
                  <div className="space-y-2">
                    {options.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="text-[12px] text-muted-foreground w-6 text-right shrink-0">{idx + 1}.</span>
                        {attributeType === "color" && (
                          <input
                            type="color"
                            value={opt.colorHex || "#000000"}
                            onChange={(e) => updateOption(opt.id, "colorHex", e.target.value)}
                            className="h-9 w-10 rounded-sm border border-border cursor-pointer shrink-0 p-0.5"
                            title="Pick color"
                          />
                        )}
                        <Input
                          value={opt.name}
                          onChange={(e) => updateOption(opt.id, "name", e.target.value)}
                          placeholder="Name *"
                          className={`${inp} flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(opt.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new option */}
                <div>
                  <label className={lbl}>Name <span className="text-destructive">*</span></label>
                  <div className="flex gap-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyDown={addOptionOnKey}
                      placeholder={attributeType === "color" ? "e.g. Red, Blue, Green…" : "e.g. Small, Medium, Large…"}
                      className={`${inp} flex-1`}
                    />
                    <Button variant="outline" type="button" onClick={addOption} className="shrink-0">
                      <Plus size={14} /> Add New
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Right: summary sidebar ───────────────────────────────────── */}
        <div className="space-y-4">
          <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
            </div>
            <div className="p-5 space-y-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-foreground capitalize">{attributeType}</span>
              </div>
              {attributeType === "selection" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Field</span>
                  <span className="font-medium text-foreground capitalize">{fieldType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Used in Variation</span>
                <span className={`font-semibold ${usedInVariation ? "text-primary" : "text-muted-foreground"}`}>
                  {usedInVariation ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Options</span>
                <span className="font-medium text-foreground">{options.length}</span>
              </div>
            </div>
          </motion.div>

          {options.length > 0 && (
            <motion.div variants={cardAnim} className="bg-card rounded-xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">Options Preview</h3>
              </div>
              <div className="p-5 flex flex-wrap gap-2">
                {options.map((opt) => (
                  <span key={opt.id} className="flex items-center gap-1.5 text-[12px] font-medium bg-muted px-2.5 py-1 rounded-sm text-foreground">
                    {opt.colorHex && (
                      <span className="inline-block w-3 h-3 rounded-full border border-border" style={{ background: opt.colorHex }} />
                    )}
                    {opt.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-t border-border/60 flex items-center justify-between gap-4 z-10">
        <p className="text-xs text-muted-foreground hidden sm:block">All changes are saved to local store.</p>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            <Save size={14} /> {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
