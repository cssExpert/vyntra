"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Star, Upload } from "lucide-react";

import {
  htmlHasContent,
  formFontStyle,
  fieldColSpan,
  type CmsForm,
  type FormField,
} from "./forms.types";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/common/DatePickerField";
import { FormSeparator } from "./FormSeparator";
import { SubmitButtonView } from "./SubmitButtonView";
import { FormImage } from "./FormImage";
import { CardVisual } from "./CardVisual";
import { PasswordInput } from "./PasswordInput";
import { ChoiceInput } from "./ChoiceInput";
import { MultiSelectInput, AutocompleteInput } from "./SelectInputs";
import { FormSlider } from "./FormSlider";
import { AccordionView } from "./AccordionView";
import { TabsView } from "./TabsView";
import { WithLeadingIcon, fieldIconPad, supportsFieldIcon } from "./field-icons";
import { applyMask, effectiveMask, maskInputMode } from "./mask";

/**
 * Shared input styling so every read-only preview matches the live form. A
 * fixed 42px height keeps text inputs, selects, password and date controls all
 * the same size — the explicit `h-[42px]` also overrides the `<Input>`
 * component's baked-in `h-9`. Textareas use {@link previewTextareaCls} instead.
 */
export const previewInputCls =
  "w-full h-[42px] rounded-lg border border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all";

/** Textarea variant — no fixed height (grows with `rows`). */
export const previewTextareaCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none";

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
  return (
    <DatePickerField value={value} onChange={setValue} inputClassName="h-[42px] py-0" />
  );
}

/** Local-state wrappers so the preview multi-select / autocomplete are interactive. */
function PreviewMultiSelect({ field }: { field: FormField }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <MultiSelectInput
      options={field.options}
      value={value}
      onChange={setValue}
      placeholder={field.placeholder}
    />
  );
}

function PreviewAutocomplete({ field }: { field: FormField }) {
  const [value, setValue] = useState("");
  return (
    <AutocompleteInput
      options={field.options}
      value={value}
      onChange={setValue}
      placeholder={field.placeholder}
    />
  );
}

/** Local-state wrapper so the preview slider is draggable. */
function PreviewSlider({ field }: { field: FormField }) {
  const [value, setValue] = useState("");
  return (
    <FormSlider
      value={value}
      onChange={setValue}
      min={field.min ?? 0}
      max={field.max ?? 100}
      step={field.step ?? 1}
    />
  );
}

/** Local-state wrapper so masked preview inputs (card / expiry / cvc / phone) format as you type. */
function PreviewMaskedInput({ field, type }: { field: FormField; type: string }) {
  const iconName = supportsFieldIcon(field.type) ? field.icon : undefined;
  const iconPad = fieldIconPad(iconName);
  const mask = effectiveMask(field.type, field.mask);
  const [value, setValue] = useState("");
  return (
    <WithLeadingIcon name={iconName}>
      <Input
        type={type}
        inputMode={maskInputMode(mask)}
        value={value}
        onChange={(e) => setValue(mask ? applyMask(mask, e.target.value) : e.target.value)}
        placeholder={field.placeholder}
        className={`${previewInputCls} ${iconPad}`}
      />
    </WithLeadingIcon>
  );
}

/** Local-state wrapper so preview choice widgets (radio/checkbox/nps/emoji) are interactive. */
function PreviewChoice({ field }: { field: FormField }) {
  const multi = field.type === "checkboxes";
  const [value, setValue] = useState<string | string[]>(multi ? [] : "");
  return <ChoiceInput field={field} value={value} onChange={setValue} />;
}

/** Local-state wrapper so the preview password field is interactive. */
function PreviewPassword({ field }: { field: FormField }) {
  const mask = effectiveMask(field.type, field.mask);
  const [value, setValue] = useState("");
  return (
    <PasswordInput
      value={value}
      onChange={(v) => setValue(mask ? applyMask(mask, v) : v)}
      placeholder={field.placeholder}
      showToggle={field.passwordToggle !== false}
      className={previewInputCls}
    />
  );
}

/** Renders the input control for a single field (no label/help text). */
export function PreviewField({ field }: { field: FormField }) {
  const iconName = supportsFieldIcon(field.type) ? field.icon : undefined;
  const iconPad = fieldIconPad(iconName);
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          rows={4}
          placeholder={field.placeholder}
          className={previewTextareaCls}
        />
      );
    case "phone":
      return <PreviewMaskedInput field={field} type="tel" />;
    case "toggle":
      return (
        <span className="relative inline-flex h-7 w-12 items-center rounded-full bg-muted-foreground/30">
          <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white shadow" />
        </span>
      );
    case "slider":
      return <PreviewSlider field={field} />;
    case "time":
      return <Input type="time" className={previewInputCls} />;
    case "datetime":
      return <Input type="datetime-local" className={previewInputCls} />;
    case "month":
      return <Input type="month" className={previewInputCls} />;
    case "year":
      return (
        <Input type="number" placeholder={field.placeholder} className={previewInputCls} />
      );
    case "multiple_choice":
    case "checkboxes":
    case "nps":
    case "emoji":
      return <PreviewChoice field={field} />;
    case "dropdown":
      return (
        <select className={`${previewInputCls} cursor-pointer`} defaultValue="">
          <option value="" disabled>
            Select an option…
          </option>
          {field.options.map((opt, i) => (
            <option key={i}>{opt}</option>
          ))}
        </select>
      );
    case "multiselect":
      return <PreviewMultiSelect field={field} />;
    case "autocomplete":
      return <PreviewAutocomplete field={field} />;
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
        <WithLeadingIcon name={iconName}>
          <Input
            type="email"
            placeholder={field.placeholder}
            className={`${previewInputCls} ${iconPad}`}
          />
        </WithLeadingIcon>
      );
    case "number":
      if (field.mask && field.mask !== "none")
        return <PreviewMaskedInput field={field} type="text" />;
      return (
        <WithLeadingIcon name={iconName}>
          <Input
            type="number"
            placeholder={field.placeholder}
            className={`${previewInputCls} ${iconPad}`}
          />
        </WithLeadingIcon>
      );
    case "date":
      return <PreviewDate />;
    case "password":
      return <PreviewPassword field={field} />;
    default:
      if (field.mask && field.mask !== "none")
        return <PreviewMaskedInput field={field} type="text" />;
      return (
        <WithLeadingIcon name={iconName}>
          <Input
            type="text"
            placeholder={field.placeholder}
            className={`${previewInputCls} ${iconPad}`}
          />
        </WithLeadingIcon>
      );
  }
}

/** Renders a single field's content (no col-span wrapper); recurses into
 *  accordion sections via AccordionView. */
function previewFieldBody(field: FormField, index: number): ReactNode {
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
        renderField={previewFieldBody}
        style={field.accordionStyle}
        triggerWeight={field.triggerWeight}
        labelWeight={field.labelWeight}
      />
    );
  if (field.type === "tabs")
    return (
      <TabsView
        sections={field.sections ?? []}
        renderField={previewFieldBody}
        triggerWeight={field.triggerWeight}
        labelWeight={field.labelWeight}
      />
    );
  const hideLabel = field.choiceStyle === "terms";
  return (
    <>
      {!hideLabel && (
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          {field.label || `Question ${index + 1}`}
          {field.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {field.helpText && (
        <p className="text-xs text-muted-foreground mb-2">{field.helpText}</p>
      )}
      <PreviewField field={field} />
    </>
  );
}

/** Renders one form field row — layout blocks (separator/image/button/text) and
 *  input fields with their label, help text and control. */
export function PreviewFieldRow({
  field,
  index,
  animate = true,
}: {
  field: FormField;
  index: number;
  animate?: boolean;
}) {
  const body = previewFieldBody(field, index);

  if (!animate) return <div className={fieldColSpan(field.width)}>{body}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.05, duration: 0.25 }}
      className={fieldColSpan(field.width)}
    >
      {body}
    </motion.div>
  );
}

interface FormFieldsPreviewProps {
  form: CmsForm;
  /** Render the form's submit button inline at the end of the preview. */
  showSubmit?: boolean;
  /** Disable the staggered field entrance animation. */
  animate?: boolean;
  className?: string;
}

/**
 * Read-only render of a form's title, fields and (optionally) submit button —
 * exactly as the published form looks. Shared by the builder preview modal and
 * the new-form blueprint picker so both stay pixel-identical to the live form.
 */
export function FormFieldsPreview({
  form,
  showSubmit = false,
  animate = true,
  className = "p-6 space-y-5 form-fonts",
}: FormFieldsPreviewProps) {
  return (
    <div className={className} style={formFontStyle(form.settings)}>
      {(form.name?.trim() || form.description) && (
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--form-heading-font)" }}
          >
            {form.name?.trim() || "Untitled form"}
          </h1>
          {form.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {form.description}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-5 gap-y-5">
        {form.fields.map((field, i) => (
          <PreviewFieldRow
            key={field.id}
            field={field}
            index={i}
            animate={animate}
          />
        ))}
      </div>

      {form.fields.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          This form has no fields yet.
        </p>
      )}

      {showSubmit &&
        form.fields.length > 0 &&
        !form.submitButton?.hidden && (
          <div className="pt-1">
            <SubmitButtonView config={form.submitButton} block />
          </div>
        )}
    </div>
  );
}
