"use client";

import { useState } from "react";
import {
  Reorder,
  useDragControls,
  motion,
  AnimatePresence,
} from "framer-motion";
import { GripVertical, Plus, X, Copy, Trash2, Eye } from "lucide-react";

import {
  FIELD_TYPES,
  FIELD_CATEGORY_ORDER,
  TREE_RAIL_CLASS,
  getFieldMeta,
  renderFieldIcon,
  createField,
  createSection,
} from "./field-config";
import { FilterSelect } from "@/components/common/FilterSelect";
import {
  isChoiceField,
  isContainerField,
  type FieldType,
  type FieldMask,
  type FieldSection,
  type FieldWidth,
  type FormField,
} from "../forms.types";
import { supportsMask } from "../mask";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormRichTextEditor } from "./FormRichTextEditor";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { SegmentedControl } from "./controls";
import { IconPicker } from "./IconPicker";
import { supportsFieldIcon } from "../field-icons";
import { ImageFieldEditor } from "./ImageFieldEditor";
import { ButtonFieldEditor } from "./ButtonFieldEditor";
import { FormSeparator } from "../FormSeparator";
import { CardVisual } from "../CardVisual";

interface FieldCardProps {
  field: FormField;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  onChange: (patch: Partial<FormField>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  /** True when rendered inside a container (accordion) — hides nesting types. */
  nested?: boolean;
  /** 1-based grid row this field lands on, whether it shares that row, and
   *  whether it's the first/last field of its row-group. */
  rowIndex?: number;
  rowShared?: boolean;
  rowStart?: boolean;
  rowEnd?: boolean;
}

/** Subtle badge tints cycled per row so fields sharing a row match colours. */
const ROW_TINTS = [
  "bg-violet-500/15 text-violet-600",
  "bg-emerald-500/15 text-emerald-600",
  "bg-sky-500/15 text-sky-600",
  "bg-amber-500/15 text-amber-700",
  "bg-rose-500/15 text-rose-600",
  "bg-teal-500/15 text-teal-600",
];

/** Connector-line colours — soft at rest, brightening when the card is hovered
 *  (via group-hover) so the whole group's connector responds to interaction. */
const ROW_LINE_COLORS = [
  "bg-violet-200 group-hover/card:bg-violet-400",
  "bg-emerald-200 group-hover/card:bg-emerald-400",
  "bg-sky-200 group-hover/card:bg-sky-400",
  "bg-amber-200 group-hover/card:bg-amber-400",
  "bg-rose-200 group-hover/card:bg-rose-400",
  "bg-teal-200 group-hover/card:bg-teal-400",
];

/** Full colored border when a grouped card is selected/active. */
const ROW_BORDER_ACTIVE = [
  "border-violet-500/60",
  "border-emerald-500/60",
  "border-sky-500/60",
  "border-amber-500/60",
  "border-rose-500/60",
  "border-teal-500/60",
];

/** Subtle colored glow + light border on hover (calm default, colour on
 *  interaction). Combines the base elevation with a soft coloured shadow. */
const ROW_HOVER = [
  "hover:border-violet-500/40 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_10px_rgba(139,92,246,0.28)]",
  "hover:border-emerald-500/40 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_10px_rgba(16,185,129,0.28)]",
  "hover:border-sky-500/40 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_10px_rgba(14,165,233,0.28)]",
  "hover:border-amber-500/40 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_10px_rgba(245,158,11,0.28)]",
  "hover:border-rose-500/40 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_10px_rgba(244,63,94,0.28)]",
  "hover:border-teal-500/40 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04),0_0_10px_rgba(20,184,166,0.28)]",
];

/** Input types whose control has no free-text placeholder to author. */
const NO_PLACEHOLDER_TYPES: FieldType[] = [
  "rating",
  "file",
  "toggle",
  "slider",
  "nps",
  "emoji",
  "date",
  "time",
  "datetime",
  "month",
];

const CHOICE_STYLE_OPTIONS = [
  { value: "list" as const, label: "List" },
  { value: "cards" as const, label: "Cards" },
  { value: "pills" as const, label: "Pills" },
  { value: "segmented" as const, label: "Segmented" },
  { value: "terms" as const, label: "Terms" },
];

const WIDTH_OPTIONS: { value: FieldWidth; label: string }[] = [
  { value: "full", label: "Full" },
  { value: "half", label: "½" },
  { value: "twoThirds", label: "⅔" },
  { value: "third", label: "⅓" },
];

/** Compact badge glyph for a non-full width. */
const WIDTH_BADGE: Record<Exclude<FieldWidth, "full">, string> = {
  half: "½",
  twoThirds: "⅔",
  third: "⅓",
};

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
  nested = false,
  rowIndex,
  rowShared,
  rowStart,
  rowEnd,
}: FieldCardProps) {
  const dragControls = useDragControls();
  const meta = getFieldMeta(field.type);
  // Active nested child (for accordion sections).
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  // Nested fields can't themselves be containers (one level of nesting).
  const typeOptions = nested
    ? FIELD_TYPES.filter((t) => !isContainerField(t.type))
    : FIELD_TYPES;

  // Grouped by category for the searchable type picker.
  const typeGroups = FIELD_CATEGORY_ORDER.map((cat) => ({
    label: cat,
    options: typeOptions
      .filter((t) => t.category === cat)
      .map((t) => ({ value: t.type, label: t.label })),
  })).filter((g) => g.options.length > 0);

  const changeType = (type: FieldType) =>
    onChange({
      type,
      options: isChoiceField(type)
        ? field.options.length
          ? field.options
          : ["Option 1", "Option 2"]
        : [],
    });

  const typeSelect = (
    <div
      className="w-44 shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <FilterSelect
        value={field.type}
        options={typeGroups}
        isSearchable
        placeholder="Field type"
        onChange={(v) => v && changeType(v as FieldType)}
      />
    </div>
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

  // Per-row colour index for shared rows (connector + matching card border).
  const rowColorIdx =
    rowShared && rowIndex ? (rowIndex - 1) % ROW_LINE_COLORS.length : -1;
  const rowColor = rowColorIdx >= 0 ? ROW_LINE_COLORS[rowColorIdx] : null;

  // Shared card shell. No overflow-hidden so the connector isn't clipped (the
  // expand animation has its own inner overflow clip). Grouping colour appears
  // on interaction only — neutral at rest, a soft coloured glow on hover, and a
  // full coloured border when selected — so the canvas stays calm.
  const cardClass = cn(
    "group/card relative bg-card border rounded-xl transition-[border-color,box-shadow] duration-200",
    rowColorIdx >= 0
      ? isActive
        ? cn(ROW_BORDER_ACTIVE[rowColorIdx], "shadow-[0_4px_20px_rgba(0,0,0,0.08)]")
        : cn(
            "border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
            ROW_HOVER[rowColorIdx],
          )
      : isActive
        ? "border-primary/40 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
        : "border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-primary/20",
  );

  // Field-type icon chip — neutral (light bg + gray border) at rest, brand-
  // tinted only when the field is selected, so it doesn't out-shout the content.
  const iconChipClass = cn(
    "inline-flex items-center justify-center w-9 h-9 rounded-md border shrink-0 transition-colors",
    isActive ? "bg-primary/10 border-primary/20" : "bg-background border-border",
  );
  const iconInnerClass = cn(
    "w-5 h-5",
    isActive ? "text-primary" : "text-muted-foreground",
  );

  // Colored connector bracket (real spans, not pseudo) linking fields that
  // share a grid row. Rendered as the first child of every card.
  const connector = rowColor ? (
    <span aria-hidden className="pointer-events-none">
      <span
        className={cn("absolute top-8 -left-4 h-px w-4 transition-colors", rowColor)}
      />
      <span
        className={cn(
          "absolute -left-4 w-px transition-colors",
          rowColor,
          rowStart
            ? "top-8 -bottom-3"
            : rowEnd
              ? "-top-3 h-[2.75rem]"
              : "-top-3 -bottom-3",
        )}
      />
    </span>
  ) : null;

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
        className={cardClass}
      >
        {connector}
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
              <span className={iconChipClass}>
                {renderFieldIcon(meta.icon, iconInnerClass)}
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
        className={cardClass}
      >
        {connector}
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
              <span className={iconChipClass}>
                {renderFieldIcon(meta.icon, iconInnerClass)}
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

  // Spacer is a display-only vertical gap with an adjustable height.
  if (field.type === "spacer") {
    const height = field.spacerHeight ?? 24;
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
        className={cardClass}
      >
        {connector}
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
              <span className={iconChipClass}>
                {renderFieldIcon(meta.icon, iconInnerClass)}
              </span>
              <span className="flex-1 min-w-[120px] text-sm font-medium text-muted-foreground">
                Spacer
              </span>
              {typeSelect}
              {rowActions}
            </div>

            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs font-medium text-muted-foreground">Height</span>
              <Input
                type="number"
                min={0}
                value={height}
                onChange={(e) =>
                  onChange({ spacerHeight: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-20 bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>

            <div
              className="rounded-md border border-dashed border-border bg-muted/30"
              style={{ height }}
            />
          </div>
        </div>
      </Reorder.Item>
    );
  }

  // Card preview is a decorative credit-card graphic for checkout forms.
  if (field.type === "card_preview") {
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
        className={cardClass}
      >
        {connector}
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
              <span className={iconChipClass}>
                {renderFieldIcon(meta.icon, iconInnerClass)}
              </span>
              <Input
                value={field.label}
                onChange={(e) => onChange({ label: e.target.value })}
                placeholder="Cardholder name (optional)"
                className="flex-1 min-w-[160px] bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
              {typeSelect}
              {rowActions}
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <CardVisual cardholder={field.label || undefined} />
            </div>
          </div>
        </div>
      </Reorder.Item>
    );
  }

  // Accordion / Tabs are containers: titled sections, each holding nested fields.
  if (isContainerField(field.type)) {
    const isTabs = field.type === "tabs";
    const sectionWord = isTabs ? "Tab" : "Section";
    const sections = field.sections ?? [];
    const setSections = (next: FieldSection[]) => onChange({ sections: next });
    const patchSection = (sid: string, patch: Partial<FieldSection>) =>
      setSections(sections.map((s) => (s.id === sid ? { ...s, ...patch } : s)));
    const withChildren = (sid: string, fn: (fields: FormField[]) => FormField[]) => {
      const sec = sections.find((s) => s.id === sid);
      if (sec) patchSection(sid, { fields: fn(sec.fields) });
    };

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
        className={cardClass}
      >
        {connector}
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
              <span className={iconChipClass}>
                {renderFieldIcon(meta.icon, iconInnerClass)}
              </span>
              <span className="flex-1 min-w-[120px] text-sm font-medium text-muted-foreground">
                {isTabs ? "Tabs" : "Accordion"}
              </span>
              {typeSelect}
              {rowActions}
            </div>

            <div
              className="flex items-center gap-4 flex-wrap"
              onClick={(e) => e.stopPropagation()}
            >
              {!isTabs && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Style
                  </span>
                  <SegmentedControl
                    size="sm"
                    value={field.accordionStyle ?? "boxed"}
                    onChange={(v) => onChange({ accordionStyle: v })}
                    options={[
                      { value: "boxed", label: "Boxed" },
                      { value: "flush", label: "Flush (FAQ)" },
                    ]}
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Trigger
                </span>
                <SegmentedControl
                  size="sm"
                  value={
                    field.triggerWeight ??
                    (!isTabs && field.accordionStyle === "flush" ? "normal" : "bold")
                  }
                  onChange={(v) => onChange({ triggerWeight: v })}
                  options={[
                    { value: "bold", label: "Bold" },
                    { value: "normal", label: "Normal" },
                  ]}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Labels
                </span>
                <SegmentedControl
                  size="sm"
                  value={field.labelWeight ?? "bold"}
                  onChange={(v) => onChange({ labelWeight: v })}
                  options={[
                    { value: "bold", label: "Bold" },
                    { value: "normal", label: "Normal" },
                  ]}
                />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-lg border border-border bg-muted/20 p-3 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      value={section.title}
                      onChange={(e) => patchSection(section.id, { title: e.target.value })}
                      placeholder={`${sectionWord} title`}
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                    />
                    {sections.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setSections(sections.filter((s) => s.id !== section.id))
                        }
                        className="h-auto w-auto p-1.5 text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-500/10"
                        title="Remove section"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>

                  {section.fields.length > 0 && (
                    <Reorder.Group
                      axis="y"
                      values={section.fields}
                      onReorder={(fields) => patchSection(section.id, { fields })}
                      className={cn("space-y-2", TREE_RAIL_CLASS)}
                    >
                      <AnimatePresence initial={false}>
                        {section.fields.map((child, ci) => (
                          <FieldCard
                            key={child.id}
                            nested
                            field={child}
                            index={ci}
                            isActive={activeChildId === child.id}
                            onActivate={() => setActiveChildId(child.id)}
                            onChange={(patch) =>
                              withChildren(section.id, (fields) =>
                                fields.map((c) =>
                                  c.id === child.id ? { ...c, ...patch } : c,
                                ),
                              )
                            }
                            onDuplicate={() =>
                              withChildren(section.id, (fields) => {
                                const src = fields.find((c) => c.id === child.id);
                                if (!src) return fields;
                                const copy: FormField = {
                                  ...createField(src.type),
                                  ...src,
                                  id: `fld_${Date.now()}_copy`,
                                };
                                const idx = fields.findIndex((c) => c.id === child.id);
                                const next = [...fields];
                                next.splice(idx + 1, 0, copy);
                                return next;
                              })
                            }
                            onDelete={() =>
                              withChildren(section.id, (fields) =>
                                fields.filter((c) => c.id !== child.id),
                              )
                            }
                          />
                        ))}
                      </AnimatePresence>
                    </Reorder.Group>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      withChildren(section.id, (fields) => [
                        ...fields,
                        createField("short_text"),
                      ])
                    }
                    className="h-auto p-0 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-transparent"
                  >
                    <Plus size={14} className="stroke-[3] h-3.5 w-3.5" />
                    Add field
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                radius="sm"
                onClick={() =>
                  setSections([
                    ...sections,
                    createSection(`${sectionWord} ${sections.length + 1}`),
                  ])
                }
                className="w-full border-dashed text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/40"
                startIcon={<Plus size={14} className="stroke-[3]" />}
              >
                Add {sectionWord.toLowerCase()}
              </Button>
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
        className={cardClass}
      >
        {connector}
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
              <span className={iconChipClass}>
                {renderFieldIcon(meta.icon, iconInnerClass)}
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

  const setOptionDetail = (i: number, value: string) => {
    const details = [...(field.optionDetails ?? [])];
    details[i] = value;
    onChange({ optionDetails: details });
  };

  const choiceStyle = field.choiceStyle ?? "list";

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
      className={cardClass}
    >
      {connector}
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
            <span className={iconChipClass}>
              {renderFieldIcon(meta.icon, iconInnerClass)}
            </span>
            <Input
              value={field.label}
              onChange={(e) => onChange({ label: e.target.value })}
              placeholder={`Question ${index + 1}`}
              className="flex-1 min-w-[160px] bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
            />
            {field.width && field.width !== "full" && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[22px] h-5 px-1 rounded text-[11px] font-semibold",
                  rowShared && rowIndex
                    ? ROW_TINTS[(rowIndex - 1) % ROW_TINTS.length]
                    : "bg-primary/10 text-primary",
                )}
                title={
                  rowShared && rowIndex
                    ? `Row ${rowIndex} — shares this row with adjacent field(s)`
                    : `${field.width} width`
                }
              >
                {WIDTH_BADGE[field.width]}
              </span>
            )}
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
                    {/* Choice style: list / cards / pills / segmented */}
                    {(field.type === "multiple_choice" ||
                      field.type === "checkboxes") && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Style
                        </span>
                        <SegmentedControl
                          size="sm"
                          value={choiceStyle}
                          onChange={(v) => onChange({ choiceStyle: v })}
                          options={CHOICE_STYLE_OPTIONS}
                        />
                      </div>
                    )}
                    {choiceStyle === "terms" && (
                      <p className="text-xs text-muted-foreground">
                        Consent style — the question label is hidden. Add links in
                        the option text with{" "}
                        <code className="rounded bg-muted px-1 text-[11px]">
                          [label](https://…)
                        </code>
                        .
                      </p>
                    )}
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
                          {choiceStyle === "cards" && (
                            <input
                              value={field.optionDetails?.[i] ?? ""}
                              onChange={(e) => setOptionDetail(i, e.target.value)}
                              placeholder="Detail (e.g. $150)"
                              className="w-28 bg-transparent text-xs text-muted-foreground outline-none border-b border-border focus:border-primary/40 py-1 transition-colors"
                            />
                          )}
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

                    {/* Option layout: stacked vs inline (list style only) */}
                    {(field.type === "multiple_choice" ||
                      field.type === "checkboxes") &&
                      choiceStyle === "list" && (
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

                    {/* Custom free-text value (single-select only) */}
                    {field.type === "multiple_choice" && (
                      <div className="pt-2 space-y-2 border-t border-border/60">
                        <div className="pt-1">
                          <RequiredToggle
                            label="Allow custom value"
                            checked={!!field.allowCustom}
                            onChange={(v) => onChange({ allowCustom: v })}
                          />
                        </div>
                        {field.allowCustom && (
                          <div className="space-y-2 pl-1">
                            <input
                              value={field.customOption ?? "Custom"}
                              onChange={(e) => onChange({ customOption: e.target.value })}
                              placeholder="Trigger option (must match an option, e.g. Custom)"
                              className="w-full bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                            />
                            <input
                              value={field.customLabel ?? ""}
                              onChange={(e) => onChange({ customLabel: e.target.value })}
                              placeholder="Custom field label (e.g. Custom Amount ($))"
                              className="w-full bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                            />
                            <input
                              value={field.customPlaceholder ?? ""}
                              onChange={(e) => onChange({ customPlaceholder: e.target.value })}
                              placeholder="Custom input placeholder (e.g. Enter an amount)"
                              className="w-full bg-muted/40 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                            />
                          </div>
                        )}
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
                  !NO_PLACEHOLDER_TYPES.includes(field.type) && (
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

                {/* Slider range configuration */}
                {field.type === "slider" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {(
                      [
                        ["Min", "min", 0],
                        ["Max", "max", 100],
                        ["Step", "step", 1],
                      ] as const
                    ).map(([label, key, fallback]) => (
                      <label key={key} className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          {label}
                        </span>
                        <Input
                          type="number"
                          value={field[key] ?? fallback}
                          onChange={(e) =>
                            onChange({
                              [key]: Number(e.target.value) || 0,
                            } as Partial<FormField>)
                          }
                          className="w-20 bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                        />
                      </label>
                    ))}
                  </div>
                )}

                <input
                  value={field.helpText ?? ""}
                  onChange={(e) => onChange({ helpText: e.target.value })}
                  placeholder="Help text (optional)"
                  className="w-full bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/40 outline-none border-b border-transparent focus:border-primary/30 py-1 transition-colors"
                />

                {/* Footer actions */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-4 flex-wrap">
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
                    {supportsFieldIcon(field.type) && (
                      <IconPicker
                        value={field.icon}
                        onChange={(icon) => onChange({ icon })}
                      />
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        Width
                      </span>
                      <SegmentedControl
                        size="sm"
                        value={field.width ?? "full"}
                        onChange={(width) => onChange({ width })}
                        options={WIDTH_OPTIONS}
                      />
                    </div>
                    {supportsMask(field.type) && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                          Mask
                        </span>
                        <select
                          value={field.mask ?? "none"}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            onChange({ mask: e.target.value as FieldMask })
                          }
                          className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 cursor-pointer"
                        >
                          <option value="none">None</option>
                          <option value="card">Card</option>
                          <option value="expiry">Expiry</option>
                          <option value="cvc">CVC</option>
                          <option value="phone">Phone</option>
                        </select>
                      </div>
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
