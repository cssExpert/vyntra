"use client";

import React from "react";
import Select, {
  type StylesConfig,
  type GroupBase,
} from "react-select";

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  label?: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
}

// Themed to the app's CSS variables (HSL tokens from globals.css).
const selectStyles: StylesConfig<
  FilterSelectOption,
  false,
  GroupBase<FilterSelectOption>
> = {
  control: (base, state) => ({
    ...base,
    minHeight: "46px",
    backgroundColor: "hsl(var(--background))",
    borderColor: state.isFocused
      ? "hsl(var(--ring))"
      : "hsl(var(--border))",
    borderRadius: "0.5rem",
    boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--ring) / 0.2)" : "none",
    cursor: "pointer",
    transition: "all 0.15s ease",
    "&:hover": {
      borderColor: "hsl(var(--ring))",
    },
  }),
  valueContainer: (base) => ({ ...base, padding: "2px 12px" }),
  singleValue: (base) => ({
    ...base,
    color: "hsl(var(--foreground))",
    fontWeight: 600,
    fontSize: "0.875rem",
  }),
  placeholder: (base) => ({
    ...base,
    color: "hsl(var(--muted-foreground))",
    fontSize: "0.875rem",
  }),
  input: (base) => ({ ...base, color: "hsl(var(--foreground))" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
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
    borderRadius: "0.5rem",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    zIndex: 10000,
  }),
  menuPortal: (base) => ({ ...base, zIndex: 10000 }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
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
    fontSize: "0.875rem",
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
}: FilterSelectProps) {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <div>
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
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : undefined
        }
        menuPlacement="auto"
      />
    </div>
  );
}
