"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ButtonFieldConfig, FormField } from "../forms.types";
import { SubmitButtonView, SUBMIT_ICON_OPTIONS } from "../SubmitButtonView";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { CONTROL_H, CONTROL_BASE, SegmentedControl, ALIGN_OPTIONS } from "./controls";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      {children}
    </div>
  );
}

export function ButtonFieldEditor({
  field,
  onChange,
}: {
  field: FormField;
  onChange: (patch: Partial<FormField>) => void;
}) {
  const cfg: ButtonFieldConfig = field.button ?? {};
  const patch = (p: Partial<ButtonFieldConfig>) =>
    onChange({ button: { ...cfg, ...p } });
  const icon = cfg.icon ?? "none";

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Label">
          <Input
            value={cfg.label ?? ""}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder="Button"
            className={cn(CONTROL_H, CONTROL_BASE, "w-40 px-3")}
          />
        </Field>

        <Field label="Link (optional)">
          <Input
            value={cfg.href ?? ""}
            onChange={(e) => patch({ href: e.target.value })}
            placeholder="https://…"
            className={cn(CONTROL_H, CONTROL_BASE, "w-52 px-3")}
          />
        </Field>

        <Field label="Style">
          <SegmentedControl
            value={cfg.style ?? "solid"}
            onChange={(v) => patch({ style: v })}
            options={[
              { value: "solid", label: "Solid" },
              { value: "outline", label: "Outline" },
              { value: "link", label: "Link" },
            ]}
          />
        </Field>

        <Field label="Icon">
          <select
            value={icon}
            onChange={(e) =>
              patch({ icon: e.target.value as ButtonFieldConfig["icon"] })
            }
            className={cn(CONTROL_H, CONTROL_BASE, "px-2.5 text-xs font-medium cursor-pointer")}
          >
            {SUBMIT_ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        {icon !== "none" && (
          <Field label="Icon position">
            <SegmentedControl
              value={cfg.iconPosition ?? "start"}
              onChange={(v) => patch({ iconPosition: v })}
              options={[
                { value: "start", label: "Start" },
                { value: "end", label: "End" },
              ]}
            />
          </Field>
        )}

        <Field label="Colour">
          <ColorPickerPopover
            label="Colour"
            value={cfg.color}
            onChange={(hex) => patch({ color: hex })}
            onClear={() => patch({ color: undefined })}
          />
        </Field>

        <Field label="Shape">
          <SegmentedControl
            value={cfg.shape ?? "rounded"}
            onChange={(v) => patch({ shape: v })}
            options={[
              { value: "rounded", label: "Rounded" },
              { value: "pill", label: "Pill" },
              { value: "sharp", label: "Sharp" },
            ]}
          />
        </Field>

        <Field label="Size">
          <SegmentedControl
            value={cfg.size ?? "md"}
            onChange={(v) => patch({ size: v })}
            options={[
              { value: "sm", label: "S" },
              { value: "md", label: "M" },
              { value: "lg", label: "L" },
              { value: "xl", label: "XL" },
            ]}
          />
        </Field>

        <Field label="Alignment">
          <SegmentedControl
            value={cfg.align ?? "left"}
            onChange={(v) => patch({ align: v })}
            options={ALIGN_OPTIONS}
          />
        </Field>

        <Field label="Full width">
          <SegmentedControl
            value={cfg.fullWidth ? "yes" : "no"}
            onChange={(v) => patch({ fullWidth: v === "yes" })}
            options={[
              { value: "no", label: "No" },
              { value: "yes", label: "Yes" },
            ]}
          />
        </Field>
      </div>

      <div className="pt-3 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
        <SubmitButtonView config={cfg} block />
      </div>
    </div>
  );
}
