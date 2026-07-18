import { cn } from "@/lib/utils";
import type { FormField } from "./forms.types";

function alignClass(align?: FormField["align"]) {
  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
}

/** Renders an image block from a field's imageUrl/alt/width/align. */
export function FormImage({ field }: { field: FormField }) {
  const url = field.imageUrl?.trim();
  if (!url) return null;
  return (
    <div className={cn("flex", alignClass(field.align))}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={field.imageAlt ?? ""}
        style={field.imageWidth ? { width: field.imageWidth } : undefined}
        className="max-w-full h-auto rounded-md object-contain"
      />
    </div>
  );
}
