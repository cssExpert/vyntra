"use client";

import { MousePointerClick } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SubmitButtonConfig } from "../forms.types";
import { SubmitButtonView, SUBMIT_ICON_OPTIONS } from "../SubmitButtonView";
import { ColorPickerPopover } from "./ColorPickerPopover";
import { CONTROL_H, CONTROL_BASE, SegmentedControl, ALIGN_OPTIONS } from "./controls";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5 shrink-0", className)}>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      {children}
    </div>
  );
}

export function SubmitButtonEditor({
  value,
  onChange,
}: {
  value?: SubmitButtonConfig | null;
  onChange: (next: SubmitButtonConfig) => void;
}) {
  const cfg: SubmitButtonConfig = value ?? {};
  const patch = (p: Partial<SubmitButtonConfig>) => onChange({ ...cfg, ...p });
  const icon = cfg.icon ?? "none";

  return (
    <div className="bg-card border border-border rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
        <MousePointerClick className="w-4 h-4 text-primary" />
        Submit button
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Label" className="flex-1 min-w-[110px]">
          <Input
            value={cfg.label ?? ""}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder="Submit"
            className={cn(CONTROL_H, CONTROL_BASE, "w-full px-3 placeholder:text-muted-foreground/50")}
          />
        </Field>

        <Field label="Icon">
          <select
            value={icon}
            onChange={(e) =>
              patch({ icon: e.target.value as SubmitButtonConfig["icon"] })
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

        <Field label="Button">
          <SegmentedControl
            value={cfg.hidden ? "hidden" : "shown"}
            onChange={(v) => patch({ hidden: v === "hidden" })}
            options={[
              { value: "shown", label: "Show" },
              { value: "hidden", label: "Hide" },
            ]}
          />
        </Field>
      </div>

      {/* Live preview */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
        <SubmitButtonView config={cfg} block />
      </div>
    </div>
  );
}
