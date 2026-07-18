"use client";

import {
  Reorder,
  useDragControls,
  motion,
  AnimatePresence,
} from "framer-motion";
import { GripVertical, Plus, X, Copy, Trash2, Eye } from "lucide-react";

import { FIELD_TYPES, getFieldMeta, renderFieldIcon } from "./field-config";
import { isChoiceField, type FieldType, type FormField } from "../forms.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormRichTextEditor } from "./FormRichTextEditor";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { SegmentedControl } from "./controls";
import { ImageFieldEditor } from "./ImageFieldEditor";
import { ButtonFieldEditor } from "./ButtonFieldEditor";
import { FormSeparator } from "../FormSeparator";

interface FieldCardProps {
  field: FormField;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  onChange: (patch: Partial<FormField>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function RequiredToggle({
  checked,
  onChange,
  label = "Required",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="flex items-center gap-2 h-auto p-0 select-none hover:bg-transparent"
    >
      <span
        className={`w-8 h-[18px] rounded-full p-[2px] flex transition-colors ${checked ? "bg-primary justify-end" : "bg-muted-foreground/25 justify-start"}`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 32 }}
          className="w-[14px] h-[14px] rounded-full bg-white shadow-sm"
        />
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
    </Button>
  );
}

export function FieldCard({
  field,
  index,
  isActive,
  onActivate,
  onChange,
  onDuplicate,
  onDelete,
}: FieldCardProps) {
  const dragControls = useDragControls();
  const meta = getFieldMeta(field.type);

  const typeSelect = (
    <select
      value={field.type}
      onChange={(e) => {
        const type = e.target.value as FieldType;
        onChange({
          type,
          options: isChoiceField(type)
            ? field.options.length
              ? field.options
              : ["Option 1", "Option 2"]
            : [],
        });
      }}
      onClick={(e) => e.stopPropagation()}
      className="px-2.5 py-1.5 h-9 bg-background border border-border rounded-md text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
    >
      {FIELD_TYPES.map((t) => (
        <option key={t.type} value={t.type}>
          {t.label}
        </option>
      ))}
    </select>
  );

  const rowActions = (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="p-2 h-auto w-auto text-muted-foreground hover:text-foreground"
        title="Duplicate field"
      >
        <Copy size={14} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-2 h-auto w-auto text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
        title="Delete field"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );

  // Paragraph is a display-only content block — the builder authors a formatted
  // main paragraph plus a smaller sub-text line (bold / italic / colours), both
  // shown read-only to respondents. It collects no answer.
  if (field.type === "long_text") {
    return (
      <Reorder.Item
        value={field}
        dragListener={false}
        dragControls={dragControls}
        layout="position"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={onActivate}
        className={`relative bg-card border rounded-xl overflow-hidden transition-shadow ${
          isActive
            ? "border-primary/40 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-primary/20"
        }`}
      >
        <div className="flex items-start gap-3 p-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onPointerDown={(e) => dragControls.start(e)}
            className="mt-1.5 h-auto w-auto p-0 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
            aria-label="Reorder field"
          >
            <GripVertical size={16} />
          </Button>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 shrink-0">
                {renderFieldIcon(meta.icon, "w-5 h-5 text-primary")}
              </span>
              <Input
                value={field.label}
                onChange={(e) => onChange({ label: e.target.value })}
                placeholder={`Heading ${index + 1} (optional)`}
                className="flex-1 min-w-[160px] bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
              {typeSelect}
              {rowActions}
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Main text
              </p>
              <FormRichTextEditor
                value={field.content ?? ""}
                onChange={(html) => onChange({ content: html })}
                withHeadings
              />
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Placeholder text (smaller sub-text)
              </p>
              <FormRichTextEditor
                value={field.placeholder ?? ""}
                onChange={(html) => onChange({ placeholder: html })}
              />
            </div>
          </div>
        </div>
      </Reorder.Item>
    );
  }

  // Separator is a display-only divider — an optional centered label with
  // configurable line and text colours.
  if (field.type === "separator") {
    return (
      <Reorder.Item
        value={field}
        dragListener={false}
        dragControls={dragControls}
        layout="position"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={onActivate}
        className={`relative bg-card border rounded-xl overflow-hidden transition-shadow ${
          isActive
            ? "border-primary/40 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-primary/20"
        }`}
      >
        <div className="flex items-start gap-3 p-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onPointerDown={(e) => dragControls.start(e)}
            className="mt-1.5 h-auto w-auto p-0 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
            aria-label="Reorder field"
          >
            <GripVertical size={16} />
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 shrink-0">
                {renderFieldIcon(meta.icon, "w-5 h-5 text-primary")}
              </span>
              <Input
                value={field.label}
                onChange={(e) => onChange({ label: e.target.value })}
                placeholder="Center label (optional)"
                className="flex-1 min-w-[160px] bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
              {typeSelect}
              {rowActions}
            </div>

            {/* Colour controls */}
            <div
              className="flex items-center gap-2 flex-wrap pt-3"
              onClick={(e) => e.stopPropagation()}
            >
              <ColorPickerPopover
                label="Line"
                value={field.lineColor}
                onChange={(hex) => onChange({ lineColor: hex })}
                onClear={() => onChange({ lineColor: undefined })}
              />
              {field.label.trim() && (
                <ColorPickerPopover
                  label="Text"
                  value={field.textColor}
                  onChange={(hex) => onChange({ textColor: hex })}
                  onClear={() => onChange({ textColor: undefined })}
                />
              )}
            </div>

            {/* Live preview */}
            <div className="pt-4">
              <FormSeparator
                label={field.label}
                lineColor={field.lineColor}
                textColor={field.textColor}
              />
            </div>
          </div>
        </div>
      </Reorder.Item>
    );
  }

  // Image and Button are display/action blocks — a compact header row plus a
  // dedicated editor, no question label / required toggle.
  if (field.type === "image" || field.type === "button") {
    return (
      <Reorder.Item
        value={field}
        dragListener={false}
        dragControls={dragControls}
        layout="position"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={onActivate}
        className={`relative bg-card border rounded-xl overflow-hidden transition-shadow ${
          isActive
            ? "border-primary/40 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            : "border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-primary/20"
        }`}
      >
        <div className="flex items-start gap-3 p-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onPointerDown={(e) => dragControls.start(e)}
            className="mt-1.5 h-auto w-auto p-0 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
            aria-label="Reorder field"
          >
            <GripVertical size={16} />
          </Button>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 shrink-0">
                {renderFieldIcon(meta.icon, "w-5 h-5 text-primary")}
              </span>
              <span className="flex-1 min-w-[120px] text-sm font-medium text-muted-foreground">
                {field.type === "image" ? "Image block" : "Button"}
              </span>
              {typeSelect}
              {rowActions}
            </div>

            {field.type === "image" ? (
              <ImageFieldEditor field={field} onChange={onChange} />
            ) : (
              <ButtonFieldEditor field={field} onChange={onChange} />
            )}
          </div>
        </div>
      </Reorder.Item>
    );
  }

  const setOption = (i: number, value: string) =>
    onChange({
      options: field.options.map((o, idx) => (idx === i ? value : o)),
    });

  return (
    <Reorder.Item
      value={field}
      dragListener={false}
      dragControls={dragControls}
      layout="position"
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onActivate}
      className={`relative bg-card border rounded-xl overflow-hidden transition-shadow ${
        isActive
          ? "border-primary/40 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
          : "border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-primary/20"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag handle */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onPointerDown={(e) => dragControls.start(e)}
          className="mt-1.5 h-auto w-auto p-0 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          aria-label="Reorder field"
        >
          <GripVertical size={16} />
        </Button>

        <div className="flex-1 min-w-0">
          {/* Top row: label + type select */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 shrink-0">
              {renderFieldIcon(meta.icon, "w-5 h-5 text-primary")}
            </span>
            <Input
              value={field.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder={`Question ${index + 1}`}
              className="flex-1 min-w-[160px] bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
            />
            {typeSelect}
          </div>

          {/* Expanded settings — always mounted; CSS grid-rows slide
              (0fr ↔ 1fr) is browser-driven and stays smooth where JS
              height animations stutter. `invisible` keeps the collapsed
              panel out of the tab order. */}
          <div
            className={`grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isActive
                ? "visible grid-rows-[1fr] opacity-100"
                : "invisible grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="pt-4 space-y-3">
                {isChoiceField(field.type) ? (
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {field.options.map((opt, i) => (
                        <motion.div
                          key={i}
                          layout
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          className="flex items-center gap-2"
                        >
                          <span
                            className={`w-3.5 h-3.5 border-2 border-muted-foreground/30 shrink-0 ${field.type === "checkboxes" ? "rounded-[3px]" : "rounded-full"}`}
                          />
                          <input
                            value={opt}
                            onChange={(e) => setOption(i, e.target.value)}
                            className="flex-1 bg-transparent text-sm text-foreground outline-none border-b border-border focus:border-primary/40 py-1 transition-colors"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              onChange({
                                options: field.options.filter(
                                  (_, idx) => idx !== i,
                                ),
                              })
                            }
                            disabled={field.options.length <= 1}
                            className="h-auto w-auto p-0 text-muted-foreground/50 hover:text-rose-500 hover:bg-transparent"
                          >
                            <X size={14} />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onChange({
                          options: [
                            ...field.options,
                            `Option ${field.options.length + 1}`,
                          ],
                        })
                      }
                      className="h-auto p-0 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-transparent"
                    >
                      <Plus
                        size={14}
                        className="stroke-[3] transition-transform group-hover:rotate-90 duration-300 h-3.5 w-3.5"
                      />
                      Add option
                    </Button>

                    {/* Option layout: stacked vs inline (radio/checkbox only) */}
                    {(field.type === "multiple_choice" ||
                      field.type === "checkboxes") && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          Layout
                        </span>
                        <SegmentedControl
                          size="sm"
                          value={field.optionsLayout ?? "stacked"}
                          onChange={(v) => onChange({ optionsLayout: v })}
                          options={[
                            { value: "stacked", label: "Stacked" },
                            { value: "inline", label: "Inline" },
                          ]}
                        />
                      </div>
                    )}
                  </div>
                ) : field.type === "password" ? (
                  <div className="relative">
                    <Input
                      value={field.placeholder ?? ""}
                      onChange={(e) =>
                        onChange({ placeholder: e.target.value })
                      }
                      placeholder="Placeholder text (optional)"
                      size="lg"
                      className={`w-full bg-muted/40 border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all ${
                        field.passwordToggle !== false ? "pr-10" : ""
                      }`}
                    />
                    {field.passwordToggle !== false && (
                      <Eye
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
                      />
                    )}
                  </div>
                ) : (
                  field.type !== "rating" &&
                  field.type !== "file" && (
                    <Input
                      value={field.placeholder ?? ""}
                      onChange={(e) =>
                        onChange({ placeholder: e.target.value })
                      }
                      placeholder="Placeholder text (optional)"
                      size="lg"
                      className="w-full bg-muted/40 border border-border rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    />
                  )
                )}

                <input
                  value={field.helpText ?? ""}
                  onChange={(e) => onChange({ helpText: e.target.value })}
                  placeholder="Help text (optional)"
                  className="w-full bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/40 outline-none border-b border-transparent focus:border-primary/30 py-1 transition-colors"
                />

                {/* Footer actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-5">
                    <RequiredToggle
                      checked={field.required}
                      onChange={(required) => onChange({ required })}
                    />
                    {field.type === "password" && (
                      <RequiredToggle
                        label="Eye toggle"
                        checked={field.passwordToggle !== false}
                        onChange={(v) => onChange({ passwordToggle: v })}
                      />
                    )}
                  </div>
                  {rowActions}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}
