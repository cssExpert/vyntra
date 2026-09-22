"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { inputVariants } from "@/components/ui/input";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Wrapper className. */
  className?: string;
  /** Extra classes for the input element. */
  inputClassName?: string;
  size?: VariantProps<typeof inputVariants>["size"];
  autoFocus?: boolean;
}

/**
 * Reusable search box — a text input with a leading search icon and a clear (×)
 * button that appears once there's a query. Controlled via `value`/`onChange`.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
  inputClassName,
  size = "default",
  autoFocus,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
        <Search size={14} />
      </span>
      <Input
        type="text"
        size={size}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-9", value && "pr-9", inputClassName)}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 h-full w-8 text-muted-foreground hover:text-foreground"
        >
          <X size={13} />
        </Button>
      )}
    </div>
  );
}
