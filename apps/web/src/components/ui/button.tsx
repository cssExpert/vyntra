"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      // ── Colour ───────────────────────────────────────────────────────
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-600",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        muted: "bg-muted text-foreground hover:bg-muted/70",
        outline:
          "border border-border bg-background hover:bg-muted hover:text-foreground",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        destructive: "bg-rose-600 text-white hover:bg-rose-700",
        success: "bg-emerald-600 text-white hover:bg-emerald-700",
      },
      // ── Size ─────────────────────────────────────────────────────────
      size: {
        xs: "h-7 px-2.5 text-xs [&_svg]:size-3",
        sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
        md: "h-[2.5rem] px-3.5 text-sm [&_svg]:size-4",
        default: "h-10 px-4 py-2.5",
        lg: "h-10 px-6",
        xl: "h-11 px-7 text-base",
        icon: "h-9 w-9",
      },
      // ── Radius — controlled by the parent ────────────────────────────
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
      },
      // ── Active / selected state (tabs, filter pills, toggles) ────────
      active: {
        true: "",
        false: "",
      },
    },
    // How each colour variant looks while active
    compoundVariants: [
      { variant: "default", active: true, className: "bg-primary-600" },
      { variant: "secondary", active: true, className: "bg-secondary/80" },
      {
        variant: "muted",
        active: true,
        className:
          "bg-primary text-primary-foreground hover:bg-primary-600 hover:text-primary-foreground shadow-sm",
      },
      {
        variant: "outline",
        active: true,
        className:
          "border-primary bg-primary text-primary-foreground hover:bg-primary-600 hover:text-primary-foreground",
      },
      {
        variant: "ghost",
        active: true,
        className:
          "bg-primary text-primary-foreground hover:bg-primary-600 hover:text-primary-foreground shadow-sm",
      },
      { variant: "link", active: true, className: "underline" },
      { variant: "destructive", active: true, className: "bg-rose-700" },
      { variant: "success", active: true, className: "bg-emerald-700" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "md",
      active: false,
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Icon rendered before the label. Ignored while `loading`. */
  startIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  endIcon?: React.ReactNode;
  /** Shows a spinner (replacing the start icon) and disables the button. */
  loading?: boolean;
  /** Optional label shown instead of children while loading. */
  loadingText?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      radius,
      active = false,
      asChild = false,
      startIcon,
      endIcon,
      loading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      buttonVariants({ variant, size, radius, active, className }),
    );

    // Slot requires a single child — icon/loading decoration only applies
    // to the plain <button> form.
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={classes}
          data-active={active || undefined}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-pressed={active || undefined}
        data-active={active || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" aria-hidden /> : startIcon}
        {loading && loadingText !== undefined ? loadingText : children}
        {!loading && endIcon}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
