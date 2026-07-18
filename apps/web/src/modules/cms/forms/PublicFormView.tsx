"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Upload, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  htmlHasContent,
  isLayoutField,
  resolveFormAppearance,
  type FormField,
  type FormSettings,
  type SubmitButtonConfig,
} from "./forms.types";
import { FormSeparator } from "./FormSeparator";
import { SubmitButtonView } from "./SubmitButtonView";
import { PasswordInput } from "./PasswordInput";
import { FormImage } from "./FormImage";
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

  switch (field.type) {
    case "long_text":
      return (
        <textarea
          rows={4}
          placeholder={field.placeholder || "Your answer"}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} ${borderCls} resize-none`}
        />
      );

    case "multiple_choice":
      return (
        <div
          className={
            field.optionsLayout === "inline"
              ? "flex flex-wrap gap-2"
              : "space-y-2"
          }
        >
          {field.options.map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                value === opt
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-primary/5"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name={field.id}
                checked={value === opt}
                onChange={() => onChange(opt)}
                disabled={disabled}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-foreground">{opt}</span>
            </label>
          ))}
        </div>
      );

    case "checkboxes": {
      const checked = Array.isArray(value) ? value : [];
      const toggle = (opt: string) => {
        const next = checked.includes(opt)
          ? checked.filter((v) => v !== opt)
          : [...checked, opt];
        onChange(next);
      };
      return (
        <div
          className={
            field.optionsLayout === "inline"
              ? "flex flex-wrap gap-2"
              : "space-y-2"
          }
        >
          {field.options.map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                checked.includes(opt)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-primary/5"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                checked={checked.includes(opt)}
                onChange={() => toggle(opt)}
                disabled={disabled}
                className="w-4 h-4 accent-primary rounded"
              />
              <span className="text-sm text-foreground">{opt}</span>
            </label>
          ))}
        </div>
      );
    }

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
        <input
          type="email"
          placeholder={field.placeholder || "name@example.com"}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} ${borderCls}`}
        />
      );

    case "password":
      return (
        <PasswordInput
          value={value as string}
          onChange={(v) => onChange(v)}
          placeholder={field.placeholder || "Enter your password"}
          disabled={disabled}
          showToggle={field.passwordToggle !== false}
          className={`${inputCls} ${borderCls}`}
        />
      );

    case "number":
      return (
        <input
          type="number"
          placeholder={field.placeholder || "0"}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} ${borderCls}`}
        />
      );

    case "date":
      return (
        <input
          type="date"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} ${borderCls}`}
        />
      );

    default:
      return (
        <input
          type="text"
          placeholder={field.placeholder || "Your answer"}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputCls} ${borderCls}`}
        />
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

function emptyValues(fields: FormField[]): FieldValues {
  return Object.fromEntries(
    fields
      .filter((f) => !isLayoutField(f.type))
      .map((f) => [f.id, f.type === "checkboxes" ? [] : ""]),
  );
}

function validate(fields: FormField[], values: FieldValues): Set<string> {
  const errors = new Set<string>();
  for (const f of fields) {
    if (isLayoutField(f.type) || !f.required) continue;
    const v = values[f.id];
    if (f.type === "checkboxes") {
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
            <AnimatePresence>
              {form.fields.map((field, i) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 + i * 0.04, duration: 0.25 }}
                  className="space-y-1.5"
                >
                  {field.type === "separator" ? (
                    <div className="py-1">
                      <FormSeparator
                        label={field.label}
                        lineColor={field.lineColor}
                        textColor={field.textColor}
                      />
                    </div>
                  ) : field.type === "image" ? (
                    <FormImage field={field} />
                  ) : field.type === "button" ? (
                    <SubmitButtonView config={field.button} block />
                  ) : field.type === "long_text" ? (
                    <div className="space-y-1.5">
                      {field.label && (
                        <p className="text-sm font-semibold text-foreground">
                          {field.label}
                        </p>
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
                  ) : (
                    <>
                      <label className="block text-sm font-semibold text-foreground">
                        {field.label || `Question ${i + 1}`}
                        {field.required && (
                          <span className="text-rose-500 ml-0.5">*</span>
                        )}
                      </label>
                      {field.helpText && (
                        <p className="text-xs text-muted-foreground">{field.helpText}</p>
                      )}
                      <FieldInput
                        field={field}
                        value={values[field.id] ?? (field.type === "checkboxes" ? [] : "")}
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
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

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
