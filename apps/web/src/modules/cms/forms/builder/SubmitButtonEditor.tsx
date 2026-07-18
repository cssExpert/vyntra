"use client";

import { useState } from "react";
import { MousePointerClick, Settings2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5">
      {/* Header row — title + collapsed summary + configure toggle */}
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MousePointerClick className="w-4 h-4 text-primary" />
          Submit button
        </p>

        <div className="flex items-center gap-3 min-w-0">
          {!open && (
            <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[180px]">
              {cfg.hidden ? "Hidden" : cfg.label?.trim() || "Submit"}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition shrink-0",
              open
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/30",
            )}
          >
            <Settings2
              className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-90")}
            />
            {open ? "Done" : "Configure"}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="config"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-end gap-3 pt-4">
              <Field label="Label" className="flex-1 min-w-[110px]">
                <Input
                  value={cfg.label ?? ""}
                  onChange={(e) => patch({ label: e.target.value })}
                  placeholder="Submit"
                  className={cn(
                    CONTROL_H,
                    CONTROL_BASE,
                    "w-full px-3 placeholder:text-muted-foreground/50",
                  )}
                />
              </Field>

              <Field label="Icon">
                <select
                  value={icon}
                  onChange={(e) =>
                    patch({ icon: e.target.value as SubmitButtonConfig["icon"] })
                  }
                  className={cn(
                    CONTROL_H,
                    CONTROL_BASE,
                    "px-2.5 text-xs font-medium cursor-pointer",
                  )}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible live button preview — below the controls */}
      <div className={cn("mt-4", open && "pt-4 border-t border-border")}>
        {cfg.hidden ? (
          <p className="text-xs italic text-muted-foreground">
            Submit button is hidden.
          </p>
        ) : (
          <SubmitButtonView config={cfg} block />
        )}
      </div>
    </div>
  );
}
