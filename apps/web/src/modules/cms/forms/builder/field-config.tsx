import {
  cloneElement,
  isValidElement,
  type ComponentType,
  type ReactElement,
} from "react";
import {
  Type,
  AlignLeft,
  Mail,
  Hash,
  Calendar,
  Star,
  Upload,
  Minus,
} from "lucide-react";
import Icon from "@/components/common/Icon";
import type { IconNames } from "@/components/common/Icons";
import { cn } from "@/lib/utils";

import { isChoiceField, type FieldType, type FormField } from "../forms.types";

/**
 * An icon slot accepts either a component reference (lucide icons, or any
 * component taking className) or a ready-made JSX element, e.g.
 * `icon: <Icon name="Logo" size="15" className="w-3.5 h-3.5" />`.
 */
export type FieldIcon = ComponentType<{ className?: string }> | ReactElement;

/**
 * Renders an icon slot with the caller's className (sizing/hover colors).
 * JSX elements get the context classes merged in via cn(), context winning
 * conflicts — so custom icons scale and tint per usage exactly like the
 * lucide component references do.
 */
export function renderFieldIcon(icon: FieldIcon, className?: string) {
  if (isValidElement<{ className?: string }>(icon)) {
    return cloneElement(icon, {
      className: cn(icon.props.className, className),
    });
  }
  // isValidElement doesn't narrow the else branch, so assert the remainder.
  const IconComponent = icon as ComponentType<{ className?: string }>;
  return <IconComponent className={className} />;
}

/** Wraps a custom Icon name so it adapts to the caller's className. */
export function customIcon(name: IconNames): FieldIcon {
  const CustomIcon = ({ className }: { className?: string }) => (
    <Icon name={name} className={className} />
  );
  CustomIcon.displayName = `CustomIcon(${name})`;
  return CustomIcon;
}

export interface FieldTypeMeta {
  type: FieldType;
  label: string;
  hint: string;
  icon: FieldIcon;
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  {
    type: "short_text",
    label: "Short answer",
    hint: "Single line of text",
    icon: Type,
  },
  {
    type: "long_text",
    label: "Text",
    hint: "Formatted text / heading block",
    icon: AlignLeft,
  },
  {
    type: "multiple_choice",
    label: "Multiple choice",
    hint: "Pick one option",
    icon: (
      <Icon
        name="Radio"
        size="14"
        className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors"
      />
    ),
  },
  {
    type: "checkboxes",
    label: "Checkboxes",
    hint: "Pick many options",
    icon: (
      <Icon
        name="Checkbox"
        size="14"
        className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors"
      />
    ),
  },
  {
    type: "dropdown",
    label: "Dropdown",
    hint: "Select from a list",
    icon: (
      <Icon
        name="SelectDropdown"
        size="14"
        className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors"
      />
    ),
  },
  { type: "email", label: "Email", hint: "Validated email input", icon: Mail },
  { type: "number", label: "Number", hint: "Numeric input", icon: Hash },
  { type: "date", label: "Date", hint: "Date picker", icon: Calendar },
  { type: "rating", label: "Rating", hint: "1-5 star scale", icon: Star },
  {
    type: "file",
    label: "File upload",
    hint: "Attach a document",
    icon: Upload,
  },
  {
    type: "separator",
    label: "Separator",
    hint: "Horizontal divider line",
    icon: Minus,
  },
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
