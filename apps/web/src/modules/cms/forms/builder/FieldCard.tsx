"use client";

import {
  Reorder,
  useDragControls,
  motion,
  AnimatePresence,
} from "framer-motion";
import { GripVertical, Plus, X, Copy, Trash2 } from "lucide-react";

import { FIELD_TYPES, getFieldMeta, renderFieldIcon } from "./field-config";
import { isChoiceField, type FieldType, type FormField } from "../forms.types";

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
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 cursor-pointer select-none"
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
        Required
      </span>
    </button>
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
        <button
          type="button"
          onPointerDown={(e) => dragControls.start(e)}
          className="mt-1.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
          aria-label="Reorder field"
        >
          <GripVertical size={16} />
        </button>

        <div className="flex-1 min-w-0">
          {/* Top row: label + type select */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 shrink-0">
              {renderFieldIcon(meta.icon, "w-5 h-5 text-primary")}
            </span>
            <input
              value={field.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder={`Question ${index + 1}`}
              className="flex-1 min-w-[160px] h-9 bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
            />
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
                            <button
                              type="button"
                              onClick={() =>
                                onChange({
                                  options: field.options.filter(
                                    (_, idx) => idx !== i,
                                  ),
                                })
                              }
                              disabled={field.options.length <= 1}
                              className="text-muted-foreground/50 hover:text-rose-500 disabled:opacity-30 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            options: [
                              ...field.options,
                              `Option ${field.options.length + 1}`,
                            ],
                          })
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <Plus size={13} className="stroke-[3]" />
                        Add option
                      </button>
                    </div>
                  ) : (
                    field.type !== "rating" &&
                    field.type !== "file" && (
                      <input
                        value={field.placeholder ?? ""}
                        onChange={(e) =>
                          onChange({ placeholder: e.target.value })
                        }
                        placeholder="Placeholder text (optional)"
                        className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
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
                    <RequiredToggle
                      checked={field.required}
                      onChange={(required) => onChange({ required })}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate();
                        }}
                        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Duplicate field"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                        }}
                        className="p-2 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete field"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </Reorder.Item>
  );
}
