"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Building2, Briefcase, Tag, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactStage, ContactSource } from "../../types";

interface AddContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContactFormData) => void;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  owner: string;
  stage: ContactStage;
  source: ContactSource | "";
  tags: string;
}

const STAGE_OPTIONS: { value: ContactStage; label: string }[] = [
  { value: "subscriber",  label: "Subscriber"               },
  { value: "lead",        label: "Lead"                     },
  { value: "mql",         label: "Marketing Qualified Lead" },
  { value: "sql",         label: "Sales Qualified Lead"     },
  { value: "opportunity", label: "Opportunity"              },
  { value: "customer",    label: "Customer"                 },
];

const SOURCE_OPTIONS = [
  { value: "website",       label: "Website"       },
  { value: "referral",      label: "Referral"      },
  { value: "social",        label: "Social Media"  },
  { value: "email",         label: "Email"         },
  { value: "paid_ads",      label: "Paid Ads"      },
  { value: "organic",       label: "Organic"       },
  { value: "cold_outreach", label: "Cold Outreach" },
];

const OWNER_OPTIONS = [
  { value: "ravi",  label: "Ravi Gupta" },
  { value: "alex",  label: "Alex Smith" },
  { value: "emma",  label: "Emma Davis" },
];

const EMPTY: ContactFormData = {
  firstName: "", lastName: "", email: "", phone: "",
  company: "", jobTitle: "", owner: "", stage: "lead", source: "", tags: "",
};

function FormField({
  label, icon: Icon, children, required,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label}
        {required && <span className="text-error">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = cn(
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground",
  "placeholder:text-muted-foreground/50 outline-none",
  "focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200",
);

export function AddContactDrawer({ isOpen, onClose, onSave }: AddContactDrawerProps) {
  const [form, setForm] = useState<ContactFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const set = (field: keyof ContactFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const e: Partial<ContactFormData> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.email.trim())     e.email     = "Required";
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
    setForm(EMPTY);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card border-l border-border shadow-glass-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-semibold font-display text-foreground">Add contact</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Fill in the contact details below</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4 no-scrollbar">

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="First name" icon={User} required>
                  <input
                    value={form.firstName} onChange={set("firstName")}
                    placeholder="Ravi" className={cn(inputCls, errors.firstName && "border-error")}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-error">{errors.firstName}</p>}
                </FormField>
                <FormField label="Last name" icon={User}>
                  <input value={form.lastName} onChange={set("lastName")} placeholder="Gupta" className={inputCls} />
                </FormField>
              </div>

              <FormField label="Email address" icon={Mail} required>
                <input
                  type="email" value={form.email} onChange={set("email")}
                  placeholder="email@domain.com"
                  className={cn(inputCls, errors.email && "border-error")}
                />
                {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
              </FormField>

              <FormField label="Phone number" icon={Phone}>
                <input value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" className={inputCls} />
              </FormField>

              <FormField label="Company" icon={Building2}>
                <input value={form.company} onChange={set("company")} placeholder="Company name" className={inputCls} />
              </FormField>

              <FormField label="Job title" icon={Briefcase}>
                <input value={form.jobTitle} onChange={set("jobTitle")} placeholder="e.g. Marketing Manager" className={inputCls} />
              </FormField>

              {/* Selects */}
              <FormField label="Lead status" icon={ChevronDown}>
                <select value={form.stage} onChange={set("stage")} className={cn(inputCls, "appearance-none")}>
                  {STAGE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Contact owner">
                <select value={form.owner} onChange={set("owner")} className={cn(inputCls, "appearance-none")}>
                  <option value="">Unassigned</option>
                  {OWNER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Source">
                <select value={form.source} onChange={set("source")} className={cn(inputCls, "appearance-none")}>
                  <option value="">Select source</option>
                  {SOURCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Tags" icon={Tag}>
                <input value={form.tags} onChange={set("tags")} placeholder="enterprise, hot, priority" className={inputCls} />
                <p className="mt-1 text-[11px] text-muted-foreground">Comma-separated tags</p>
              </FormField>

            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-glow-brand"
              >
                Save contact
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
