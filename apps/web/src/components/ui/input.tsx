"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md border border-border bg-background text-foreground shadow-xs outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      // Heights match the Button size scale so paired controls line up.
      size: {
        xs: "h-7 px-2.5 py-0.5 text-xs",
        sm: "h-8 px-3 py-1 text-xs",
        default: "h-9 px-3 py-1 text-sm",
        lg: "h-10 px-3.5 py-1.5 text-sm",
        xl: "h-11 px-4 py-3 text-md",
      },
    },
    defaultVariants: { size: "default" },
  },
);

export interface InputProps
  // Native `size` is a character-count number — replaced by the variant.
  extends
    Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, size, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(inputVariants({ size, className }))}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
