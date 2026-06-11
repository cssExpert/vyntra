"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { MoveLeft, Eye, Save, Plus, Sparkles, Check } from "lucide-react";

import { FieldPalette } from "./FieldPalette";
import { FieldCard } from "./FieldCard";
import { FormPreviewModal } from "./FormPreviewModal";
import { createField } from "./field-config";
import { getForm, upsertForm } from "../forms.store";
import type { CmsForm, FieldType, FormField, FormStatus } from "../forms.types";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || `form-${Date.now()}`
  );
}

function blankForm(): CmsForm {
  const now = new Date().toISOString();
  return {
    id: `form_${Date.now()}`,
    name: "",
    description: "",
    slug: "",
    status: "Draft",
    fields: [createField("short_text")],
    responses: 0,
    createdAt: now,
    updatedAt: now,
  };
}

interface FormBuilderViewProps {
  formId?: string;
}

export function FormBuilderView({ formId }: FormBuilderViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("cms.forms");
  const router = useRouter();
  const [form, setForm] = useState<CmsForm | null>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (formId) {
      const existing = getForm(formId);
      setForm(existing ?? blankForm());
    } else {
      const fresh = blankForm();
      setForm(fresh);
      setActiveFieldId(fresh.fields[0]?.id ?? null);
    }
  }, [formId]);

  if (!form) return null;

  const patchForm = (patch: Partial<CmsForm>) =>
    setForm((f) => (f ? { ...f, ...patch } : f));

  const patchField = (id: string, patch: Partial<FormField>) =>
    patchForm({
      fields: form.fields.map((fld) =>
        fld.id === id ? { ...fld, ...patch } : fld,
      ),
    });

  const addField = (type: FieldType) => {
    const field = createField(type);
    patchForm({ fields: [...form.fields, field] });
    setActiveFieldId(field.id);
  };

  const duplicateField = (id: string) => {
    const source = form.fields.find((f) => f.id === id);
    if (!source) return;
    const copy: FormField = {
      ...createField(source.type),
      ...source,
      id: `fld_${Date.now()}_copy`,
    };
    const index = form.fields.findIndex((f) => f.id === id);
    const fields = [...form.fields];
    fields.splice(index + 1, 0, copy);
    patchForm({ fields });
    setActiveFieldId(copy.id);
  };

  const deleteField = (id: string) => {
    patchForm({ fields: form.fields.filter((f) => f.id !== id) });
    if (activeFieldId === id) setActiveFieldId(null);
  };

  const handleSave = () => {
    upsertForm({
      ...form,
      name: form.name.trim() || "Untitled form",
      slug: form.slug || slugify(form.name),
      updatedAt: new Date().toISOString(),
    });
    setJustSaved(true);
    setTimeout(() => router.push("/cms/forms"), 650);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/cms/forms")}
            className="inline-flex items-center justify-center w-9 h-9 rounded-sm border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            aria-label="Back to forms"
          >
            <MoveLeft size={15} />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-foreground truncate">
              {formId ? "Edit Form" : "New Form"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {form.fields.length} field{form.fields.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={form.status}
            onChange={(e) =>
              patchForm({ status: e.target.value as FormStatus })
            }
            className="px-3 py-2.5 bg-background border border-border rounded-sm text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Closed">Closed</option>
          </select>
          <button
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-all active:scale-[0.98]"
          >
            <Eye size={15} />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={justSaved}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-600 transition-all active:scale-[0.98] disabled:opacity-80"
          >
            <AnimatePresence mode="wait" initial={false}>
              {justSaved ? (
                <motion.span
                  key="saved"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2"
                >
                  <Check size={15} className="stroke-[3]" />
                  Saved
                </motion.span>
              ) : (
                <motion.span
                  key="save"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-flex items-center gap-2"
                >
                  <Save size={15} />
                  Save Form
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Builder layout ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5 mt-5 items-start">
        <FieldPalette onAdd={addField} />

        <div className="max-w-3xl w-full mx-auto space-y-3">
          {/* Form title card */}
          <motion.div
            layout
            className="bg-card border border-border rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            <div className="p-5 space-y-2">
              <input
                value={form.name}
                onChange={(e) => patchForm({ name: e.target.value })}
                placeholder="Untitled form"
                className="w-full bg-transparent text-2xl font-bold text-foreground placeholder:text-muted-foreground/40 outline-none border-0 transition-colors ring-0 focus:ring-0"
              />
              <input
                value={form.description}
                onChange={(e) => patchForm({ description: e.target.value })}
                placeholder="Form description (optional)"
                className="w-full bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/40 outline-none border-0 transition-colors ring-0 focus:ring-0"
              />
            </div>
          </motion.div>

          {/* Fields */}
          {form.fields.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={form.fields}
              onReorder={(fields) => patchForm({ fields })}
              className="space-y-3"
            >
              <AnimatePresence initial={false}>
                {form.fields.map((field, index) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    index={index}
                    isActive={activeFieldId === field.id}
                    onActivate={() => setActiveFieldId(field.id)}
                    onChange={(patch) => patchField(field.id, patch)}
                    onDuplicate={() => duplicateField(field.id)}
                    onDelete={() => deleteField(field.id)}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-dashed border-border rounded-xl py-12 text-center"
            >
              <Sparkles className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">
                Your form is empty
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add fields from the panel on the left.
              </p>
            </motion.div>
          )}

          {/* Quick add */}
          <motion.button
            layout
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => addField("short_text")}
            className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Plus size={15} className="stroke-[2.5]" />
            Add field
          </motion.button>
        </div>
      </div>

      <FormPreviewModal
        form={previewOpen ? form : null}
        onClose={() => setPreviewOpen(false)}
      />
    </motion.div>
  );
}
