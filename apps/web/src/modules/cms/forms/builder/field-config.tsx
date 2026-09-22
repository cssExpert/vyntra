import {
  cloneElement,
  isValidElement,
  type ComponentType,
  type ReactElement,
} from "react";
import {
  Type,
  Mail,
  Hash,
  Calendar,
  Star,
  Upload,
  Minus,
  Lock,
  Image as ImageIcon,
  SquareMousePointer,
  TextCursorInput,
  Phone,
  ToggleRight,
  Clock,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  SlidersHorizontal,
  MoveVertical,
  Pilcrow,
  Gauge,
  Smile,
  CreditCard,
  ListChecks,
  Search,
  Rows3,
  PanelTop,
} from "lucide-react";
import Icon from "@/components/common/Icon";
import type { IconNames } from "@/components/common/Icons";
import { cn } from "@/lib/utils";

import {
  isChoiceField,
  type FieldType,
  type FieldSection,
  type FormField,
} from "../forms.types";

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

/** Palette groupings shown in the field picker, in display order. */
export type FieldCategory =
  | "Basic"
  | "Choice"
  | "Date & Time"
  | "Media"
  | "Ratings"
  | "Layout"
  | "Buttons";

export const FIELD_CATEGORY_ORDER: FieldCategory[] = [
  "Basic",
  "Choice",
  "Date & Time",
  "Media",
  "Ratings",
  "Layout",
  "Buttons",
];

export interface FieldTypeMeta {
  type: FieldType;
  label: string;
  hint: string;
  icon: FieldIcon;
  category: FieldCategory;
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  {
    type: "short_text",
    label: "Short answer",
    hint: "Single line of text",
    icon: Type,
    category: "Basic",
  },
  {
    type: "textarea",
    label: "Textarea",
    hint: "Multi-line answer",
    icon: TextCursorInput,
    category: "Basic",
  },
  {
    type: "email",
    label: "Email",
    hint: "Validated email input",
    icon: Mail,
    category: "Basic",
  },
  {
    type: "phone",
    label: "Phone",
    hint: "Telephone number",
    icon: Phone,
    category: "Basic",
  },
  {
    type: "number",
    label: "Number",
    hint: "Numeric input",
    icon: Hash,
    category: "Basic",
  },
  {
    type: "password",
    label: "Password",
    hint: "Masked password input",
    icon: Lock,
    category: "Basic",
  },
  {
    type: "multiple_choice",
    label: "Multiple choice",
    hint: "Pick one option",
    category: "Choice",
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
    category: "Choice",
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
    category: "Choice",
    icon: (
      <Icon
        name="SelectDropdown"
        size="14"
        className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors"
      />
    ),
  },
  {
    type: "toggle",
    label: "Toggle",
    hint: "On / off switch",
    icon: ToggleRight,
    category: "Choice",
  },
  {
    type: "multiselect",
    label: "Multi-select",
    hint: "Pick several from a list",
    icon: ListChecks,
    category: "Choice",
  },
  {
    type: "autocomplete",
    label: "Autocomplete",
    hint: "Type to search options",
    icon: Search,
    category: "Choice",
  },
  { type: "date", label: "Date", hint: "Date picker", icon: Calendar, category: "Date & Time" },
  { type: "time", label: "Time", hint: "Time picker", icon: Clock, category: "Date & Time" },
  {
    type: "datetime",
    label: "Date & time",
    hint: "Date and time picker",
    icon: CalendarClock,
    category: "Date & Time",
  },
  {
    type: "month",
    label: "Month",
    hint: "Month picker",
    icon: CalendarDays,
    category: "Date & Time",
  },
  {
    type: "year",
    label: "Year",
    hint: "Four-digit year",
    icon: CalendarRange,
    category: "Date & Time",
  },
  {
    type: "file",
    label: "File upload",
    hint: "Attach a document",
    icon: Upload,
    category: "Media",
  },
  {
    type: "image",
    label: "Image",
    hint: "Logo or picture",
    icon: ImageIcon,
    category: "Media",
  },
  { type: "rating", label: "Rating", hint: "1-5 star scale", icon: Star, category: "Ratings" },
  {
    type: "slider",
    label: "Slider",
    hint: "Range slider",
    icon: SlidersHorizontal,
    category: "Ratings",
  },
  { type: "nps", label: "NPS", hint: "0–10 recommendation scale", icon: Gauge, category: "Ratings" },
  {
    type: "emoji",
    label: "Emoji scale",
    hint: "Emoji satisfaction rating",
    icon: Smile,
    category: "Ratings",
  },
  {
    type: "long_text",
    label: "Text block",
    hint: "Formatted text / heading block",
    icon: Pilcrow,
    category: "Layout",
  },
  {
    type: "separator",
    label: "Separator",
    hint: "Horizontal divider line",
    icon: Minus,
    category: "Layout",
  },
  {
    type: "spacer",
    label: "Spacer",
    hint: "Vertical spacing",
    icon: MoveVertical,
    category: "Layout",
  },
  {
    type: "card_preview",
    label: "Card preview",
    hint: "Decorative credit-card graphic",
    icon: CreditCard,
    category: "Layout",
  },
  {
    type: "accordion",
    label: "Accordion",
    hint: "Collapsible field sections",
    icon: Rows3,
    category: "Layout",
  },
  {
    type: "tabs",
    label: "Tabs",
    hint: "Fields grouped into tabs",
    icon: PanelTop,
    category: "Layout",
  },
  {
    type: "button",
    label: "Button",
    hint: "Link or social button",
    icon: SquareMousePointer,
    category: "Buttons",
  },
];

export function getFieldMeta(type: FieldType): FieldTypeMeta {
  return FIELD_TYPES.find((f) => f.type === type) ?? FIELD_TYPES[0];
}

/**
 * Tailwind classes that draw a tree for a field list — a vertical rail down the
 * left plus an L-shaped connector into each direct child card. Combine with the
 * list's own spacing (e.g. `cn("space-y-3", TREE_RAIL_CLASS)`). Child cards must
 * not clip (overflow-visible) so the connector shows.
 */
export const TREE_RAIL_CLASS =
  "relative pl-6 before:pointer-events-none before:absolute before:left-2 before:top-2 before:bottom-3 before:w-px before:bg-border before:content-[''] [&>*]:before:pointer-events-none [&>*]:before:absolute [&>*]:before:top-8 [&>*]:before:-left-4 [&>*]:before:h-px [&>*]:before:w-4 [&>*]:before:bg-border [&>*]:before:content-['']";

let fieldCounter = 0;

export function createField(type: FieldType): FormField {
  fieldCounter += 1;
  const field: FormField = {
    id: `fld_${Date.now()}_${fieldCounter}`,
    type,
    label: "",
    placeholder: "",
    helpText: "",
    required: false,
    options: isChoiceField(type) ? ["Option 1", "Option 2"] : [],
  };
  if (type === "accordion") {
    field.sections = [
      { id: `sec_${Date.now()}_${fieldCounter}`, title: "Section 1", fields: [] },
    ];
  }
  if (type === "tabs") {
    field.sections = [
      { id: `sec_${Date.now()}_${fieldCounter}a`, title: "Tab 1", fields: [] },
      { id: `sec_${Date.now()}_${fieldCounter}b`, title: "Tab 2", fields: [] },
    ];
  }
  return field;
}

let sectionCounter = 0;

/** Creates an empty {@link FieldSection} with a unique id. */
export function createSection(title: string): FieldSection {
  sectionCounter += 1;
  return { id: `sec_${Date.now()}_${sectionCounter}`, title, fields: [] };
}
