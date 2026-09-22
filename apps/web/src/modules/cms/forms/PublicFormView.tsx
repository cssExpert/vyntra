"use client";

import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  htmlHasContent,
  isLayoutField,
  flattenFields,
  resolveFormAppearance,
  fieldColSpan,
  type FormField,
  type FormSettings,
  type SubmitButtonConfig,
} from "./forms.types";
import { AccordionView } from "./AccordionView";
import { TabsView } from "./TabsView";
import { FormSeparator } from "./FormSeparator";
import { SubmitButtonView } from "./SubmitButtonView";
import { PasswordInput } from "./PasswordInput";
import { FormImage } from "./FormImage";
import { CardVisual } from "./CardVisual";
import { ChoiceInput } from "./ChoiceInput";
import { MultiSelectInput, AutocompleteInput } from "./SelectInputs";
import { FormSlider } from "./FormSlider";
import { WithLeadingIcon, fieldIconPad, supportsFieldIcon } from "./field-icons";
import { applyMask, effectiveMask, maskInputMode } from "./mask";
import { loadGoogleFont } from "@/lib/googleFont";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all disabled:opacity-50";

// ── Field renderers ────────────────────────────────────────────────────────────

function RatingInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const [hover, setHover] = useState(0);
  const selected = Number(value) || 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          disabled={disabled}
          whileHover={disabled ? {} : { scale: 1.15 }}
          whileTap={disabled ? {} : { scale: 0.9 }}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => !disabled && onChange(String(n))}
          className="p-0.5 disabled:cursor-not-allowed"
        >
          <Star
            size={26}
            className={`transition-colors ${
              n <= (hover || selected)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/25"
            }`}
          />
        </motion.button>
      ))}
      {selected > 0 && (
        <span className="ml-2 text-xs text-muted-foreground">{selected} / 5</span>
      )}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  error,
  disabled,
}: {
  field: FormField;
  value: string | string[];
  onChange: (v: string | string[]) => void;
  error: boolean;
  disabled: boolean;
}) {
  const borderCls = error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15" : "";
  const iconName = supportsFieldIcon(field.type) ? field.icon : undefined;
  const iconPad = fieldIconPad(iconName);
  const mask = effectiveMask(field.type, field.mask);
  const onText = (raw: string) => onChange(mask ? applyMask(mask, raw) : raw);
  const maskMode = maskInputMode(mask);

  switch (field.type) {
    case "long_text":
    case "textarea":
      return (
        <textarea
          rows={4}
          placeholder={field.placeholder}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} ${borderCls} resize-none`}
        />
      );

    case "toggle": {
      const on = value === "true";
      return (
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={disabled}
          onClick={() => onChange(on ? "" : "true")}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
            on ? "bg-primary" : "bg-muted-foreground/30"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              on ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      );
    }

    case "slider":
      return (
        <FormSlider
          value={value as string}
          onChange={(v) => onChange(v)}
          min={field.min ?? 0}
          max={field.max ?? 100}
          step={field.step ?? 1}
          disabled={disabled}
        />
      );

    case "phone":
      return (
        <WithLeadingIcon name={iconName}>
          <input
            type="tel"
            inputMode={maskMode}
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => onText(e.target.value)}
            disabled={disabled}
            className={`${inputCls} ${borderCls} ${iconPad}`}
          />
        </WithLeadingIcon>
      );

    case "time":
      return (
        <input
          type="time"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} ${borderCls}`}
        />
      );

    case "datetime":
      return (
        <input
          type="datetime-local"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} ${borderCls}`}
        />
      );

    case "month":
      return (
        <input
          type="month"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} ${borderCls}`}
        />
      );

    case "year":
      return (
        <input
          type="number"
          min={1900}
          max={2200}
          placeholder={field.placeholder}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} ${borderCls}`}
        />
      );

    case "multiple_choice":
    case "checkboxes":
    case "nps":
    case "emoji":
      return (
        <ChoiceInput
          field={field}
          value={value}
          onChange={onChange}
          disabled={disabled}
          error={error}
        />
      );

    case "dropdown":
      return (
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} ${borderCls} cursor-pointer`}
        >
          <option value="">Select an option…</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "multiselect":
      return (
        <MultiSelectInput
          options={field.options}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          placeholder={field.placeholder}
          disabled={disabled}
          error={error}
        />
      );

    case "autocomplete":
      return (
        <AutocompleteInput
          options={field.options}
          value={value as string}
          onChange={onChange}
          placeholder={field.placeholder}
          disabled={disabled}
          error={error}
        />
      );

    case "rating":
      return (
        <RatingInput
          value={value as string}
          onChange={onChange as (v: string) => void}
          disabled={disabled}
        />
      );

    case "file":
      return (
        <div className="border-2 border-dashed border-border rounded-lg px-4 py-6 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer opacity-60">
          <Upload className="w-5 h-5 text-muted-foreground/50 mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">File upload not supported yet</p>
        </div>
      );

    case "email":
      return (
        <WithLeadingIcon name={iconName}>
          <input
            type="email"
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`${inputCls} ${borderCls} ${iconPad}`}
          />
        </WithLeadingIcon>
      );

    case "password":
      return (
        <PasswordInput
          value={value as string}
          onChange={onText}
          placeholder={field.placeholder}
          disabled={disabled}
          showToggle={field.passwordToggle !== false}
          className={`${inputCls} ${borderCls}`}
        />
      );

    case "number":
      return (
        <WithLeadingIcon name={iconName}>
          <input
            type={mask ? "text" : "number"}
            inputMode={maskMode}
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => onText(e.target.value)}
            disabled={disabled}
            className={`${inputCls} ${borderCls} ${iconPad}`}
          />
        </WithLeadingIcon>
      );

    case "date":
      return (
        <WithLeadingIcon name={iconName}>
          <input
            type="date"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`${inputCls} ${borderCls} ${iconPad}`}
          />
        </WithLeadingIcon>
      );

    default:
      return (
        <WithLeadingIcon name={iconName}>
          <input
            type="text"
            inputMode={maskMode}
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => onText(e.target.value)}
            disabled={disabled}
            className={`${inputCls} ${borderCls} ${iconPad}`}
          />
        </WithLeadingIcon>
      );
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

interface PublicFormViewProps {
  form: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    fields: FormField[];
    captchaEnabled: boolean;
    submitButton?: SubmitButtonConfig | null;
    settings?: FormSettings | null;
  };
  orgId: string;
}

type FieldValues = Record<string, string | string[]>;

const MULTI_VALUE_TYPES = new Set(["checkboxes", "multiselect"]);

function emptyValues(fields: FormField[]): FieldValues {
  return Object.fromEntries(
    flattenFields(fields)
      .filter((f) => !isLayoutField(f.type))
      .map((f) => [f.id, MULTI_VALUE_TYPES.has(f.type) ? [] : ""]),
  );
}

function validate(fields: FormField[], values: FieldValues): Set<string> {
  const errors = new Set<string>();
  for (const f of flattenFields(fields)) {
    if (isLayoutField(f.type) || !f.required) continue;
    const v = values[f.id];
    if (MULTI_VALUE_TYPES.has(f.type)) {
      if (!Array.isArray(v) || v.length === 0) errors.add(f.id);
    } else if (!v || (typeof v === "string" && v.trim() === "")) {
      errors.add(f.id);
    }
  }
  return errors;
}

export function PublicFormView({ form, orgId }: PublicFormViewProps) {
  const [values, setValues] = useState<FieldValues>(() => emptyValues(form.fields));
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const recaptchaReady = useRef(false);

  const captchaActive = form.captchaEnabled && !!RECAPTCHA_SITE_KEY;
  const appearance = resolveFormAppearance(form.settings);

  useEffect(() => {
    loadGoogleFont(form.settings?.headerFont);
    loadGoogleFont(form.settings?.bodyFont);
  }, [form.settings?.headerFont, form.settings?.bodyFont]);

  const setField = useCallback((id: string, v: string | string[]) => {
    setValues((prev) => ({ ...prev, [id]: v }));
    setErrors((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const getCaptchaToken = useCallback(async (): Promise<string | undefined> => {
    if (!captchaActive || !recaptchaReady.current || !window.grecaptcha) return undefined;
    return new Promise((resolve) => {
      window.grecaptcha!.ready(() => {
        window
          .grecaptcha!.execute(RECAPTCHA_SITE_KEY!, { action: "form_submit" })
          .then(resolve)
          .catch(() => resolve(undefined));
      });
    });
  }, [captchaActive]);

  const handleSubmit = async () => {
    const errs = validate(form.fields, values);
    if (errs.size > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const captchaToken = await getCaptchaToken();
      const res = await fetch(
        `${API}/public/sites/${orgId}/forms/${encodeURIComponent(form.slug)}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(captchaToken ? { ...values, captchaToken } : values),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || "Submission failed");
      }
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const recaptchaScript = captchaActive ? (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
      strategy="afterInteractive"
      onLoad={() => {
        recaptchaReady.current = true;
      }}
    />
  ) : null;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        {recaptchaScript}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5"
          >
            <Check className="w-9 h-9 text-emerald-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Thank you!</h2>
          <p className="text-muted-foreground text-sm">
            Your response has been submitted successfully.
          </p>
          <Button
            variant="outline"
            radius="sm"
            className="mt-6"
            onClick={() => {
              setSubmitted(false);
              setValues(emptyValues(form.fields));
            }}
          >
            Submit another response
          </Button>
        </motion.div>
      </div>
    );
  }

  // Renders a single field's content (no col-span wrapper). Recurses through
  // accordion sections via AccordionView.
  const renderFieldContent = (field: FormField, i: number): ReactNode => {
    if (field.type === "separator")
      return (
        <div className="py-1">
          <FormSeparator
            label={field.label}
            lineColor={field.lineColor}
            textColor={field.textColor}
          />
        </div>
      );
    if (field.type === "spacer")
      return <div style={{ height: field.spacerHeight ?? 24 }} aria-hidden />;
    if (field.type === "card_preview")
      return <CardVisual cardholder={field.label || undefined} />;
    if (field.type === "image") return <FormImage field={field} />;
    if (field.type === "button")
      return <SubmitButtonView config={field.button} block />;
    if (field.type === "long_text")
      return (
        <div className="space-y-1.5">
          {field.label && (
            <p className="text-sm font-semibold text-foreground">{field.label}</p>
          )}
          {htmlHasContent(field.content) && (
            <div
              className="tiptap text-sm text-foreground"
              dangerouslySetInnerHTML={{ __html: field.content! }}
            />
          )}
          {htmlHasContent(field.placeholder) && (
            <div
              className="tiptap text-xs text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: field.placeholder! }}
            />
          )}
        </div>
      );
    if (field.type === "accordion")
      return (
        <AccordionView
          sections={field.sections ?? []}
          renderField={renderFieldContent}
          style={field.accordionStyle}
          triggerWeight={field.triggerWeight}
          labelWeight={field.labelWeight}
        />
      );
    if (field.type === "tabs")
      return (
        <TabsView
          sections={field.sections ?? []}
          renderField={renderFieldContent}
          triggerWeight={field.triggerWeight}
          labelWeight={field.labelWeight}
        />
      );
    const hideLabel = field.choiceStyle === "terms";
    return (
      <>
        {!hideLabel && (
          <label className="block text-sm font-semibold text-foreground">
            {field.label || `Question ${i + 1}`}
            {field.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
        <FieldInput
          field={field}
          value={values[field.id] ?? (MULTI_VALUE_TYPES.has(field.type) ? [] : "")}
          onChange={(v) => setField(field.id, v)}
          error={errors.has(field.id)}
          disabled={submitting}
        />
        {errors.has(field.id) && (
          <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
            <AlertCircle size={12} />
            This field is required
          </p>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {recaptchaScript}
      <div className={cn("form-fonts mx-auto", appearance.containerClass)} style={appearance.containerStyle}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground" style={appearance.headerFontStyle}>
            {form.name || "Untitled form"}
          </h1>
          {form.description && (
            <p className="mt-1.5 text-sm text-muted-foreground">{form.description}</p>
          )}
        </motion.div>

        {/* Fields */}
        {form.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">
            This form has no fields yet.
          </p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-5 gap-y-6">
            <AnimatePresence>
              {form.fields.map((field, i) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 + i * 0.04, duration: 0.25 }}
                  className={cn("space-y-1.5", fieldColSpan(field.width))}
                >
                  {renderFieldContent(field, i)}
                </motion.div>
              ))}
            </AnimatePresence>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-sm text-rose-600">
                <AlertCircle size={14} className="shrink-0" />
                {submitError}
              </div>
            )}

            {/* Submit button */}
            {!form.submitButton?.hidden && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.04 + form.fields.length * 0.04 }}
              >
                <SubmitButtonView
                  config={form.submitButton}
                  loading={submitting}
                  loadingLabel="Submitting…"
                  onClick={handleSubmit}
                  block
                />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
