"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props} />
));
FieldGroup.displayName = "FieldGroup";

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical";
  }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex gap-1.5",
      orientation === "horizontal" ? "flex-row items-center" : "flex-col",
      className,
    )}
    {...props}
  />
));
Field.displayName = "Field";

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-foreground",
      className,
    )}
    {...props}
  />
));
FieldLabel.displayName = "FieldLabel";

export { Field, FieldGroup, FieldLabel };
