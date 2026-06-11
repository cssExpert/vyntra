"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Tag,
  TrendingUp,
  Layers,
  UserCheck,
} from "lucide-react";
import Select, { type StylesConfig, type GroupBase } from "react-select";
import { cn } from "@/lib/utils";
import type { ContactStage, ContactSource } from "../../types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

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

// ── Options (labels stay data-driven — will come from the backend) ─────────────

const STAGE_OPTIONS: SelectOption<ContactStage>[] = [
  { value: "subscriber", label: "Subscriber" },
  { value: "lead", label: "Lead" },
  { value: "mql", label: "Marketing Qualified Lead" },
  { value: "sql", label: "Sales Qualified Lead" },
  { value: "opportunity", label: "Opportunity" },
  { value: "customer", label: "Customer" },
];

const SOURCE_OPTIONS: SelectOption[] = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social", label: "Social Media" },
  { value: "email", label: "Email" },
  { value: "paid_ads", label: "Paid Ads" },
  { value: "organic", label: "Organic" },
  { value: "cold_outreach", label: "Cold Outreach" },
];

const OWNER_OPTIONS: SelectOption[] = [
  { value: "ravi", label: "Ravi Gupta" },
  { value: "alex", label: "Alex Smith" },
  { value: "emma", label: "Emma Davis" },
];

const EMPTY: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  owner: "",
  stage: "lead",
  source: "",
  tags: "",
};

// ── React Select shared styles (design-token–aware) ────────────────────────────

function buildSelectStyles<T extends string>(): StylesConfig<
  SelectOption<T>,
  false,
  GroupBase<SelectOption<T>>
> {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      backgroundColor: "hsl(var(--background))",
      borderColor: state.isFocused
        ? "hsl(var(--primary))"
        : "hsl(var(--border))",
      borderRadius: "var(--radius)",
      boxShadow: state.isFocused
        ? "0 0 0 2px hsl(var(--primary) / 0.2)"
        : "none",
      cursor: "default",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      "&:hover": { borderColor: "hsl(var(--border))" },
    }),
    valueContainer: (base) => ({ ...base, padding: "2px 12px" }),
    singleValue: (base) => ({
      ...base,
      color: "hsl(var(--foreground))",
      fontSize: "0.875rem",
    }),
    placeholder: (base) => ({
      ...base,
      color: "hsl(var(--muted-foreground) / 0.6)",
      fontSize: "0.875rem",
    }),
    input: (base) => ({
      ...base,
      color: "hsl(var(--foreground))",
      fontSize: "0.875rem",
      outline: "none",
      boxShadow: "none",
      caretColor: "hsl(var(--primary))",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
      transition: "transform 0.2s ease",
      transform: state.selectProps.menuIsOpen
        ? "rotate(180deg)"
        : "rotate(0deg)",
      "&:hover": { color: "hsl(var(--foreground))" },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
      "&:hover": { color: "hsl(var(--foreground))" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "var(--radius)",
      overflow: "hidden",
      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
      zIndex: 10000,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 10000 }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: "pointer",
      color: state.isSelected
        ? "hsl(var(--primary-foreground))"
        : "hsl(var(--foreground))",
      backgroundColor: state.isSelected
        ? "hsl(var(--primary))"
        : state.isFocused
          ? "hsl(var(--muted))"
          : "transparent",
      "&:active": {
        backgroundColor: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
      fontSize: "0.875rem",
    }),
  };
}

// Memoised per generic type to avoid object recreation on every render
const stageStyles = buildSelectStyles<ContactStage>();
const sourceStyles = buildSelectStyles<string>();
const ownerStyles = buildSelectStyles<string>();

// ── Option label highlighter ───────────────────────────────────────────────────

function highlightLabel(label: string, query: string): React.ReactNode {
  if (!query) return label;
  const i = label.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return label;
  return (
    <>
      {label.slice(0, i)}
      <span style={{ color: "hsl(var(--primary))", fontWeight: 700 }}>
        {label.slice(i, i + query.length)}
      </span>
      {label.slice(i + query.length)}
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FormField({
  label,
  icon: Icon,
  children,
  required,
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
        {required && <span className="text-error ml-0.5">*</span>}
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

const portalTarget =
  typeof document !== "undefined" ? document.body : undefined;

// ── Drawer ─────────────────────────────────────────────────────────────────────

export function AddContactDrawer({
  isOpen,
  onClose,
  onSave,
}: AddContactDrawerProps) {
  const t = useTranslations("crm");
  const [form, setForm] = useState<ContactFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const setField =
    (field: keyof ContactFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const e: Partial<ContactFormData> = {};
    if (!form.firstName.trim()) e.firstName = t("drawer.required");
    if (!form.email.trim()) e.email = t("drawer.required");
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave(form);
    setForm(EMPTY);
    setErrors({});
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
                <h2 className="text-base font-semibold font-display text-foreground">
                  {t("addContact")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("drawer.subtitle")}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4 no-scrollbar"
            >
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t("drawer.firstName")} icon={User} required>
                  <input
                    value={form.firstName}
                    onChange={setField("firstName")}
                    placeholder="Ravi"
                    className={cn(
                      inputCls,
                      errors.firstName &&
                        "border-error focus:border-error focus:ring-error/20",
                    )}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-error">
                      {errors.firstName}
                    </p>
                  )}
                </FormField>
                <FormField label={t("drawer.lastName")} icon={User}>
                  <input
                    value={form.lastName}
                    onChange={setField("lastName")}
                    placeholder="Gupta"
                    className={inputCls}
                  />
                </FormField>
              </div>

              <FormField label={t("drawer.emailAddress")} icon={Mail} required>
                <input
                  type="email"
                  value={form.email}
                  onChange={setField("email")}
                  placeholder="email@domain.com"
                  className={cn(
                    inputCls,
                    errors.email &&
                      "border-error focus:border-error focus:ring-error/20",
                  )}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-error">{errors.email}</p>
                )}
              </FormField>

              <FormField label={t("drawer.phoneNumber")} icon={Phone}>
                <input
                  value={form.phone}
                  onChange={setField("phone")}
                  placeholder="+1 (555) 000-0000"
                  className={inputCls}
                />
              </FormField>

              <FormField label={t("drawer.company")} icon={Building2}>
                <input
                  value={form.company}
                  onChange={setField("company")}
                  placeholder={t("drawer.companyPlaceholder")}
                  className={inputCls}
                />
              </FormField>

              <FormField label={t("drawer.jobTitle")} icon={Briefcase}>
                <input
                  value={form.jobTitle}
                  onChange={setField("jobTitle")}
                  placeholder={t("drawer.jobTitlePlaceholder")}
                  className={inputCls}
                />
              </FormField>

              {/* ── React Select fields ── */}

              <FormField label={t("filterStatus")} icon={TrendingUp}>
                <Select<SelectOption<ContactStage>, false>
                  classNamePrefix="rs"
                  options={STAGE_OPTIONS}
                  value={
                    STAGE_OPTIONS.find((o) => o.value === form.stage) ?? null
                  }
                  onChange={(opt) =>
                    setForm((p) => ({ ...p, stage: opt?.value ?? "lead" }))
                  }
                  placeholder={t("drawer.selectStatus")}
                  isSearchable
                  isClearable={false}
                  formatOptionLabel={(opt, { context, inputValue }) =>
                    context === "menu"
                      ? highlightLabel(opt.label, inputValue)
                      : opt.label
                  }
                  styles={stageStyles}
                  menuPortalTarget={portalTarget}
                  menuPlacement="auto"
                />
              </FormField>

              <FormField label={t("filterOwner")} icon={UserCheck}>
                <Select<SelectOption, false>
                  classNamePrefix="rs"
                  options={OWNER_OPTIONS}
                  value={
                    OWNER_OPTIONS.find((o) => o.value === form.owner) ?? null
                  }
                  onChange={(opt) =>
                    setForm((p) => ({ ...p, owner: opt?.value ?? "" }))
                  }
                  placeholder={t("ownerOptions.unassigned")}
                  isSearchable
                  isClearable
                  formatOptionLabel={(opt, { context, inputValue }) =>
                    context === "menu"
                      ? highlightLabel(opt.label, inputValue)
                      : opt.label
                  }
                  styles={ownerStyles}
                  menuPortalTarget={portalTarget}
                  menuPlacement="auto"
                />
              </FormField>

              <FormField label={t("drawer.source")} icon={Layers}>
                <Select<SelectOption, false>
                  classNamePrefix="rs"
                  options={SOURCE_OPTIONS}
                  value={
                    SOURCE_OPTIONS.find((o) => o.value === form.source) ?? null
                  }
                  onChange={(opt) =>
                    setForm((p) => ({
                      ...p,
                      source: (opt?.value as ContactSource) ?? "",
                    }))
                  }
                  placeholder={t("drawer.selectSource")}
                  isSearchable
                  isClearable
                  formatOptionLabel={(opt, { context, inputValue }) =>
                    context === "menu"
                      ? highlightLabel(opt.label, inputValue)
                      : opt.label
                  }
                  styles={sourceStyles}
                  menuPortalTarget={portalTarget}
                  menuPlacement="auto"
                />
              </FormField>

              <FormField label={t("drawer.tags")} icon={Tag}>
                <input
                  value={form.tags}
                  onChange={setField("tags")}
                  placeholder="enterprise, hot, priority"
                  className={inputCls}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t("drawer.tagsHint")}
                </p>
              </FormField>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {t("drawer.cancel")}
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-600 transition-colors cursor-pointer shadow-glow-brand"
              >
                {t("drawer.saveContact")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
