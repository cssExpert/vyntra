"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Star, Upload, Check, Send } from "lucide-react";

import { Modal } from "@/components/common/Modal";
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
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSubmitted(false);
  }, [form?.id]);

  return (
    <Modal
      isOpen={!!form}
      onClose={onClose}
      title={form?.name?.trim() || "Untitled form"}
      description={
        form?.description || "Form preview — responses are not saved."
      }
      icon={<Eye size={18} />}
      maxWidth="xl"
      footer={
        submitted ? (
          <>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm text-sm font-semibold transition-all"
            >
              Fill again
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm text-sm font-semibold transition-all active:scale-95"
            >
              Close
            </button>
          </>
        ) : form && form.fields.length > 0 ? (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm text-sm font-semibold transition-all active:scale-95"
          >
            <Send size={14} />
            Submit
          </button>
        ) : undefined
      }
    >
      {form &&
        (submitted ? (
          <div className="px-8 py-12 text-center">
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
          </div>
        ) : (
          <div className="p-6 space-y-5">
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
        ))}
    </Modal>
  );
}
