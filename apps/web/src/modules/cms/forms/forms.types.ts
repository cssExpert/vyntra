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
  | "separator";

export type FormStatus = "Published" | "Draft" | "Closed";

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
}

export interface CmsForm {
  id: string;
  name: string;
  description: string;
  slug: string;
  status: FormStatus;
  fields: FormField[];
  captchaEnabled: boolean;
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
export const LAYOUT_FIELD_TYPES: FieldType[] = ["separator", "long_text"];

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
