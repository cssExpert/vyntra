"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Eye, Star, Upload, Check, Send } from "lucide-react";

import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { htmlHasContent, type CmsForm, type FormField } from "../forms.types";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/common/DatePickerField";
import { FormSeparator } from "../FormSeparator";

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

/** Local-state wrapper so the preview date picker is interactive. */
function PreviewDate() {
  const [value, setValue] = useState("");
  return <DatePickerField value={value} onChange={setValue} />;
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
        <div
          className={
            field.optionsLayout === "inline"
              ? "flex flex-wrap gap-2"
              : "space-y-2"
          }
        >
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
        <Input
          type="email"
          placeholder={field.placeholder || "name@example.com"}
          className={inputCls}
        />
      );
    case "number":
      return (
        <Input
          type="number"
          placeholder={field.placeholder || "0"}
          className={inputCls}
        />
      );
    case "date":
      return <PreviewDate />;
    default:
      return (
        <Input
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
            <Button
              variant="ghost"
              radius="sm"
              onClick={() => setSubmitted(false)}
              className="font-semibold text-muted-foreground hover:text-foreground"
            >
              Fill again
            </Button>
            <Button
              radius="sm"
              onClick={onClose}
              className="px-5 font-semibold active:scale-95"
            >
              Close
            </Button>
          </>
        ) : form && form.fields.length > 0 ? (
          <Button
            radius="sm"
            onClick={() => setSubmitted(true)}
            className="px-5 font-semibold active:scale-95"
            startIcon={<Send size={14} />}
          >
            Submit
          </Button>
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
                {field.type === "separator" ? (
                  <div className="py-1">
                    <FormSeparator
                      label={field.label}
                      lineColor={field.lineColor}
                      textColor={field.textColor}
                    />
                  </div>
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
                  </>
                )}
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
