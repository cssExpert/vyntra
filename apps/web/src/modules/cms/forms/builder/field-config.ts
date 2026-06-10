import {
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  List,
  Mail,
  Hash,
  Calendar,
  Star,
  Upload,
  type LucideIcon,
} from "lucide-react";

import { isChoiceField, type FieldType, type FormField } from "../forms.types";

export interface FieldTypeMeta {
  type: FieldType;
  label: string;
  hint: string;
  icon: LucideIcon;
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  { type: "short_text", label: "Short answer", hint: "Single line of text", icon: Type },
  { type: "long_text", label: "Paragraph", hint: "Long form text", icon: AlignLeft },
  { type: "multiple_choice", label: "Multiple choice", hint: "Pick one option", icon: CircleDot },
  { type: "checkboxes", label: "Checkboxes", hint: "Pick many options", icon: CheckSquare },
  { type: "dropdown", label: "Dropdown", hint: "Select from a list", icon: List },
  { type: "email", label: "Email", hint: "Validated email input", icon: Mail },
  { type: "number", label: "Number", hint: "Numeric input", icon: Hash },
  { type: "date", label: "Date", hint: "Date picker", icon: Calendar },
  { type: "rating", label: "Rating", hint: "1–5 star scale", icon: Star },
  { type: "file", label: "File upload", hint: "Attach a document", icon: Upload },
];

export function getFieldMeta(type: FieldType): FieldTypeMeta {
  return FIELD_TYPES.find((f) => f.type === type) ?? FIELD_TYPES[0];
}

let fieldCounter = 0;

export function createField(type: FieldType): FormField {
  fieldCounter += 1;
  return {
    id: `fld_${Date.now()}_${fieldCounter}`,
    type,
    label: "",
    placeholder: "",
    helpText: "",
    required: false,
    options: isChoiceField(type) ? ["Option 1", "Option 2"] : [],
  };
}
