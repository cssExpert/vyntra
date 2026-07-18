import type { ReactNode } from "react";
import { MoveRight, MoveLeft, Send, Check, Sparkles, Loader2 } from "lucide-react";
import Icon from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import type { ButtonFieldConfig, SubmitButtonIcon } from "./forms.types";

const ICON_CLS = "w-4 h-4 shrink-0";

/** Glyph for each icon option (spinner/arrow are resolved at render time). */
const ICON_NODE: Record<SubmitButtonIcon, ReactNode> = {
  none: null,
  arrow: <MoveRight className={ICON_CLS} />,
  send: <Send className={ICON_CLS} />,
  check: <Check className={ICON_CLS} />,
  sparkles: <Sparkles className={ICON_CLS} />,
  spinner: <Loader2 className={cn(ICON_CLS, "animate-spin")} />,
  google: <Icon name="Google" className={ICON_CLS} />,
  apple: <Icon name="Apple" className={ICON_CLS} />,
  github: <Icon name="GitHub" className={ICON_CLS} />,
  linkedin: <Icon name="LinkedIn" className={ICON_CLS} />,
  twitter: <Icon name="TwitterX" className={ICON_CLS} />,
};

/** Options for the button/submit editor's icon dropdown. */
export const SUBMIT_ICON_OPTIONS: { value: SubmitButtonIcon; label: string }[] = [
  { value: "none", label: "No icon" },
  { value: "arrow", label: "Arrow" },
  { value: "send", label: "Send" },
  { value: "check", label: "Check" },
  { value: "sparkles", label: "Sparkles" },
  { value: "spinner", label: "Loading spinner" },
  { value: "google", label: "Google" },
  { value: "apple", label: "Apple" },
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "X / Twitter" },
];

function alignClass(align?: ButtonFieldConfig["align"]) {
  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
}

export interface SubmitButtonViewProps {
  config?: ButtonFieldConfig | null;
  /** Shows a spinner and disables the button (form is submitting). */
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  /** Wrap in a full-width row honouring the configured alignment. */
  block?: boolean;
}

/**
 * Renders a form button from its config — label, colour, style (solid/outline/
 * link), an optional leading/trailing icon (plain, social, spinner or arrow),
 * and an optional link. Used for both the form's submit button and the
 * placeable Button field.
 */
export function SubmitButtonView({
  config,
  loading = false,
  loadingLabel,
  disabled = false,
  onClick,
  type = "button",
  block = false,
}: SubmitButtonViewProps) {
  const iconKey = config?.icon ?? "none";
  const position = config?.iconPosition ?? "start";
  const style = config?.style ?? "solid";
  const color = config?.color;
  const fullWidth = config?.fullWidth ?? false;
  const href = config?.href?.trim();
  const label = loading
    ? loadingLabel ?? config?.label?.trim() ?? "Submit"
    : config?.label?.trim() || "Submit";

  let glyph = loading ? ICON_NODE.spinner : ICON_NODE[iconKey];
  // Arrow follows the icon position: points left at the start, right at the end.
  if (!loading && iconKey === "arrow") {
    glyph =
      position === "start" ? (
        <MoveLeft className={ICON_CLS} />
      ) : (
        <MoveRight className={ICON_CLS} />
      );
  }

  const isSolid = style === "solid";
  const isOutline = style === "outline";
  const isLink = style === "link";

  const styleClasses = isSolid
    ? "text-white shadow-sm"
    : isOutline
      ? "bg-background border border-border text-foreground hover:bg-muted shadow-sm"
      : "text-primary hover:underline";

  // Custom colour drives the background for solid buttons, the text otherwise.
  const inlineStyle = color
    ? isSolid
      ? { backgroundColor: color }
      : { color }
    : undefined;

  const radius = config?.shape ?? "rounded";
  const radiusCls =
    radius === "pill" ? "rounded-full" : radius === "sharp" ? "rounded-none" : "rounded-lg";
  const shape = isLink ? "" : `${radiusCls} px-6 py-2.5`;
  const width = fullWidth ? "w-full justify-center" : "";

  const inner = (
    <>
      {glyph && position === "start" && glyph}
      <span>{label}</span>
      {glyph && position === "end" && glyph}
    </>
  );

  const commonCls = cn(
    "inline-flex items-center gap-2 text-sm font-semibold transition active:scale-95 disabled:opacity-70",
    shape,
    styleClasses,
    isSolid && !color && "bg-primary hover:bg-primary/90",
    width,
  );

  const control =
    href && !loading ? (
      <a href={href} onClick={onClick} style={inlineStyle} className={commonCls}>
        {inner}
      </a>
    ) : (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        style={inlineStyle}
        className={commonCls}
      >
        {inner}
      </button>
    );

  if (!block) return control;
  return (
    <div className={cn("flex", fullWidth ? "" : alignClass(config?.align))}>
      {control}
    </div>
  );
}
