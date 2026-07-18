"use client";

import React from "react";
import Select, {
  components,
  type StylesConfig,
  type GroupBase,
  type DropdownIndicatorProps,
} from "react-select";
import { ChevronDown } from "lucide-react";

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectGroup {
  label: string;
  options: FilterSelectOption[];
}

export interface FilterSelectProps {
  label?: string;
  value: string;
  /** Flat options, or grouped options with category headers. */
  options: FilterSelectOption[] | FilterSelectGroup[];
  onChange: (value: string) => void;
  placeholder?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  /** Wrapper className (e.g. to constrain width). */
  className?: string;
}

/** Slimmer, thinner chevron than react-select's default filled caret. */
function DropdownIndicator(
  props: DropdownIndicatorProps<FilterSelectOption, false>,
) {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown size={15} strokeWidth={2} />
    </components.DropdownIndicator>
  );
}

/** Flattens flat/grouped options to look up the selected option by value. */
function flattenOptions(
  options: FilterSelectOption[] | FilterSelectGroup[],
): FilterSelectOption[] {
  return options.flatMap((o) => ("options" in o ? o.options : [o]));
}

// Themed to the app's CSS variables (HSL tokens from globals.css).
const selectStyles: StylesConfig<
  FilterSelectOption,
  false,
  GroupBase<FilterSelectOption>
> = {
  control: (base, state) => ({
    ...base,
    minHeight: "38px",
    backgroundColor: "hsl(var(--background))",
    borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--border))",
    borderRadius: "0.5rem",
    boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--ring) / 0.2)" : "none",
    cursor: "pointer",
    transition: "all 0.15s ease",
    "&:hover": {
      borderColor: "hsl(var(--ring))",
    },
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 8px" }),
  singleValue: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
    fontWeight: 500,
    fontSize: "0.75rem",
  }),
  placeholder: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    fontWeight: 500,
    fontSize: "0.75rem",
  }),
  // Match the typed search text to the selected value (same size/weight/colour).
  input: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
    fontWeight: 500,
    fontSize: "0.75rem",
    margin: 0,
    padding: 0,
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: "0 8px",
    color: "hsl(var(--muted-foreground))",
    "&:hover": { color: "hsl(var(--foreground))" },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    "&:hover": { color: "hsl(var(--foreground))" },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.375rem",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    zIndex: 10000,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 10000 }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "pointer",
    color: state.isSelected
      ? "hsl(var(--primary-foreground))"
      : "hsl(var(--foreground))",
    backgroundColor: state.isSelected
      ? "hsl(var(--primary))"
      : state.isFocused
        ? "hsl(var(--muted))"
        : "transparent",
    "&:active": {
      backgroundColor: state.isSelected
        ? "hsl(var(--primary))"
        : "hsl(var(--muted))",
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    fontSize: "0.75rem",
  }),
};

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  isClearable = false,
  isSearchable = false,
  className,
}: FilterSelectProps) {
  const selected = flattenOptions(options).find((o) => o.value === value) ?? null;

  return (
    <div className={className}>
      {label && (
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      )}
      <Select<FilterSelectOption, false>
        value={selected}
        options={options}
        onChange={(opt) => onChange(opt?.value ?? "")}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        styles={selectStyles}
        components={{ DropdownIndicator }}
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : undefined
        }
        menuPlacement="auto"
      />
    </div>
  );
}
