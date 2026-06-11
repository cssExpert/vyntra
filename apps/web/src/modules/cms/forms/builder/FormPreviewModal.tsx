"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Upload, Check, Send } from "lucide-react";

import type { CmsForm, FormField } from "../forms.types";

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all";

function RatingInput() {
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setValue(n)}
          className="p-0.5"
        >
          <Star
            size={24}
            className={`transition-colors ${
              n <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}

function PreviewField({ field }: { field: FormField }) {
  switch (field.type) {
    case "long_text":
      return (
        <textarea
          rows={3}
          placeholder={field.placeholder || "Your answer"}
          className={`${inputCls} resize-none`}
        />
      );
    case "multiple_choice":
    case "checkboxes":
      return (
        <div className="space-y-2">
          {field.options.map((opt, i) => (
            <label
              key={i}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-colors"
            >
              <input
                type={field.type === "checkboxes" ? "checkbox" : "radio"}
                name={field.id}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-foreground">{opt}</span>
            </label>
          ))}
        </div>
      );
    case "dropdown":
      return (
        <select className={`${inputCls} cursor-pointer`} defaultValue="">
          <option value="" disabled>
            Select an option…
          </option>
          {field.options.map((opt, i) => (
            <option key={i}>{opt}</option>
          ))}
        </select>
      );
    case "rating":
      return <RatingInput />;
    case "file":
      return (
        <div className="border-2 border-dashed border-border rounded-lg px-4 py-6 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer">
          <Upload className="w-5 h-5 text-muted-foreground/50 mx-auto mb-1.5" />
          <p className="text-xs text-muted-foreground">
            Click or drag a file to upload
          </p>
        </div>
      );
    case "email":
      return (
        <input
          type="email"
          placeholder={field.placeholder || "name@example.com"}
          className={inputCls}
        />
      );
    case "number":
      return (
        <input
          type="number"
          placeholder={field.placeholder || "0"}
          className={inputCls}
        />
      );
    case "date":
      return <input type="date" className={inputCls} />;
    default:
      return (
        <input
          type="text"
          placeholder={field.placeholder || "Your answer"}
          className={inputCls}
        />
      );
  }
}

interface FormPreviewModalProps {
  form: CmsForm | null;
  onClose: () => void;
}

export function FormPreviewModal({ form, onClose }: FormPreviewModalProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = useTranslations("cms.forms");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmitted(false);
  }, [form?.id]);

  return (
    <AnimatePresence>
      {form && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl overflow-hidden my-auto"
          >
            {/* Gradient header */}
            <div className="h-2.5 bg-gradient-brand" />
            <button
              onClick={onClose}
              className="absolute top-5 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close preview"
            >
              <X size={16} />
            </button>

            {submitted ? (
              <div className="px-8 py-16 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <p className="text-lg font-bold text-foreground">
                  Response submitted
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This is a preview — nothing was actually saved.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Fill again
                </button>
              </div>
            ) : (
              <div className="px-6 sm:px-8 py-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-foreground">
                    {form.name || "Untitled form"}
                  </h2>
                  {form.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.description}
                    </p>
                  )}
                </div>

                <div className="space-y-5">
                  {form.fields.map((field, i) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.25 }}
                    >
                      <label className="block text-sm font-semibold text-foreground mb-1.5">
                        {field.label || `Question ${i + 1}`}
                        {field.required && (
                          <span className="text-rose-500 ml-0.5">*</span>
                        )}
                      </label>
                      {field.helpText && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {field.helpText}
                        </p>
                      )}
                      <PreviewField field={field} />
                    </motion.div>
                  ))}

                  {form.fields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      This form has no fields yet.
                    </p>
                  )}
                </div>

                {form.fields.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + form.fields.length * 0.05 }}
                    onClick={() => setSubmitted(true)}
                    className="mt-7 inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all active:scale-[0.98]"
                  >
                    <Send size={14} />
                    Submit
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
