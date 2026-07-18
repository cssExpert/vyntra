import type { CSSProperties } from "react";

export type FieldType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "email"
  | "number"
  | "date"
  | "rating"
  | "file"
  | "separator"
  | "password"
  | "image"
  | "button";

export type FormStatus = "Published" | "Draft" | "Closed";

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
  "long_text",
  "image",
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
