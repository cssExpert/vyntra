import type { CSSProperties } from "react";

export type FieldType =
  | "short_text"
  | "long_text"
  | "textarea"
  | "phone"
  | "toggle"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "multiselect"
  | "autocomplete"
  | "email"
  | "number"
  | "date"
  | "time"
  | "datetime"
  | "month"
  | "year"
  | "rating"
  | "slider"
  | "nps"
  | "emoji"
  | "file"
  | "separator"
  | "spacer"
  | "password"
  | "image"
  | "card_preview"
  | "accordion"
  | "tabs"
  | "button";

/**
 * Visual style for choice fields (multiple_choice / checkboxes):
 * - "list"      — bordered radio/checkbox rows (default)
 * - "pills"     — compact rounded buttons
 * - "segmented" — a connected segmented control (single-select)
 * - "cards"     — option cards with an optional detail line (e.g. a price)
 * - "terms"     — plain inline checkbox(es) with no box and no question label,
 *                 for a consent / "I agree to the Terms" statement
 */
export type ChoiceStyle = "list" | "pills" | "segmented" | "cards" | "terms";

/**
 * Input mask applied to text-like fields as the respondent types:
 * - "card"   — "1234 5678 9012 3456"
 * - "expiry" — "MM/YY"
 * - "cvc"    — up to 4 digits
 * - "phone"  — grouped phone number
 */
export type FieldMask = "none" | "card" | "expiry" | "cvc" | "phone";

export type FormStatus = "Published" | "Draft" | "Closed";

/**
 * Field width within the form's responsive 12-column grid. Fields flow left to
 * right and wrap, so two "half" fields share a row, a "full" field takes its
 * own, etc. All widths collapse to full-width on small screens.
 */
export type FieldWidth = "full" | "half" | "third" | "twoThirds";

/** Tailwind column-span class for a field width (12-col grid, sm+ breakpoint). */
export function fieldColSpan(width?: FieldWidth): string {
  switch (width) {
    case "half":
      return "sm:col-span-6";
    case "third":
      return "sm:col-span-4";
    case "twoThirds":
      return "sm:col-span-8";
    default:
      return "sm:col-span-12";
  }
}

/**
 * Leading icon for an input field (short answer, email, number, date). Rendered
 * inside the input on its left edge. "none" (or unset) shows no icon. The name →
 * component map lives in `field-icons.tsx`.
 */
export type FormFieldIcon =
  | "none"
  | "user"
  | "mail"
  | "phone"
  | "building"
  | "mapPin"
  | "home"
  | "globe"
  | "link"
  | "calendar"
  | "clock"
  | "lock"
  | "creditCard"
  | "hash"
  | "dollar"
  | "atSign"
  | "briefcase"
  | "tag"
  | "search"
  | "message";

export type SubmitButtonIcon =
  | "none"
  | "arrow"
  | "send"
  | "check"
  | "sparkles"
  | "spinner"
  | "google"
  | "apple"
  | "github"
  | "linkedin"
  | "twitter";

/** A placeable button field — the submit config plus a link + visual style. */
export interface ButtonFieldConfig extends SubmitButtonConfig {
  /** Optional link. When set the button navigates instead of submitting. */
  href?: string;
  /** Visual style. */
  style?: "solid" | "outline" | "link";
}

export interface SubmitButtonConfig {
  /** Button text. Defaults to "Submit". */
  label?: string;
  /** Background colour (hex). Defaults to the theme primary. */
  color?: string;
  /** Horizontal alignment of the button within the form. */
  align?: "left" | "center" | "right";
  /** Leading/trailing glyph. */
  icon?: SubmitButtonIcon;
  /** Whether the icon sits before or after the label. */
  iconPosition?: "start" | "end";
  /** Stretch the button to the full width of the form. */
  fullWidth?: boolean;
  /** Corner style — rounded (default), pill, or sharp. */
  shape?: "rounded" | "pill" | "sharp";
  /** Hide the form's built-in submit button (compose buttons as fields instead). */
  hidden?: boolean;
}

/**
 * A titled group of fields inside a container field (accordion / tabs). Nesting
 * is one level deep — a section's fields are leaf/simple fields, not containers.
 */
export interface FieldSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  /** Only used by choice fields (multiple_choice / checkboxes / dropdown). */
  options: string[];
  /**
   * Option layout for multiple_choice / checkboxes — "stacked" (one per row,
   * default) or "inline" (wrapped in a row). Ignored by other field types.
   */
  optionsLayout?: "stacked" | "inline";
  /**
   * HTML authored in the builder for the Paragraph content block — the main
   * paragraph. (Its smaller sub-text is stored in `placeholder` as HTML.)
   */
  content?: string;
  /** Separator only — line/rule colour (hex). Falls back to the theme border. */
  lineColor?: string;
  /** Separator only — centered label text colour (hex). */
  textColor?: string;
  /** Image block only — image URL. */
  imageUrl?: string;
  /** Image block only — alt text. */
  imageAlt?: string;
  /** Image block / button — horizontal alignment. */
  align?: "left" | "center" | "right";
  /** Image block only — rendered width in px (auto when unset). */
  imageWidth?: number;
  /** Button field only — label/link/style/icon/colour config. */
  button?: ButtonFieldConfig;
  /** Password field only — show the show/hide (eye) toggle. Defaults to true. */
  passwordToggle?: boolean;
  /** Leading icon for text-like inputs (short answer / email / number / date). */
  icon?: FormFieldIcon;
  /** Width within the form's 12-column grid (default "full"). */
  width?: FieldWidth;
  /** Choice fields only — visual style (list / pills / segmented / cards). */
  choiceStyle?: ChoiceStyle;
  /** Choice fields in "cards" style — optional detail line per option (e.g. a
   *  price), aligned by index with `options`. */
  optionDetails?: string[];
  /** Single-choice fields — reveal a free-text input when the trigger option is
   *  picked (e.g. an "Other"/"Custom" amount). */
  allowCustom?: boolean;
  /** The option label that reveals the custom input (default "Custom"). */
  customOption?: string;
  /** Label shown above the revealed custom input (e.g. "Custom Amount ($)"). */
  customLabel?: string;
  /** Placeholder for the revealed custom input. */
  customPlaceholder?: string;
  /** Slider only — range bounds and step (default 0 / 100 / 1). */
  min?: number;
  max?: number;
  step?: number;
  /** Spacer only — vertical height in px (default 24). */
  spacerHeight?: number;
  /** Input mask for text-like fields (card / expiry / cvc / phone). */
  mask?: FieldMask;
  /** Container fields (accordion / tabs) — the grouped, collapsible sections. */
  sections?: FieldSection[];
  /** Accordion visual style — boxed cards (default) or flush FAQ-style rows. */
  accordionStyle?: "boxed" | "flush";
  /** Container fields — font weight of the section / tab trigger text. */
  triggerWeight?: "bold" | "normal";
  /** Container fields — font weight of nested field labels. */
  labelWeight?: "bold" | "normal";
}

/** Tailwind class overriding nested field label weight inside a container. */
export function labelWeightClass(weight?: "bold" | "normal"): string {
  return weight === "normal" ? "[&_label]:font-normal" : "[&_label]:font-semibold";
}

/** Container field types that hold nested {@link FieldSection}s. */
export const CONTAINER_FIELD_TYPES: FieldType[] = ["accordion", "tabs"];

export function isContainerField(type: FieldType): boolean {
  return CONTAINER_FIELD_TYPES.includes(type);
}

/**
 * Flattens a field tree into its value-bearing leaf fields — recurses into
 * container sections so form value init / validation / submission see every
 * nested input. Container fields themselves are omitted.
 */
export function flattenFields(fields: FormField[]): FormField[] {
  const out: FormField[] = [];
  for (const f of fields) {
    if (isContainerField(f.type) && f.sections) {
      for (const s of f.sections) out.push(...flattenFields(s.fields));
    } else {
      out.push(f);
    }
  }
  return out;
}

// ── Form-level appearance settings ───────────────────────────────────────────

export interface FormSettings {
  /** "fixed" = centered column of `maxWidth`; "full" = stretch to container. */
  width?: "full" | "fixed";
  /** Column width in px when width === "fixed". */
  maxWidth?: number;
  /** Wrap the form in a card (boxed) or render flat. */
  boxed?: boolean;
  /** Drop shadow on the card (boxed only). */
  shadow?: boolean;
  /** Google font name for the title & field labels (e.g. "Raleway"). */
  headerFont?: string;
  /** Google font name for body text & inputs (e.g. "Inter"). */
  bodyFont?: string;
}

/**
 * Font styles for a form scope. Sets the body font + exposes CSS variables that
 * `.form-fonts` CSS uses to font headings vs body. Apply together with the
 * `form-fonts` class on the container.
 */
/** Just the `--form-*-font` CSS variables (no `font-family` on the element). */
export function formFontVars(settings?: FormSettings | null): CSSProperties {
  const s = settings ?? {};
  const style: Record<string, string> = {};
  if (s.headerFont) style["--form-heading-font"] = `'${s.headerFont}', sans-serif`;
  if (s.bodyFont) style["--form-body-font"] = `'${s.bodyFont}', sans-serif`;
  return style as CSSProperties;
}

export function formFontStyle(settings?: FormSettings | null): CSSProperties {
  const s = settings ?? {};
  return {
    fontFamily: s.bodyFont ? `'${s.bodyFont}', sans-serif` : undefined,
    ...formFontVars(s),
  };
}

/** Resolves settings (with sensible defaults) into ready-to-apply style props. */
export function resolveFormAppearance(settings?: FormSettings | null): {
  containerClass: string;
  containerStyle: CSSProperties;
  headerFontStyle: CSSProperties;
} {
  const s = settings ?? {};
  const boxed = !!s.boxed;
  const shadow = !!s.shadow;
  const width = s.width ?? "fixed";
  const maxWidth = width === "full" ? undefined : s.maxWidth ?? 576;

  const containerClass = boxed
    ? `bg-card border border-border rounded-2xl p-6 sm:p-8${shadow ? " shadow-xl" : ""}`
    : "";

  return {
    containerClass,
    containerStyle: {
      ...formFontStyle(s),
      maxWidth,
      marginLeft: "auto",
      marginRight: "auto",
    },
    headerFontStyle: s.headerFont
      ? { fontFamily: `'${s.headerFont}', sans-serif` }
      : {},
  };
}

export interface CmsForm {
  id: string;
  name: string;
  description: string;
  slug: string;
  status: FormStatus;
  fields: FormField[];
  captchaEnabled: boolean;
  submitButton?: SubmitButtonConfig | null;
  settings?: FormSettings | null;
  responses: number;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export const CHOICE_FIELD_TYPES: FieldType[] = [
  "multiple_choice",
  "checkboxes",
  "dropdown",
  "multiselect",
  "autocomplete",
];

export function isChoiceField(type: FieldType): boolean {
  return CHOICE_FIELD_TYPES.includes(type);
}

/**
 * Layout/display fields carry no input — they are purely visual (a separator
 * line, or the Paragraph rich-text content block). They are skipped by value
 * collection and validation.
 */
export const LAYOUT_FIELD_TYPES: FieldType[] = [
  "separator",
  "spacer",
  "long_text",
  "image",
  "card_preview",
  "accordion",
  "tabs",
  "button",
];

export function isLayoutField(type: FieldType): boolean {
  return LAYOUT_FIELD_TYPES.includes(type);
}

/**
 * True when authored rich-text HTML has visible text/content. Rich editors emit
 * "<p></p>" for empty input, so a plain truthiness check isn't enough.
 */
export function htmlHasContent(html?: string): boolean {
  if (!html) return false;
  const text = html
    .replace(/<(img|hr|br)[^>]*>/gi, "x") // self-contained visual tags count
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text.length > 0;
}
