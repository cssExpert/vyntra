"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Settings, Check, Copy, Code2, Link2 } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FontPicker } from "@/components/editor/modals/CreateBrandKitModal";
import { loadGoogleFont } from "@/lib/googleFont";
import { resolveFormAppearance, type FormSettings } from "../forms.types";
import { CONTROL_H, CONTROL_BASE, SegmentedControl } from "./controls";

function Field({
  label,
  children,
  disabled,
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 transition-opacity",
        disabled && "opacity-40 pointer-events-none select-none",
      )}
    >
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      {children}
    </div>
  );
}

function CopyBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 pr-12 text-xs text-foreground font-mono whitespace-pre-wrap break-all">
        {code}
      </pre>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(code);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export interface FormSettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: FormSettings | null | undefined;
  onChange: (next: FormSettings) => void;
  slug: string;
  name: string;
}

export function FormSettingsModal({
  open,
  onClose,
  settings,
  onChange,
  slug,
  name,
}: FormSettingsModalProps) {
  const [tab, setTab] = useState<"appearance" | "embed">("appearance");
  useEffect(() => {
    if (open) setTab("appearance");
  }, [open]);

  const s: FormSettings = settings ?? {};

  // Load picked fonts so the preview renders them.
  useEffect(() => {
    loadGoogleFont(s.headerFont);
    loadGoogleFont(s.bodyFont);
  }, [s.headerFont, s.bodyFont]);
  const patch = (p: Partial<FormSettings>) => onChange({ ...s, ...p });
  const width = s.width ?? "fixed";
  const boxed = !!s.boxed;

  const appearance = resolveFormAppearance(s);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://your-site.com";
  const publicUrl = `${origin}/sites/YOUR_SITE/form/${slug}`;
  const iframeCode = `<iframe src="${publicUrl}" width="100%" height="720" style="border:0;border-radius:12px" title="${name || "Form"}" loading="lazy"></iframe>`;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Form settings"
      description="Control how this form looks and how it's embedded."
      icon={<Settings size={18} />}
      maxWidth="xl"
    >
      <div className="p-5 space-y-5">
        {/* Tabs */}
        <SegmentedControl
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            { value: "appearance", label: "Appearance" },
            { value: "embed", label: "Embed" },
          ]}
        />

        {tab === "appearance" ? (
          <div className="space-y-5">
            {/* Form width · Container · Max width · Box shadow — one row.
                Inactive controls dim in place so nothing shifts. */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-start">
              <Field label="Form width">
                <SegmentedControl
                  fullWidth
                  value={width}
                  onChange={(v) => patch({ width: v })}
                  options={[
                    { value: "fixed", label: "Fixed" },
                    { value: "full", label: "Full" },
                  ]}
                />
              </Field>

              <Field label="Container">
                <SegmentedControl
                  fullWidth
                  value={boxed ? "boxed" : "flat"}
                  onChange={(v) => patch({ boxed: v === "boxed" })}
                  options={[
                    { value: "flat", label: "Flat" },
                    { value: "boxed", label: "Boxed" },
                  ]}
                />
              </Field>

              <Field label="Max width (px)" disabled={width !== "fixed"}>
                <Input
                  type="number"
                  value={s.maxWidth ?? 576}
                  onChange={(e) =>
                    patch({ maxWidth: Number(e.target.value) || undefined })
                  }
                  className={cn(CONTROL_H, CONTROL_BASE, "w-full px-3")}
                />
              </Field>

              <Field label="Box shadow" disabled={!boxed}>
                <SegmentedControl
                  fullWidth
                  value={s.shadow ? "on" : "off"}
                  onChange={(v) => patch({ shadow: v === "on" })}
                  options={[
                    { value: "off", label: "None" },
                    { value: "on", label: "Shadow" },
                  ]}
                />
              </Field>
            </div>

            {/* Fonts — their own row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FontPicker
                label="Header font"
                value={s.headerFont ?? "Inter"}
                onChange={(v) => patch({ headerFont: v })}
              />
              <FontPicker
                label="Body font"
                value={s.bodyFont ?? "Inter"}
                onChange={(v) => patch({ bodyFont: v })}
              />
            </div>

            {/* Live preview */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Preview
              </p>
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div
                  className={cn("w-full", appearance.containerClass)}
                  style={{ ...appearance.containerStyle, maxWidth: 320 }}
                >
                  <p
                    className="text-lg font-bold text-foreground"
                    style={appearance.headerFontStyle}
                  >
                    {name || "Form title"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-foreground">
                    Email
                  </p>
                  <div className="mt-1 h-9 rounded-lg border border-border bg-background" />
                  <div className="mt-3 h-9 w-28 rounded-lg bg-primary" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <Field label={"Public link"}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link2 className="w-4 h-4 shrink-0" />
                <span className="truncate">{publicUrl}</span>
              </div>
              <CopyBox code={publicUrl} />
            </Field>

            <Field label="Embed (iframe)">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Code2 className="w-4 h-4 shrink-0" />
                Drop this into any page&apos;s HTML to embed the form.
              </div>
              <CopyBox code={iframeCode} />
            </Field>

            <p className="text-xs text-muted-foreground">
              Replace <code className="font-mono">YOUR_SITE</code> with your site&apos;s
              subdomain or connected domain. The form must be{" "}
              <strong>Published</strong> to load publicly.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
