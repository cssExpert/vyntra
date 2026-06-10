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
  | "file";

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
}

export interface CmsForm {
  id: string;
  name: string;
  description: string;
  slug: string;
  status: FormStatus;
  fields: FormField[];
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
